import React, { Suspense, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { intersection } from 'lodash/fp';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import {
  QuestionWithParameters,
  SearchConfig,
  TreeBoxVocabNode,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import WdkService from '@veupathdb/wdk-client/lib/Service/WdkService';
import { Step } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { requestUpdateStepSearchConfig } from '@veupathdb/wdk-client/lib/Actions/StrategyActions';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import CheckboxTree, {
  LinksPosition,
} from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import {
  mapStructure,
  pruneDescendantNodes,
} from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { ResultType } from '@veupathdb/wdk-client/lib/Utils/WdkResult';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import {
  areTermsInString,
  makeSearchHelpText,
} from '@veupathdb/wdk-client/lib/Utils/SearchUtils';
import { useWdkServiceWithRefresh } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { makeCommonErrorMessage } from '@veupathdb/wdk-client/lib/Utils/Errors';

import { pruneNodesWithSingleExtendingChild } from '@veupathdb/web-common/lib/util/organisms';

import {
  ORGANISM_PROPERTIES_KEY,
  SHOW_ONLY_PREFERRED_ORGANISMS_PROPERTY,
} from '@veupathdb/preferred-organisms/lib/components/OrganismParam';

import {
  usePreferredOrganismsEnabledState,
  usePreferredOrganismsState,
} from '@veupathdb/preferred-organisms/lib/hooks/preferredOrganisms';

import { useReferenceStrains } from '@veupathdb/preferred-organisms/lib/hooks/referenceStrains';

import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';

import './OrganismFilter.scss';

const cx = makeClassNameHelper('OrganismFilter');

// constants for service calls
const ALLOWABLE_RECORD_CLASS_NAME = 'transcript';
const TAXON_QUESTION_NAME = 'GenesByTaxon';
const ORGANISM_PARAM_NAME = 'organism';
const ORGANISM_COLUMN_NAME = 'organism_full';
const HISTOGRAM_REPORTER_NAME = 'byValue';
const HISTOGRAM_FILTER_NAME = 'byValue';

// session storage prop name to hold filter pane expansion preference
const ORGANISM_FILTER_PANE_EXPANSION_KEY = 'defaultOrganismFilterPaneExpansion';

// initial values for component state
const DEFAULT_PANE_EXPANSION = true;
const DEFAULT_HIDE_ZEROES = false;

const TITLE = 'Organism Filter';

// props passed into this component by caller
type OwnProps = {
  resultType: ResultType;
};

// configured action creators provided by connect
type DispatchProps = {
  requestUpdateStepSearchConfig: typeof requestUpdateStepSearchConfig;
};

// props actually passed to the component below after connect translation
type Props = OwnProps & DispatchProps;

// use constant and type to indicate no filter applied
type NO_ORGANISM_FILTER_APPLIED = null;
const NO_ORGANISM_FILTER_APPLIED = null;

// configuration type of the organism (byValue) filter
type OrgFilterConfig =
  | NO_ORGANISM_FILTER_APPLIED
  | {
      values: Array<string>;
    };

type OrgFilterStatistics = {
  subsetSize: number;
  numVarValues: number;
  numDistinctValues: number;
  numDistinctEntityRecords: number;
  numMissingCases: number;
};

// type of the data returned by the filter summary (byValue reporter)
type OrgFilterSummary = {
  statistics: OrgFilterStatistics;
  histogram: Array<{
    value: number;
    binStart: string;
    binEnd: string;
    binLabel: string;
  }>;
};

// type of node used to render the org filter checkbox tree
type TaxonomyNodeWithCount = {
  term: string;
  display: string;
  count: number;
  children: TaxonomyNodeWithCount[];
};

type ExpansionBarProps = {
  onClick: () => void;
  message: string;
  arrow: string;
};

function ExpansionBar(props: ExpansionBarProps) {
  return (
    <div className={cx('--ExpansionBar')} onClick={props.onClick}>
      {props.arrow}
      <span className={cx('--ExpansionBarText')}>{props.message}</span>
      {props.arrow}
    </div>
  );
}

interface ContainerProps {
  children: React.ReactChild | React.ReactChild[];
}

function Container(props: ContainerProps) {
  return <div className={cx()}>{props.children}</div>;
}

function OrganismFilter({ resultType, ...otherProps }: Props) {
  const step = resultType?.type === 'step' ? resultType.step : undefined;

  // only show Organism Filter for transcript step results
  if (step == null || step.recordClassName !== ALLOWABLE_RECORD_CLASS_NAME) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <Container>
          <h3 className={cx('--Heading')}>{TITLE}</h3>
          <Loading />
        </Container>
      }
    >
      <OrganismFilterForStep step={step} {...otherProps} />
    </Suspense>
  );
}

