import React, { useState } from 'react';
import { connect } from 'react-redux';
import { set, update, intersection } from 'lodash/fp'
import { RootState } from 'wdk-client/Core/State/Types';
import { TreeBoxVocabNode, SearchConfig } from 'wdk-client/Utils/WdkModel';
import WdkService, { useWdkEffect } from 'wdk-client/Service/WdkService';
import { Step } from 'wdk-client/Utils/WdkUser';
import { requestUpdateStepSearchConfig } from 'wdk-client/Actions/StrategyActions';
import { Loading, CheckboxTree } from 'wdk-client/Components';
import Checkbox from 'wdk-client/Components/InputControls/Checkbox';
import { mapStructure } from 'wdk-client/Utils/TreeUtils';

// constants for service calls
const ALLOWABLE_RECORD_CLASS_NAME = 'transcript';
const TAXON_QUESTION_NAME = 'GenesByTaxon';
const ORGANISM_PARAM_NAME = 'organism';
const ORGANISM_COLUMN_NAME = 'organism';
const HISTOGRAM_REPORTER_NAME = 'byValue';
const HISTOGRAM_FILTER_NAME = 'byValue';

// session storage prop name to hold filter pane expansion preference
const ORGANISM_FILTER_PANE_EXPANSION_KEY = "defaultOrganismFilterPaneExpansion";

// initial values for component state
const DEFAULT_PANE_EXPANSION = true;
const DEFAULT_HIDE_ZEROES = false;

// props passed into this component by caller
type OwnProps = {
  stepId: number;
  strategyId: number;
};

// props provided by mapStateToProps function
type StateProps = {
  step: Step | null;
};

// configured action creators provided by connect
type DispatchProps = {
  requestUpdateStepSearchConfig: typeof requestUpdateStepSearchConfig;
};

// props actually passed to the component below after connect translation
type Props = StateProps & DispatchProps;

// use constant and type to indicate no filter applied
type NO_ORGANISM_FILTER_APPLIED = null;
const NO_ORGANISM_FILTER_APPLIED = null;

// configuration type of the organism (byValue) filter
type OrgFilterConfig = NO_ORGANISM_FILTER_APPLIED | {
  filters: Array<string>;
}

// type of the data returned by the filter summary (byValue reporter)
type OrgFilterSummary = {
  totalValues: number;
  nullValues: number;
  uniqueValues?: number;
  values?: Array<{
    value: string;
    count: number;
  }>
}

// type of node used to render the org filter checkbox tree
type TaxonomyNodeWithCount = {
  term: string;
  display: string;
  count: number;
  children: TaxonomyNodeWithCount[];
}

const verticalTextCss: React.CSSProperties = {
  position: "absolute",
  top: "7em",
  right: "2em",
  transform: "rotate(270deg)",
  transformOrigin: "right top",
  border: "solid 1px #346792",
  padding: "5px",
  height: "2em",
  width: "18em",
  textAlign: "center",
  color: "#FFF",
  backgroundImage: "none",
  backgroundColor: "#4F81BD",
  cursor: "pointer",
  whiteSpace: "nowrap"
};

type ExpansionBarProps = {
  onClick: () => void;
  message: string;
  arrow: string;
}

function ExpansionBar(props: ExpansionBarProps) {
  return (
    <div style={verticalTextCss} onClick={props.onClick}>
      {props.arrow}<span style={{margin:"0 2em"}}>{props.message}</span>{props.arrow}
    </div>
  );
}

interface ContainerProps {
  children: React.ReactChild | React.ReactChild[];
}

function Container(props: ContainerProps) {
  return (
    <div style={{ width: "30em", paddingRight: "4em" }}>
      {props.children}
    </div>
  )
}

