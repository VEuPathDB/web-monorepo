import { uniq } from 'lodash';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useContext,
} from 'react';
import { Link } from 'react-router-dom';

//correct paths as this is a copy of FieldList component at @veupathdb/
import { scrollIntoViewIfNeeded } from '@veupathdb/wdk-client/lib/Utils/DomUtils';
import {
  areTermsInString,
  makeSearchHelpText,
} from '@veupathdb/wdk-client/lib/Utils/SearchUtils';
import {
  preorderSeq,
  pruneDescendantNodes,
} from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import CheckboxTree from '@veupathdb/wdk-client/lib/Components/CheckboxTree/CheckboxTree';
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
import Toggle from '@veupathdb/wdk-client/lib/Components/Icon/Toggle';
import {
  isFilterField,
  isMulti,
  isRange,
  findAncestorFields,
  removeIntermediateNodesWithSingleChild,
} from '@veupathdb/wdk-client/lib/Components/AttributeFilter/AttributeFilterUtils';

import {
  Field,
  FieldTreeNode,
} from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';
import { Tooltip } from '@material-ui/core';
import { HtmlTooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
// import ShowHideVariableContext
import { VariableDescriptor } from '../../types/variable';
import { ShowHideVariableContext } from '../../utils/show-hide-variable-context';

import { cx } from '../../../workspace/Utils';
import { pruneEmptyFields } from '../../utils/wdk-filter-param-adapter';

interface VariableField {
  type?: string;
  term: string;
  display: string;
  parent?: string;
  isRange?: boolean;
  precision?: number;
  variableName?: string;
  description?: string;
}

interface VariableFieldTreeNode extends FieldTreeNode {
  field: VariableField;
  children: VariableFieldTreeNode[];
}

interface FieldNodeProps {
  field: VariableField;
  searchTerm: string;
  isActive: boolean;
  isDisabled?: boolean;
  isMultiFilterDescendant: boolean;
  showMultiFilterDescendants: boolean;
  customDisabledVariableMessage?: string;
  handleFieldSelect: (field: VariableField) => void;
  activeFieldEntity?: string;
  isStarred: boolean;
  starredVariablesLoading: boolean;
  onClickStar: () => void;
  scrollIntoView: boolean;
}

interface getNodeSearchStringType {
  field: {
    term: string;
    display?: string;
    description?: string;
    variableName?: string;
  };
}

// These are options that we want to persist until the page is reloaded.
// This is crude, but works well enough for now.
const Options = {
  featuredVariablesOpen: true,
};

/**
 * Object whose keys are in the format of `entityID/variableID`
 * and whose values are the various data options for that entity/variable
 * combination.
 *
 * For example:
 * {
 *   "PCO_0000024/ENVO_00000004": "Bangladesh India Kenya Mali Mozambique Pakistan The Gambia"
 * }
 */
type ValuesMap = Record<string, string>;

interface VariableListProps {
  mode: 'singleSelection' | 'multiSelection';
  activeField?: VariableField;
  onActiveFieldChange: (term: string) => void;
  selectedFields?: Array<VariableField>;
  onSelectedFieldsChange?: (terms: Array<string>) => void;
  valuesMap: ValuesMap;
  fieldTree: VariableFieldTreeNode;
  autoFocus: boolean;
  starredVariables?: VariableDescriptor[];
  toggleStarredVariable: (targetVariableId: VariableDescriptor) => void;
  disabledFieldIds?: string[];
  customDisabledVariableMessage?: string;
  featuredFields: VariableField[];
  showMultiFilterDescendants: boolean;
  // Entities in which single child nodes should be promoted
  // (replacing their parent in the tree)
  singleChildPromotionEntityIds?: string[];
}

// TODO: Needs documentation of general component purpose.
/**
 * Provide user
 */
export default function VariableList({
  mode,
  activeField,
  onActiveFieldChange,
  selectedFields = [],
  onSelectedFieldsChange,
  disabledFieldIds,
  valuesMap,
  fieldTree,
  featuredFields = [],
  autoFocus,
  starredVariables,
  toggleStarredVariable,
  customDisabledVariableMessage,
  showMultiFilterDescendants,
  singleChildPromotionEntityIds,
}: VariableListProps) {
  // useContext is used here with ShowHideVariableContext
  const {
    showOnlyCompatibleVariables,
    setShowOnlyCompatibleVariablesHandler,
  } = useContext(ShowHideVariableContext);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const getPathToField = useCallback(
    (field?: Field) => {
      if (field == null) return [];

      return findAncestorFields(fieldTree, field.term)
        .map((field) => field.term)
        .toArray();
    },
    [fieldTree]
  );

  const [expandedNodes, setExpandedNodes] = useState(
    getPathToField(activeField)
  );

  const activeFieldEntity = activeField?.term.split('/')[0];

  // When active field changes, we want to collapse entity nodes that are not an ancestor
  // of the active field. We also want to retain the expanded state of internal nodes, so
  // we will only remove entity nodes from the list of expanded nodes.
  useEffect(() => {
    if (activeField == null) return;
    setExpandedNodes((expandedNodes) => {
      const activeNodeLineage = getPathToField(activeField);
      if (activeNodeLineage.every((node) => expandedNodes.includes(node))) {
        // This is effectively a noop. Returning the same value tells react to bail on the next render.
        // See https://reactjs.org/docs/hooks-reference.html#functional-updates
        return expandedNodes;
      }
      const newExpandedNodes = uniq(
        expandedNodes
          .concat(activeNodeLineage)
          .filter(
            (term) =>
              !term.startsWith('entity:') ||
              term === `entity:${activeFieldEntity}`
          )
      );
      return newExpandedNodes;
    });
  }, [activeField, activeFieldEntity, getPathToField]);

  const handleFieldSelect = useCallback(
    (field: Field) => {
      onActiveFieldChange(field.term);
    },
    [onActiveFieldChange]
  );

  const getNodeId = useCallback((node: FieldTreeNode) => {
    return node.field.term;
  }, []);

  const getNodeChildren = useCallback(
    (node: FieldTreeNode) => {
      return isMulti(node.field) && showMultiFilterDescendants === false
        ? []
        : node.children;
    },
    [showMultiFilterDescendants]
  );

  const getFieldSearchString = useCallback(
    (node: FieldTreeNode) => {
      return isMulti(node.field) && !showMultiFilterDescendants
        ? preorderSeq(node).map(getNodeSearchString(valuesMap)).join(' ')
        : getNodeSearchString(valuesMap)(node);
    },
    [showMultiFilterDescendants, valuesMap]
  );

  const searchPredicate = useCallback(
    (node: FieldTreeNode, searchTerms: string[]) => {
      return areTermsInString(searchTerms, getFieldSearchString(node));
    },
    [getFieldSearchString]
  );

  const availableVariableTerms = useMemo(() => {
    const availableVariableTermsArray = preorderSeq(fieldTree)
      .filter((node) => isFilterField(node.field))
      .map((node) => node.field.term)
      .toArray();

    return new Set(availableVariableTermsArray);
  }, [fieldTree]);

  const starredVariablesLoading = starredVariables == null;

  // moved this useState here
  const [showOnlyStarredVariables, setShowOnlyStarredVariables] = useState(
    false
  );

  // make visibleStarredVariableTerms state be used at MyVariable
  const [
    visibleStarredVariableTerms,
    setVisibleStarredVariableTerms,
  ] = useState<string[]>([]);

  const starredVariableTermsSet = useMemo(() => {
    const presentStarredVariableTerms = starredVariables
      ?.map(({ entityId, variableId }) => `${entityId}/${variableId}`)
      .filter((variableTerm) => availableVariableTerms.has(variableTerm));

    return new Set(presentStarredVariableTerms);
  }, [availableVariableTerms, starredVariables]);

  // this will be used for MyVariable instead of starredVariableSet
  const visibleStarredVariableTermsSet = useMemo(() => {
    const presentStarredVariableTerms = visibleStarredVariableTerms?.filter(
      (variableTerm) => availableVariableTerms.has(variableTerm)
    );

    return new Set(presentStarredVariableTerms);
  }, [availableVariableTerms, visibleStarredVariableTerms]);

  const disabledFields = useMemo(() => new Set(disabledFieldIds), [
    disabledFieldIds,
  ]);

  const multiFilterDescendants = useMemo(() => {
    const children = new Map<string, string>();
    if (!showMultiFilterDescendants) return children;
    preorderSeq(fieldTree).forEach((node) => {
      if (isMulti(node.field)) {
        preorderSeq(node)
          .drop(1)
          .filter((descendant) => isFilterField(descendant.field))
          .forEach((descendent) =>
            children.set(descendent.field.term, node.field.term)
          );
      }
    });
    return children;
  }, [fieldTree, showMultiFilterDescendants]);

  const renderNode = useCallback(
    (node: FieldTreeNode) => {
      const fieldTerm = node.field.term;
      const [entityId, variableId] = fieldTerm.split('/');
      const isMultiFilterDescendant = multiFilterDescendants.has(
        node.field.term
      );

      return (
        <FieldNode
          field={node.field}
          isMultiFilterDescendant={isMultiFilterDescendant}
          showMultiFilterDescendants={showMultiFilterDescendants}
          searchTerm={searchTerm}
          isActive={node.field.term === activeField?.term}
          isDisabled={disabledFields.has(node.field.term)}
          customDisabledVariableMessage={customDisabledVariableMessage}
          handleFieldSelect={handleFieldSelect}
          //add activefieldEntity prop (parent entity obtained from activeField)
          //alternatively, send activeField and isActive is directly checked at FieldNode
          activeFieldEntity={activeFieldEntity}
          isStarred={starredVariableTermsSet.has(fieldTerm)}
          starredVariablesLoading={starredVariablesLoading}
          onClickStar={() => toggleStarredVariable({ entityId, variableId })}
          scrollIntoView
        />
      );
    },
    [
      multiFilterDescendants,
      showMultiFilterDescendants,
      searchTerm,
      activeField?.term,
      disabledFields,
      customDisabledVariableMessage,
      handleFieldSelect,
      activeFieldEntity,
      starredVariableTermsSet,
      starredVariablesLoading,
      toggleStarredVariable,
    ]
  );

  const toggleShowOnlyStarredVariables = useCallback(() => {
    setShowOnlyStarredVariables((oldValue) => !oldValue);
    const newVisibleStarredVariableTerms = starredVariables?.map(
      ({ entityId, variableId }) => `${entityId}/${variableId}`
    );
    setVisibleStarredVariableTerms(newVisibleStarredVariableTerms ?? []);
  }, [starredVariables]);

  const starredVariableToggleDisabled =
    !showOnlyStarredVariables && starredVariableTermsSet.size === 0;

  const additionalFilters = useMemo(
    () => [
      <Tooltip
        title={makeStarredVariablesFilterTooltipContent(
          showOnlyStarredVariables,
          starredVariableToggleDisabled
        )}
      >
        <div>
          <button
            className={`${cx('-StarredVariablesFilter')} btn`}
            type="button"
            onClick={toggleShowOnlyStarredVariables}
            disabled={starredVariableToggleDisabled}
          >
            <Toggle on={showOnlyStarredVariables} />
            <Icon fa="star" />
          </button>
        </div>
      </Tooltip>,
    ],
    [
      showOnlyStarredVariables,
      starredVariableToggleDisabled,
      toggleShowOnlyStarredVariables,
    ]
  );

  const isAdditionalFilterApplied = showOnlyStarredVariables;

  const allowedFeaturedFields = showOnlyCompatibleVariables
    ? featuredFields.filter((field) => !disabledFields.has(field.term))
    : featuredFields;

  const tree = useMemo(() => {
    // Filter by starred variables if enabled
    let tree =
      !showOnlyStarredVariables || starredVariableToggleDisabled
        ? fieldTree
        : pruneDescendantNodes(
            (node) =>
              node.children.length > 0 ||
              (multiFilterDescendants.has(node.field.term) &&
                visibleStarredVariableTermsSet.has(
                  multiFilterDescendants.get(node.field.term)!
                )) ||
              // visibleStarredVariablesSet is used for MyVariable instead of starredVariableSet
              visibleStarredVariableTermsSet.has(node.field.term),
            fieldTree
          );
    // Filter by compatible variables if enabled
    tree = showOnlyCompatibleVariables
      ? pruneDescendantNodes((node) => {
          if (disabledFields.size === 0) return true;
          if (node.field.type == null || node.field.type === 'multiFilter')
            return node.children.length > 0;
          return !disabledFields.has(node.field.term);
        }, tree)
      : tree;
    // Promote single children in entities where it's enabled
    if (
      singleChildPromotionEntityIds &&
      singleChildPromotionEntityIds.length > 0
    ) {
      tree.children = tree.children.map((entity) =>
        singleChildPromotionEntityIds.includes(entity.field.term)
          ? {
              ...entity,
              children: entity.children.map((child) =>
                removeIntermediateNodesWithSingleChild(pruneEmptyFields(child))
              ),
            }
          : entity
      );
    }
    return tree;
  }, [
    showOnlyStarredVariables,
    starredVariableToggleDisabled,
    fieldTree,
    showOnlyCompatibleVariables,
    visibleStarredVariableTermsSet,
    multiFilterDescendants,
    disabledFields,
    singleChildPromotionEntityIds,
  ]);

  const tooltipContent = (
    <>
      Some variables cannot be used here. Use this to toggle their presence
      below.
      <br />
      <br />
      <strong>
        <Link
          to=""
          onClick={(e) => {
            e.preventDefault();
            alert('Comming soon');
          }}
        >
          <Icon fa="info-circle" /> Learn more
        </Link>
      </strong>{' '}
      about variable compatibility
    </>
  );

  /** Render info on disabled fields, if appropriate. */
  const renderDisabledFields = () =>
    disabledFields.size > 0 && (
      <div className={cx('-DisabledVariablesToggle')}>
        <HtmlTooltip
          css={
            {
              /*
               * This is needed to address a compiler error.
               * Not sure why it's complaining, but here we are...
               */
            }
          }
          title={tooltipContent}
          interactive
          enterDelay={500}
          enterNextDelay={500}
          leaveDelay={0}
        >
          <button
            className="link"
            type="button"
            onClick={() => {
              // useContext
              setShowOnlyCompatibleVariablesHandler(
                !showOnlyCompatibleVariables
              );
            }}
          >
            <Toggle on={showOnlyCompatibleVariables} />
            Only show compatible variables
          </button>
        </HtmlTooltip>
      </div>
    );

  /**
   * Render featured fields panel, if data supports it.
   */
  const renderFeaturedFields = () => {
    return featuredFields.length && allowedFeaturedFields.length ? (
      <div className="FeaturedVariables">
        <details
          open={Options.featuredVariablesOpen}
          onToggle={(event: React.SyntheticEvent<HTMLDetailsElement>) => {
            Options.featuredVariablesOpen = event.currentTarget.open;
          }}
        >
          <summary>
            <h3>Featured variables</h3>
          </summary>
          <ul>
            {allowedFeaturedFields.map((field) => {
              const isActive = field.term === activeField?.term;
              const isDisabled = disabledFields.has(field.term);
              const [entityId, variableId] = field.term.split('/');
              return (
                <li
                  key={field.term}
                  className="wdk-CheckboxTreeItem wdk-CheckboxTreeItem__leaf"
                >
                  <div className="wdk-CheckboxTreeNodeContent">
                    <FieldNode
                      isMultiFilterDescendant={false}
                      showMultiFilterDescendants={showMultiFilterDescendants}
                      field={field}
                      isActive={isActive}
                      isDisabled={isDisabled}
                      customDisabledVariableMessage={
                        customDisabledVariableMessage
                      }
                      searchTerm=""
                      handleFieldSelect={handleFieldSelect}
                      isStarred={starredVariableTermsSet.has(field.term)}
                      starredVariablesLoading={starredVariablesLoading}
                      onClickStar={() =>
                        toggleStarredVariable({ entityId, variableId })
                      }
                      scrollIntoView={false}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </details>
      </div>
    ) : null;
  };

  return (
    <div className={cx('-VariableList')}>
      {renderDisabledFields()}
      {renderFeaturedFields()}

      <CheckboxTree
        {...(mode === 'multiSelection' && {
          selectedList: selectedFields.map((field) => field.term),
          isSelectable: true,
          isMultiPick: true,
          onSelectionChange: onSelectedFieldsChange,
        })}
        // isMultiPick={true}
        // selectedList={[
        //   'PCO_0000024/EUPATH_0000006',
        //   'PCO_0000024/EUPATH_0000025',
        //   'EUPATH_0000776/EUPATH_0000335',
        //   'EUPATH_0000776/EUPATH_0000722',
        // ]}
        // isSelectable={true}
        // onSelectionChange={(ids) => console.log('MEMES', ids)}
        autoFocusSearchBox={autoFocus}
        tree={tree}
        expandedList={expandedNodes}
        getNodeId={getNodeId}
        getNodeChildren={getNodeChildren}
        onExpansionChange={setExpandedNodes}
        isSearchable={true}
        searchBoxPlaceholder="Find a variable"
        searchBoxHelp={makeSearchHelpText(
          'variables by name, description, or values'
        )}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        searchPredicate={searchPredicate}
        renderNode={renderNode}
        additionalFilters={additionalFilters}
        isAdditionalFilterApplied={isAdditionalFilterApplied}
      />
    </div>
  );
}

/**
 * Tree of Fields, used to set the active field.
 */
const getNodeSearchString = (valuesMap: ValuesMap) => {
  return ({
    field: { term, display = '', description = '', variableName = '' },
  }: getNodeSearchStringType) => {
    return `${display} ${description} ${variableName} ${
      valuesMap[term] || ''
    }`.toLowerCase();
  };
};

const FieldNode = ({
  field,
  searchTerm,
  isActive,
  isDisabled,
  customDisabledVariableMessage,
  handleFieldSelect,
  activeFieldEntity,
  isStarred,
  starredVariablesLoading,
  onClickStar,
  scrollIntoView,
  isMultiFilterDescendant,
  showMultiFilterDescendants,
}: FieldNodeProps) => {
  const nodeRef = useRef<HTMLAnchorElement>(null);

  useLayoutEffect(() => {
    // hack: Use setTimeout since DOM may not reflect the current state of expanded nodes.
    // hack: This ensures that the node is visible when attempting to scroll into view.
    let timerId = setTimeout(() => {
      if (
        scrollIntoView &&
        isActive &&
        nodeRef.current?.offsetParent instanceof HTMLElement
      ) {
        scrollIntoViewIfNeeded(nodeRef.current.offsetParent);
      }
    });
    return () => clearTimeout(timerId);
  }, [isActive, searchTerm, scrollIntoView]);

  const fieldContents = (
    isMulti(field) ? !showMultiFilterDescendants : isFilterField(field)
  ) ? (
    <Tooltip
      title={
        isDisabled
          ? customDisabledVariableMessage ??
            'This variable cannot be used with this plot and other variable selections.'
          : 'Select this variable.'
      }
    >
      <a
        ref={nodeRef}
        className={
          'wdk-AttributeFilterFieldItem' +
          (isActive ? ' wdk-AttributeFilterFieldItem__active' : '') +
          (isDisabled ? ' wdk-AttributeFilterFieldItem__disabled' : '')
        }
        href={'#' + field.term}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isDisabled) handleFieldSelect(field);
        }}
      >
        <Icon fa={getIcon(field)} /> {safeHtml(field.display)}
      </a>
    </Tooltip>
  ) : (
    //add condition for identifying entity parent and entity parent of activeField
    <div
      className={
        'wdk-Link wdk-AttributeFilterFieldParent' +
        (field.term.includes('entity:')
          ? ' wdk-AttributeFilterFieldEntityParent'
          : '') +
        (activeFieldEntity != null &&
        field.term.split(':')[1] === activeFieldEntity
          ? ' wdk-AttributeFilterFieldParent__active'
          : '')
      }
    >
      {safeHtml(field.display)}
    </div>
  );

  const canBeStarred = isFilterField(field) && !isMultiFilterDescendant;

  return (
    <div className={canBeStarred ? cx('-StarContainer') : ''}>
      {isFilterField(field) && !isMultiFilterDescendant && (
        <Tooltip title={makeStarButtonTooltipContent(field, isStarred)}>
          <button
            className={`${cx('-StarButton')} link`}
            onClick={(e) => {
              // prevent click from toggling expansion state
              e.stopPropagation();
              onClickStar();
            }}
            disabled={starredVariablesLoading}
          >
            <Icon fa={isStarred ? 'star' : 'star-o'} />
          </button>
        </Tooltip>
      )}
      {fieldContents}
    </div>
  );
};

function getIcon(field: Field) {
  return isRange(field) ? 'bar-chart-o' : isMulti(field) ? 'th-list' : 'list';
}

function makeStarButtonTooltipContent(
  field: VariableField,
  isStarred: boolean
) {
  return (
    <>
      Click to {isStarred ? 'unstar' : 'star'}{' '}
      <strong>{safeHtml(field.display)}</strong>.
    </>
  );
}

function makeStarredVariablesFilterTooltipContent(
  showOnlyStarredVariables: boolean,
  starredVariablesToggleDisabled: boolean
) {
  return starredVariablesToggleDisabled ? (
    <>To use this filter, star at least one variable below</>
  ) : showOnlyStarredVariables ? (
    <>Click to show all variables</>
  ) : (
    <>Click to show only starred variables</>
  );
}