type OrganismFilterForStepProps = { step: Step } & Omit<Props, 'resultType'>;

function OrganismFilterForStep({
  step,
  requestUpdateStepSearchConfig,
}: OrganismFilterForStepProps) {
  const [preferredOrganismsEnabled] = usePreferredOrganismsEnabledState();
  const [preferredOrganisms] = usePreferredOrganismsState();
  const referenceStrains = useReferenceStrains();
  const [showOnlyReferenceOrganisms, setShowOnlyReferenceOrganisms] =
    useState<boolean>(false);

  const renderTaxonomyNode = useCallback(
    (node: TaxonomyNodeWithCount) => {
      const organismName = node.term;
      return (
        <div style={{ display: 'flex', marginLeft: '0.25em' }}>
          <div>
            {node.display}{' '}
            {referenceStrains?.has(organismName) && (
              <span style={{ fontSize: '0.9em' }}>
                <strong>[Ref]</strong>
              </span>
            )}
          </div>
          <div style={{ marginLeft: 'auto' }}>
            {node.count.toLocaleString()}
          </div>
        </div>
      );
    },
    [referenceStrains]
  );

  const nodeMeetsSearchCriteria = useCallback(
    (node: TaxonomyNodeWithCount, terms: string[]) => {
      const organismName = node.term;
      const display = referenceStrains?.has(organismName)
        ? node.display + ' [Ref]'
        : node.display;
      return areTermsInString(terms, display);
    },
    [referenceStrains]
  );

  // if temporary value assigned, use until user clears or hits apply;
  // else check step for a filter value and if present, use; else use empty string (no filter)
  let appliedFilterConfig: OrgFilterConfig = findOrganismFilterConfig(
    step.searchConfig
  );

  // whether organism filter pane is expanded vs pushed against left wall of results pane
  let initialIsExpandedStr = sessionStorage.getItem(
    ORGANISM_FILTER_PANE_EXPANSION_KEY
  );
  let initialIsExpanded = initialIsExpandedStr
    ? initialIsExpandedStr === 'true'
    : DEFAULT_PANE_EXPANSION;
  const [isExpanded, setExpanded] = useState<boolean>(initialIsExpanded);

  // whether to hide leaves with zero records
  const [hideZeroes, setHideZeroes] = useState<boolean>(DEFAULT_HIDE_ZEROES);

  // previous step prop passed; decides whether we should reload the data below
  const [currentStep, setCurrentStep] = useState<Step | null>(null);
  let [searchConfigChangeRequested, setSearchConfigChangeRequested] =
    useState<boolean>(false);

  const stepQuestion = useWdkServiceWithRefresh(
    (wdkService) => wdkService.getQuestionAndParameters(step.searchName),
    [step.searchName]
  );

  // organism param (including taxonomy data) retrieved from service when component is initially loaded
  const taxonomyTree = useWdkServiceWithRefresh(fetchTaxonomyTree, []);

  // counts of genes of each organism in the result; retrieved when component is loaded and when step is revised
  const filterSummary = useWdkServiceWithRefresh(
    (wdkService) => fetchFilterSummary(wdkService, step.id),
    [step]
  );

  // current value of filter shown in the tree (will be cleared if applied to the step)
  let [temporaryFilterConfig, setTemporaryFilterConfig] =
    useState<OrgFilterConfig>(appliedFilterConfig);

  // current value of checkbox tree's search box
  const [searchTerm, setSearchTerm] = useState<string>('');

  // currently expanded nodes (null indicates user has not yet changed the value)
  const [savedExpandedNodeIds, setExpandedNodeIds] =
    useState<string[] | null>(null);

  // clear dependent data if step has changed
  // FIXME: This logic should be moved into an effect
  if (step !== currentStep) {
    setCurrentStep(step);
    temporaryFilterConfig = appliedFilterConfig;
    setTemporaryFilterConfig(appliedFilterConfig);
    searchConfigChangeRequested = false;
    setSearchConfigChangeRequested(false);
  }

  function setExpandedAndPref(isExpanded: boolean) {
    sessionStorage.setItem(
      ORGANISM_FILTER_PANE_EXPANSION_KEY,
      isExpanded.toString()
    );
    setExpanded(isExpanded);
  }

  // show collapsed view if not expanded
  if (!isExpanded) {
    return (
      <div style={{ position: 'relative' }}>
        <ExpansionBar
          onClick={() => setExpandedAndPref(true)}
          message={'Show ' + TITLE}
          arrow="&dArr;"
        />
      </div>
    );
  }

  // assign record counts and short display names to tree nodes, and trim zeroes if necessary
  let taxonomyTreeWithCounts: TaxonomyNodeWithCount | undefined =
    taxonomyTree && filterSummary?.available && stepQuestion
      ? createDisplayableTree(
          taxonomyTree,
          filterSummary.value,
          stepQuestion,
          hideZeroes,
          preferredOrganismsEnabled,
          preferredOrganisms
        )
      : undefined;

  // org filter config currently applied on the step (if any) - used for cancel button
  let appliedFilterList =
    appliedFilterConfig == NO_ORGANISM_FILTER_APPLIED
      ? undefined
      : appliedFilterConfig.values;

  // only show apply and cancel buttons if user has unsaved changes
  let showApplyAndCancelButtons: boolean =
    !searchConfigChangeRequested &&
    !isSameConfig(temporaryFilterConfig, appliedFilterConfig);

  // ids of leaves' boxes to check; if no filter applied, select none
  let selectedLeaves: Array<string> =
    temporaryFilterConfig === NO_ORGANISM_FILTER_APPLIED
      ? []
      : temporaryFilterConfig.values;

  // if user has not expanded any nodes yet and there is only one top-level child, expand it
  let expandedNodeIds = savedExpandedNodeIds
    ? savedExpandedNodeIds
    : taxonomyTreeWithCounts == null ||
      taxonomyTreeWithCounts.children.length > 1
    ? []
    : taxonomyTreeWithCounts.children.map((child) => child.term);

  // event handler function to update the step with the user's new org filter config
  function updateSearchConfig() {
    if (step) {
      setSearchConfigChangeRequested(true);
      let newSearchConfig: SearchConfig = applyOrgFilterConfig(
        step.searchConfig,
        temporaryFilterConfig
      );
      requestUpdateStepSearchConfig(step.strategyId, step.id, newSearchConfig);
    }
  }

  return (
    <Container>
      <div>
        <h3 className={cx('--Heading')}>
          {TITLE}
          {searchConfigChangeRequested && <Loading />}
        </h3>
        <div
          className={cx(
            '--Buttons',
            showApplyAndCancelButtons ? 'visible' : 'hidden'
          )}
        >
          <button
            type="button"
            className={cx('--ApplyButton') + ' btn'}
            onClick={() => updateSearchConfig()}
          >
            Apply
          </button>
          <button
            type="button"
            className={cx('--CancelButton') + ' btn'}
            onClick={() => setTemporaryFilterConfig(appliedFilterConfig)}
          >
            <i className="fa fa-times" />
          </button>
        </div>
        {taxonomyTreeWithCounts ? (
          <CheckboxTree<TaxonomyNodeWithCount>
            tree={taxonomyTreeWithCounts}
            getNodeId={(node) => node.term}
            getNodeChildren={(node) => node.children}
            onExpansionChange={(expandedNodeIds) =>
              setExpandedNodeIds(expandedNodeIds)
            }
            shouldExpandDescendantsWithOneChild
            renderNode={renderTaxonomyNode}
            expandedList={expandedNodeIds}
            filteredList={
              showOnlyReferenceOrganisms && referenceStrains
                ? Array.from(referenceStrains)
                : undefined
            }
            isAdditionalFilterApplied={showOnlyReferenceOrganisms}
            currentList={appliedFilterList}
            isSelectable={true}
            selectedList={selectedLeaves}
            isMultiPick={true}
            onSelectionChange={(selectedNodeIds) =>
              setTemporaryFilterConfig(
                selectedNodeIds.length == 0
                  ? NO_ORGANISM_FILTER_APPLIED
                  : { values: selectedNodeIds }
              )
            }
            isSearchable={true}
            searchBoxPlaceholder="Search organisms..."
            searchBoxHelp={makeSearchHelpText('the organisms below')}
            searchTerm={searchTerm}
            onSearchTermChange={(term) => setSearchTerm(term)}
            searchPredicate={nodeMeetsSearchCriteria}
            linksPosition={LinksPosition.Top}
            additionalActions={[
              <label style={{ fontSize: '0.9em' }}>
                <input
                  style={{ marginRight: '0.25em' }}
                  type="checkbox"
                  checked={hideZeroes}
                  onChange={() => setHideZeroes(!hideZeroes)}
                />
                Hide zero counts
              </label>,
              <Tooltip
                title={
                  <span style={{ fontWeight: 'normal' }}>
                    Show only reference organisms{' '}
                    <span style={{ fontWeight: 'bolder' }}>[Ref]</span>
                  </span>
                }
              >
                <label className={cx('--OnlyMatchesToggle')}>
                  <input
                    style={{ marginRight: '0.25em' }}
                    type="checkbox"
                    checked={showOnlyReferenceOrganisms}
                    onChange={() =>
                      setShowOnlyReferenceOrganisms((value) => !value)
                    }
                  />
                  <span style={{ fontSize: '0.95em' }}>Reference only</span>
                </label>
              </Tooltip>,
            ]}
            styleOverrides={{
              treeLinks: {
                container: {
                  justifyContent: 'flex-start',
                  padding: 0,
                  margin: '0.75em 0 0.75em 1.4em',
                },
              },
              treeSection: {
                ul: {
                  padding: '0',
                },
              },
            }}
          />
        ) : filterSummary?.available === false ? (
          <p className={cx('--ErrorMessage')}>{filterSummary.reason}</p>
        ) : (
          <Loading />
        )}
      </div>
      <ExpansionBar
        onClick={() => setExpandedAndPref(false)}
        message={'Hide ' + TITLE}
        arrow="&uArr;"
      />
    </Container>
  );
}