function OrganismFilter({step, requestUpdateStepSearchConfig}: Props) {

  // don't show anything until step loaded, and after that only if a transcript step
  if (!step || step.recordClassName !== ALLOWABLE_RECORD_CLASS_NAME) {
    return null;
  }

  // whether organism filter pane is expanded vs pushed against left wall of results pane
  let initialIsExpandedStr = sessionStorage.getItem(ORGANISM_FILTER_PANE_EXPANSION_KEY);
  let initialIsExpanded = initialIsExpandedStr ? initialIsExpandedStr === "true" : DEFAULT_PANE_EXPANSION;
  const [ isExpanded, setExpanded ] = useState<boolean>(initialIsExpanded);

  // whether to hide leaves with zero records
  const [ hideZeroes, setHideZeroes ] = useState<boolean>(DEFAULT_HIDE_ZEROES);

  // previous step prop passed; decides whether we should reload the data below
  const [ currentStep, setCurrentStep ] = useState<Step | null>(null);

  // organism param (including taxonomy data) retrieved from service when component is initially loaded
  const [ taxonomyTreeRequested, setTaxonomyTreeRequested ] = useState<boolean>(false);
  const [ taxonomyTree, setTaxonomyTree ] = useState<TreeBoxVocabNode | null>(null);

  // counts of genes of each organism in the result; retrieved when component is loaded and when step is revised
  const [ filterSummaryRequested, setFilterSummaryRequested ] = useState<boolean>(false);
  const [ savedFilterSummary, setFilterSummary ] = useState<OrgFilterSummary | null>(null);

  // current value of filter shown in the tree (will be cleared if applied to the step)
  const [ temporaryFilterConfig, setTemporaryFilterConfig ] = useState<OrgFilterConfig>(NO_ORGANISM_FILTER_APPLIED);

  // current value of checkbox tree's search box
  const [ searchTerm, setSearchTerm ] = useState<string>("");

  // currently expanded nodes (null indicates user has not yet changed the value)
  const [ savedExpandedNodeIds, setExpandedNodeIds ] = useState<string[] | null>(null);

  // clear dependent data if step has changed
  let filterSummary = savedFilterSummary;
  if (step !== currentStep) {
    setCurrentStep(step);
    filterSummary = null;
    setFilterSummary(null);
  }

  // load data from WDK service if necessary
  useWdkEffect(wdkService => {
    if (taxonomyTree == null && !taxonomyTreeRequested) {
      loadTaxonomyTree(wdkService, setTaxonomyTree, setTaxonomyTreeRequested);
    }
    if (filterSummary == null && !filterSummaryRequested) {
      loadFilterSummary(wdkService, step.id, setFilterSummary, setFilterSummaryRequested);
    }
  });

  function setExpandedAndPref(isExpanded: boolean) {
    sessionStorage.setItem(ORGANISM_FILTER_PANE_EXPANSION_KEY, isExpanded.toString());
    setExpanded(isExpanded);
  }

  // show collapsed view if not expanded
  if (!isExpanded) {
    return ( <ExpansionBar onClick={() => setExpandedAndPref(true)} message="Filter by Organism" arrow="&dArr;"/> );
  }

  // assign record counts and short display names to tree nodes, and trim zeroes if necessary
  let taxonomyTreeWithCounts: TaxonomyNodeWithCount | undefined = taxonomyTree && filterSummary
    ? createDisplayableTree(taxonomyTree, filterSummary, hideZeroes)
    : undefined;

  // if temporary value assigned, use until user clears or hits apply;
  // else check step for a filter value and if present, use; else use empty string (no filter)
  let appliedFilterConfig: OrgFilterConfig = findOrganismFilterConfig(step.searchConfig);

  // org filter config currently applied on the step (if any) - used for cancel button
  let appliedFilterList = appliedFilterConfig == NO_ORGANISM_FILTER_APPLIED ? undefined : appliedFilterConfig.filters;

  // choose between step's org filter config and temporary (unapplied) selections
  let viewableFilterConfig: OrgFilterConfig =
    temporaryFilterConfig !== NO_ORGANISM_FILTER_APPLIED ? temporaryFilterConfig : appliedFilterConfig;

  // only show apply and cancel buttons if user has unsaved changes
  let showApplyAndCancelButtons: boolean = !isSameConfig(temporaryFilterConfig, appliedFilterConfig);

  // ids of leaves' boxes to check; if no filter applied, select none
  let selectedLeaves: Array<string> = viewableFilterConfig === NO_ORGANISM_FILTER_APPLIED ? [] : viewableFilterConfig.filters;

  // if user has not expanded any nodes yet and there is only one top-level child, expand it
  let expandedNodeIds = savedExpandedNodeIds ? savedExpandedNodeIds :
      taxonomyTreeWithCounts == null || taxonomyTreeWithCounts.children.length > 1 ? [] :
      taxonomyTreeWithCounts.children.map(child => child.term);

  // event handler function to update the step with the user's new org filter config
  function updateSearchConfig() {
    if (step) {
      let newSearchConfig: SearchConfig = applyOrgFilterConfig(step.searchConfig, temporaryFilterConfig);
      requestUpdateStepSearchConfig(step.strategyId, step.id, newSearchConfig);
    }
  }

  return (
    <Container>
      <div>
        <h3 style={{ fontSize: "1.4em", padding: "0 0 .5em 0", display: 'flex', alignItems: 'center', height: '2em' }}>
          Filter by Taxonomy
          {showApplyAndCancelButtons && (
            <React.Fragment>
              &nbsp;
              <button type="button" style={{ fontSize: '.75rem', fontWeight: 'normal', marginLeft: 'auto' }} onClick={() => updateSearchConfig()}>Apply</button>
              &nbsp;
              <button type="button" style={{ fontSize: '.75rem', fontWeight: 'normal'}} onClick={() => setTemporaryFilterConfig(appliedFilterConfig)}>Cancel</button>
            </React.Fragment>
          )}
        </h3>
        {filterSummary && filterSummary.values && (
          <div>
            <Checkbox value={hideZeroes} onChange={(newValue: boolean) => setHideZeroes(newValue)}/>
            <span> Hide organisms with zero records</span>
          </div>
        )}
        { taxonomyTreeWithCounts
        ? (
            <CheckboxTree<TaxonomyNodeWithCount>
              tree={taxonomyTreeWithCounts}
              getNodeId={node => node.term}
              getNodeChildren={node => node.children}
              onExpansionChange={expandedNodeIds => setExpandedNodeIds(expandedNodeIds)}
              renderNode={renderTaxonomyNode}
              expandedList={expandedNodeIds}
              currentList={appliedFilterList}
              isSelectable={true}
              selectedList={selectedLeaves}
              isMultiPick={true}
              onSelectionChange={selectedNodeIds => setTemporaryFilterConfig(
                selectedNodeIds.length == 0 ? NO_ORGANISM_FILTER_APPLIED : { filters: selectedNodeIds })}
              isSearchable={true}
              searchBoxPlaceholder="Search organisms..."
              searchTerm={searchTerm}
              onSearchTermChange={term => setSearchTerm(term)}
              searchPredicate={nodeMeetsSearchCriteria}
            />
            )
        : (
          <Loading/>
        )}
      </div>
      <ExpansionBar onClick={() => setExpandedAndPref(false)} message="Hide Organism Filter" arrow="&uArr;"/>
    </Container>
  );
}

