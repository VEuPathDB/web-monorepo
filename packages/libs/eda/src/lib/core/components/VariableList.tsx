/*
 * This is based on FieldList.jsx for typing
 */

import { uniq } from 'lodash';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
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
} from '@veupathdb/wdk-client/lib/Components/AttributeFilter/AttributeFilterUtils';
//import types
import {
  Field,
  FieldTreeNode,
} from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';
import { cx } from '../../workspace/Utils';
import { Tooltip } from '@material-ui/core';
import { HtmlTooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

//defining types - some are not used (need cleanup later)
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
  handleFieldSelect: (field: VariableField) => void;
  activeFieldEntity?: string;
  isStarred: boolean;
  starredVariablesLoading: boolean;
  onClickStar: () => void;
  scrollIntoView: boolean;
}

type valuesMapType = Record<string, string>;

interface VariableListProps {
  activeField?: VariableField;
  onActiveFieldChange: (term: string) => void;
  valuesMap: valuesMapType;
  fieldTree: VariableFieldTreeNode;
  autoFocus: boolean;
  starredVariables?: string[];
  toggleStarredVariable: (targetVariableId: string) => void;
  disabledFieldIds?: string[];
  hideDisabledFields: boolean;
  setHideDisabledFields: (hide: boolean) => void;
  featuredFields: VariableField[];
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

export default function VariableList(props: VariableListProps) {
  const {
    activeField,
    disabledFieldIds,
    onActiveFieldChange,
    valuesMap,
    fieldTree,
    featuredFields,
    autoFocus,
    starredVariables,
    toggleStarredVariable,
    hideDisabledFields,
    setHideDisabledFields,
  } = props;
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

  const getNodeChildren = useCallback((node: FieldTreeNode) => {
    return isMulti(node.field) ? [] : node.children;
  }, []);

  const getFieldSearchString = useCallback(
    (node: FieldTreeNode) => {
      return isMulti(node.field)
        ? preorderSeq(node).map(getNodeSearchString(valuesMap)).join(' ')
        : getNodeSearchString(valuesMap)(node);
    },
    [valuesMap]
  );

  const searchPredicate = useCallback(
    (node: FieldTreeNode, searchTerms: string[]) => {
      return areTermsInString(searchTerms, getFieldSearchString(node));
    },
    [getFieldSearchString]
  );

  const availableVariables = useMemo(() => {
    const availableVariablesArray = preorderSeq(fieldTree)
      .filter((node) => isFilterField(node.field))
      .map((node) => node.field.term.split('/')[1])
      .toArray();

    return new Set(availableVariablesArray);
  }, [fieldTree]);

  const starredVariablesLoading = starredVariables == null;

  // moved this useState here
  const [showOnlyStarredVariables, setShowOnlyStarredVariables] = useState(
    false
  );

  // make visibleStarredVariables state be used at MyVariable
  const [visibleStarredVariables, setVisibleStarredVariables] = useState<
    string[]
  >([]);

  const starredVariablesSet = useMemo(() => {
    const presentStarredVariables = starredVariables?.filter((variableId) =>
      availableVariables.has(variableId)
    );

    return new Set(presentStarredVariables);
  }, [availableVariables, starredVariables]);

  // this will be used for MyVariable instead of starredVariableSet
  const visibleStarredVariablesSet = useMemo(() => {
    const presentStarredVariables = visibleStarredVariables?.filter(
      (variableId) => availableVariables.has(variableId)
    );

    return new Set(presentStarredVariables);
  }, [availableVariables, visibleStarredVariables]);

  const disabledFields = useMemo(() => new Set(disabledFieldIds), [
    disabledFieldIds,
  ]);

  const renderNode = useCallback(
    (node: FieldTreeNode) => {
      const [, variableId] = node.field.term.split('/');

      return (
        <FieldNode
          field={node.field}
          searchTerm={searchTerm}
          isActive={node.field.term === activeField?.term}
          isDisabled={disabledFields.has(node.field.term)}
          handleFieldSelect={handleFieldSelect}
          //add activefieldEntity prop (parent entity obtained from activeField)
          //alternatively, send activeField and isActive is directly checked at FieldNode
          activeFieldEntity={activeFieldEntity}
          isStarred={starredVariablesSet.has(variableId)}
          starredVariablesLoading={starredVariablesLoading}
          onClickStar={() => toggleStarredVariable(variableId)}
          scrollIntoView
        />
      );
    },
    [
      activeField?.term,
      activeFieldEntity,
      disabledFields,
      handleFieldSelect,
      searchTerm,
      starredVariablesLoading,
      starredVariablesSet,
      toggleStarredVariable,
    ]
  );

  const toggleShowOnlyStarredVariables = useCallback(() => {
    setShowOnlyStarredVariables((oldValue) => !oldValue);
    setVisibleStarredVariables(starredVariables ?? []);
  }, [starredVariables]);

  const starredVariableToggleDisabled =
    !showOnlyStarredVariables && starredVariablesSet.size === 0;

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

  const wrapTreeSection = useCallback(
    (treeSection: React.ReactNode) => {
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
      return (
        <>
          {disabledFields.size > 0 && (
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
                    setHideDisabledFields(!hideDisabledFields);
                  }}
                >
                  <Toggle on={hideDisabledFields} /> Only show compatible
                  variables
                </button>
              </HtmlTooltip>
            </div>
          )}
          {featuredFields.length && (
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
                  {featuredFields.map((field) => {
                    const isActive = field.term === activeField?.term;
                    const isDisabled = disabledFields.has(field.term);
                    const variableId = field.term.split('/')[1];
                    return (
                      <li
                        key={field.term}
                        className="wdk-CheckboxTreeItem wdk-CheckboxTreeItem__leaf"
                      >
                        <div className="wdk-CheckboxTreeNodeContent">
                          <FieldNode
                            field={field}
                            isActive={isActive}
                            isDisabled={isDisabled}
                            searchTerm=""
                            handleFieldSelect={handleFieldSelect}
                            isStarred={starredVariablesSet.has(variableId)}
                            starredVariablesLoading={starredVariablesLoading}
                            onClickStar={() =>
                              toggleStarredVariable(variableId)
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
          )}
          {treeSection}
        </>
      );
    },
    [
      disabledFields,
      hideDisabledFields,
      featuredFields,
      setHideDisabledFields,
      activeField?.term,
      handleFieldSelect,
      starredVariablesSet,
      starredVariablesLoading,
      toggleStarredVariable,
    ]
  );

  const isAdditionalFilterApplied = showOnlyStarredVariables;

  const tree = useMemo(() => {
    const tree =
      !showOnlyStarredVariables || starredVariableToggleDisabled
        ? fieldTree
        : pruneDescendantNodes(
            (node) =>
              node.children.length > 0 ||
              // visibleStarredVariablesSet is used for MyVariable instead of starredVariableSet
              visibleStarredVariablesSet.has(node.field.term.split('/')[1]),
            fieldTree
          );
    return hideDisabledFields
      ? pruneDescendantNodes((node) => {
          if (disabledFields.size === 0) return true;
          if (node.field.type == null) return node.children.length > 0;
          return !disabledFields.has(node.field.term);
        }, tree)
      : tree;
  }, [
    showOnlyStarredVariables,
    starredVariableToggleDisabled,
    fieldTree,
    hideDisabledFields,
    visibleStarredVariablesSet,
    disabledFields,
  ]);

  return (
    <div className={cx('-VariableList')}>
      <CheckboxTree
        autoFocusSearchBox={autoFocus}
        tree={tree}
        expandedList={expandedNodes}
        getNodeId={getNodeId}
        getNodeChildren={getNodeChildren}
        onExpansionChange={setExpandedNodes}
        isSelectable={false}
        isSearchable={true}
        searchBoxPlaceholder="Find a variable"
        searchBoxHelp={makeSearchHelpText(
          'the variables by name or description'
        )}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        searchPredicate={searchPredicate}
        renderNode={renderNode}
        additionalFilters={additionalFilters}
        isAdditionalFilterApplied={isAdditionalFilterApplied}
        wrapTreeSection={wrapTreeSection}
      />
    </div>
  );
}

/**
 * Tree of Fields, used to set the active field.
 */
const getNodeSearchString = (valuesMap: valuesMapType) => {
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
  handleFieldSelect,
  activeFieldEntity,
  isStarred,
  starredVariablesLoading,
  onClickStar,
  scrollIntoView,
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

  const fieldContents = isFilterField(field) ? (
    <Tooltip
      title={
        isDisabled
          ? 'This variable cannot be used with this plot and other variable selections.'
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

  return (
    <>
      {isFilterField(field) && (
        <Tooltip title={makeStarButtonTooltipContent(field, isStarred)}>
          <button
            className={`${cx('-StarButton')} link`}
            onClick={onClickStar}
            disabled={starredVariablesLoading}
          >
            <Icon fa={isStarred ? 'star' : 'star-o'} />
          </button>
        </Tooltip>
      )}
      {fieldContents}
    </>
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
      Click to {isStarred ? 'unstar' : 'star'} <strong>{field.display}</strong>.
    </>
  );
}

function makeStarredVariablesFilterTooltipContent(
  showOnlyStarredVariables: boolean,
  starredVariablesToggleDisabled: boolean
) {
  return starredVariablesToggleDisabled ? (
    <>To use this filter, star at least one variable below.</>
  ) : showOnlyStarredVariables ? (
    <>Click to show all variables.</>
  ) : (
    <>Click to show only starred variables.</>
  );
}