function findOrganismFilterConfig(searchConfig: SearchConfig): OrgFilterConfig {
  return searchConfig.columnFilters &&
    searchConfig.columnFilters[ORGANISM_COLUMN_NAME] &&
    searchConfig.columnFilters[ORGANISM_COLUMN_NAME][HISTOGRAM_FILTER_NAME]
    ? searchConfig.columnFilters[ORGANISM_COLUMN_NAME][HISTOGRAM_FILTER_NAME]
    : NO_ORGANISM_FILTER_APPLIED;
}

function applyOrgFilterConfig(
  oldSearchConfig: SearchConfig,
  newFilterConfig: OrgFilterConfig
): SearchConfig {
  // extracting ourselves from type safety for this operation!!
  let configCopy = JSON.parse(JSON.stringify(oldSearchConfig));

  if (newFilterConfig === NO_ORGANISM_FILTER_APPLIED) {
    // handle case where new config is no config
    // need to delete some of the existing search config
    configCopy.columnFilters[ORGANISM_COLUMN_NAME][HISTOGRAM_FILTER_NAME] =
      undefined;
    if (
      Object.keys(configCopy.columnFilters[ORGANISM_COLUMN_NAME]).length == 0
    ) {
      // no other organism column filters
      configCopy.columnFilters[ORGANISM_COLUMN_NAME] = undefined;
      if (Object.keys(configCopy.columnFilters).length == 0) {
        // no other column filters
        configCopy.columnFilters = undefined;
      }
    }
  } else {
    // new config present; may need to build out the structure to supply this config
    if (!configCopy.columnFilters) configCopy.columnFilters = {};
    if (!configCopy.columnFilters[ORGANISM_COLUMN_NAME])
      configCopy.columnFilters[ORGANISM_COLUMN_NAME] = {};
    configCopy.columnFilters[ORGANISM_COLUMN_NAME][HISTOGRAM_FILTER_NAME] =
      newFilterConfig;
  }
  return configCopy as SearchConfig;
}