function findOrganismFilterConfig(searchConfig: SearchConfig): OrgFilterConfig {
  return (
    searchConfig.columnFilters &&
    searchConfig.columnFilters[ORGANISM_COLUMN_NAME] &&
    searchConfig.columnFilters[ORGANISM_COLUMN_NAME][HISTOGRAM_FILTER_NAME] &&
    searchConfig.columnFilters[ORGANISM_COLUMN_NAME][HISTOGRAM_FILTER_NAME].length > 0 ?
    searchConfig.columnFilters[ORGANISM_COLUMN_NAME][HISTOGRAM_FILTER_NAME][0] : NO_ORGANISM_FILTER_APPLIED
  );
}

function applyOrgFilterConfig(oldSearchConfig: SearchConfig, newFilterConfig: OrgFilterConfig): SearchConfig {
  // extracting ourselves from type safety for this operation!!
  let configCopy = JSON.parse(JSON.stringify(oldSearchConfig));

  if (newFilterConfig === NO_ORGANISM_FILTER_APPLIED) {
    // handle case where new config is no config
    // need to delete some of the existing search config
    configCopy.columnFilters[ORGANISM_COLUMN_NAME][HISTOGRAM_FILTER_NAME] = undefined;
    if (Object.keys(configCopy.columnFilters[ORGANISM_COLUMN_NAME]).length == 0) {
      // no other organism column filters
      configCopy.columnFilters[ORGANISM_COLUMN_NAME] = undefined;
      if (Object.keys(configCopy.columnFilters).length == 0) {
        // no other column filters
        configCopy.columnFilters = undefined;
      }
    }
  }
  else {
    // new config present; may need to build out the structure to supply this config
    if (!configCopy.columnFilters)
      configCopy.columnFilters = {};
    if (!configCopy.columnFilters[ORGANISM_COLUMN_NAME])
      configCopy.columnFilters[ORGANISM_COLUMN_NAME] = {};
    if (!configCopy.columnFilters[ORGANISM_COLUMN_NAME][HISTOGRAM_FILTER_NAME])
      configCopy.columnFilters[ORGANISM_COLUMN_NAME][HISTOGRAM_FILTER_NAME] = [ newFilterConfig ];
  }
  return configCopy as SearchConfig;
}

function createDisplayableTree(
  taxonomyTree: TreeBoxVocabNode,
  filterSummary: OrgFilterSummary,
  hideZeroes: boolean
): TaxonomyNodeWithCount {
  return mapStructure(
    (node, mappedChildren) => {
      let count = 0;
      if (filterSummary && filterSummary.values) {
        if (hideZeroes) {
          // don't show children with zeroes if currently hiding zeroes
          mappedChildren = mappedChildren.filter(child => child.count > 0);
        }
        // leaf nodes try to find their counts in the column reporter result
        if (mappedChildren.length == 0) {
          let valueTuple = filterSummary.values.find(val => val.value === node.data.term);
          count = valueTuple ? valueTuple.count : 0;
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
        children: mappedChildren
      };
    },
    node => node.children,
    taxonomyTree
  );
}

function nodeMeetsSearchCriteria(node: TaxonomyNodeWithCount, terms: string[]) {
  for (let term of terms) {
    if (node.display.toLowerCase().search(term.toLowerCase()) !== -1) return true;
  }
  return false;
}

function isSameConfig(a: OrgFilterConfig, b: OrgFilterConfig): boolean {
  if (a === NO_ORGANISM_FILTER_APPLIED && b === NO_ORGANISM_FILTER_APPLIED) {
    return true;
  }
  if (a === NO_ORGANISM_FILTER_APPLIED || b === NO_ORGANISM_FILTER_APPLIED) {
    return false;
  }
  return (a.filters.length === b.filters.length &&
          a.filters.length !== intersection(a.filters, b.filters).length);
}

function renderTaxonomyNode(node: TaxonomyNodeWithCount) {
  return (
    <div style={{display:"flex",width:"calc(100% - 2em)"}}>
      <div>{node.display}</div>
      <div style={{marginLeft:"auto"}}>{node.count}</div>
    </div>
  );
}

function loadTaxonomyTree(wdkService: WdkService,
    setTaxonomyTree: (t: TreeBoxVocabNode) => void,
    setTaxonomyTreeRequested: (b: boolean) => void): void {
  setTaxonomyTreeRequested(true);
  wdkService.getQuestionAndParameters(TAXON_QUESTION_NAME)
    .then(question => {
      let orgParam  = question.parameters.find(p => p.name == ORGANISM_PARAM_NAME);
      if (orgParam && orgParam.type == 'vocabulary' && orgParam.displayType == "treeBox") {
        setTaxonomyTree(orgParam.vocabulary);
        setTaxonomyTreeRequested(false);
      }
      else {
        throw TAXON_QUESTION_NAME + " does not contain treebox enum param " + ORGANISM_PARAM_NAME;
      }
    });
}

function loadFilterSummary(wdkService: WdkService,
    stepId: number,
    setFilterSummary: (s: OrgFilterSummary) => void,
    setFilterSummaryRequested: (b: boolean) => void): void {
  setFilterSummaryRequested(true);
  wdkService.getStepColumnReport(stepId, ORGANISM_COLUMN_NAME, HISTOGRAM_REPORTER_NAME, {})
    .then(filterSummary => {
      setFilterSummary(filterSummary as OrgFilterSummary);
      setFilterSummaryRequested(false);
    });
}

function mapStateToProps(state: RootState, ownProps: OwnProps): StateProps {
  // should be able to load these without confirming existence since
  //   this component only lives in the result panel; however, typescript enforces it
  let strategy = state.strategies.strategies[ownProps.strategyId];
  if (strategy && strategy.status == 'success') {
    let details = strategy.strategy;
    let step = details.steps[ownProps.stepId] || null;
    return { step };
  }
  return {
    step: null
  };
}

const mapDispatchToProps = {
  // when user clicks Apply, will need to update step with new filter value
  requestUpdateStepSearchConfig
};

export default connect<StateProps, typeof mapDispatchToProps, OwnProps, RootState>(
  mapStateToProps,
  mapDispatchToProps
)(OrganismFilter);