function createDisplayableTree(
  taxonomyTree: TreeBoxVocabNode,
  filterSummary: OrgFilterSummary,
  stepQuestion: QuestionWithParameters,
  hideZeroes: boolean,
  preferredOrganismsEnabled: boolean,
  preferredOrganisms: string[]
): TaxonomyNodeWithCount {
  const taxonomyTreeWithCount: TaxonomyNodeWithCount = mapStructure(
    (node, mappedChildren) => {
      let count = 0;
      if (filterSummary && filterSummary.histogram) {
        if (hideZeroes) {
          // don't show children with zeroes if currently hiding zeroes
          mappedChildren = mappedChildren.filter((child) => child.count > 0);
        }
        // leaf nodes try to find their counts in the column reporter result
        if (mappedChildren.length == 0) {
          let bin = filterSummary.histogram.find(
            (val) => val.binLabel === node.data.term
          );
          count = bin ? bin.value : 0;
        }
        // branch nodes sum the counts of their children
        else {
          count = mappedChildren.reduce((sum, child) => sum + child.count, 0);
        }
      }
      return {
        term: node.data.term,
        display: node.data.display,
        count: count,
        children: mappedChildren,
      };
    },
    (node) => node.children,
    taxonomyTree
  );

  const hasPreferredOrganismParam = stepQuestion.parameters.some((parameter) =>
    parameter.properties?.[ORGANISM_PROPERTIES_KEY]?.includes(
      SHOW_ONLY_PREFERRED_ORGANISMS_PROPERTY
    )
  );

  if (!hasPreferredOrganismParam || !preferredOrganismsEnabled) {
    return taxonomyTreeWithCount;
  }

  const preferredOrganismsSet = new Set(preferredOrganisms);

  return pruneDescendantNodes(
    (node) =>
      node.children.length > 0 ||
      node.count > 0 ||
      preferredOrganismsSet.has(node.term),
    taxonomyTreeWithCount
  );
}

function isSameConfig(a: OrgFilterConfig, b: OrgFilterConfig): boolean {
  if (a === NO_ORGANISM_FILTER_APPLIED && b === NO_ORGANISM_FILTER_APPLIED) {
    return true;
  }
  if (a === NO_ORGANISM_FILTER_APPLIED || b === NO_ORGANISM_FILTER_APPLIED) {
    return false;
  }
  return (
    a.values.length === b.values.length &&
    a.values.length === intersection(a.values, b.values).length
  );
}

function fetchTaxonomyTree(wdkService: WdkService) {
  return wdkService
    .getQuestionAndParameters(TAXON_QUESTION_NAME)
    .then((question) => {
      let orgParam = question.parameters.find(
        (p) => p.name == ORGANISM_PARAM_NAME
      );
      if (
        orgParam?.type == 'multi-pick-vocabulary' &&
        orgParam?.displayType == 'treeBox'
      ) {
        return pruneNodesWithSingleExtendingChild(orgParam.vocabulary);
      } else {
        throw new Error(
          TAXON_QUESTION_NAME +
            ' does not contain treebox enum param ' +
            ORGANISM_PARAM_NAME
        );
      }
    });
}

function fetchFilterSummary(wdkService: WdkService, stepId: number) {
  return wdkService
    .getStepColumnReport(
      stepId,
      ORGANISM_COLUMN_NAME,
      HISTOGRAM_REPORTER_NAME,
      {}
    )
    .then((filterSummary) => {
      return {
        available: true,
        value: filterSummary as OrgFilterSummary,
      } as const;
    })
    .catch((error) => {
      wdkService.submitErrorIfUndelayedAndNot500(error);

      return {
        available: false,
        reason: makeCommonErrorMessage(error),
      } as const;
    });
}

const mapDispatchToProps = {
  // when user clicks Apply, will need to update step with new filter value
  requestUpdateStepSearchConfig,
};

export default connect<null, typeof mapDispatchToProps, OwnProps, RootState>(
  null,
  mapDispatchToProps
)(OrganismFilter);
