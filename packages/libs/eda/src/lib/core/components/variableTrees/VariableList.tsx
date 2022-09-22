import { uniq } from 'lodash';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useContext,
  ReactNode,
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
import SelectTree from '@veupathdb/coreui/dist/components/inputs/SelectTree/SelectTree';
import CheckboxTree from '@veupathdb/coreui/dist/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
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
import { VariableScope } from '../../types/study';
import { ShowHideVariableContext } from '../../utils/show-hide-variable-context';

import { pruneEmptyFields } from '../../utils/wdk-filter-param-adapter';

import { Tooltip as VarTooltip } from '../docs/variable-constraints';
import { useActiveDocument } from '../docs/DocumentationContainer';
import { CustomCheckboxes } from '@veupathdb/wdk-client/lib/Components/CheckboxTree/CheckboxTreeNode';
import { Toggle } from '@veupathdb/coreui';

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

export interface VariableFieldTreeNode extends FieldTreeNode {
  field: VariableField;
  children: VariableFieldTreeNode[];
}

interface FieldNodeProps {
  field: VariableField;
  searchTerm: string;
  isActive: boolean;
  isMultiPick: boolean;
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
  asDropdown?: boolean;
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
  customCheckboxes?: CustomCheckboxes<VariableFieldTreeNode>;
  startExpanded?: boolean;
  asDropdown?: boolean;
  clearSelectionButton?: ReactNode;
  dropdownLabel?: string;
  scope?: VariableScope;
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
  customCheckboxes,
  startExpanded,
  asDropdown,
  clearSelectionButton,
  dropdownLabel,
  scope,
}: VariableListProps) {
  // useContext is used here with ShowHideVariableContext
  const {
    showOnlyCompatibleVariables,
    setShowOnlyCompatibleVariablesHandler,
  } = useContext(ShowHideVariableContext);
  const isMultiPick = mode === 'multiSelection';

  const [searchTerm, setSearchTerm] = useState<string>('');
  const { setActiveDocument } = useActiveDocument();
  const getPathToField = useCallback(
    (field?: Field) => {
      if (field == null) return [];

      return findAncestorFields(fieldTree, field.term)
        .map((field) => field.term)
        .toArray();
    },
    [fieldTree]
  );

  const fieldSequence = useMemo(() => preorderSeq(fieldTree), [fieldTree]);

  const [expandedNodes, setExpandedNodes] = useState(() =>
    startExpanded
      ? fieldSequence.map((node) => node.field.term).toArray()
      : mode === 'singleSelection'
      ? getPathToField(activeField)
      : uniq(selectedFields.flatMap(getPathToField))
  );

  const activeFieldEntity = activeField?.term.split('/')[0];

  // When active field changes, we want to collapse entity nodes that are not an ancestor
  // of the active field. We also want to retain the expanded state of internal nodes, so
  // we will only remove entity nodes from the list of expanded nodes.
  useEffect(() => {
    if (activeField == null || isMultiPick) return;
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
  }, [activeField, activeFieldEntity, getPathToField, isMultiPick]);

  const handleFieldSelect = useCallback(
    (field: Field) => {
      if (isMultiPick && onSelectedFieldsChange) {
        // If `term` is already selected, then remove it; else add it.
        // Note that we're using the destructive `.splice()` method here when
        // removing to make the code a little more efficient and succinct. We can
        // get away with this becuase we're creating a new array, via `.map()`.
        const selectedFieldTerms = selectedFields.map((field) => field.term);
        const indexOfField = selectedFieldTerms.indexOf(field.term);
        if (indexOfField === -1) selectedFieldTerms.push(field.term);
        else selectedFieldTerms.splice(indexOfField, 1);
        onSelectedFieldsChange(selectedFieldTerms);
      } else {
        onActiveFieldChange(field.term);
      }
    },
    [isMultiPick, onSelectedFieldsChange, selectedFields, onActiveFieldChange]
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
    const availableVariableTermsArray = fieldSequence
      .filter((node) => isFilterField(node.field))
      .map((node) => node.field.term)
      .toArray();

    return new Set(availableVariableTermsArray);
  }, [fieldSequence]);

  const starredVariablesLoading = starredVariables == null;

  // moved this useState here
  const [showOnlyStarredVariables, setShowOnlyStarredVariables] = useState(
    false
  );

  // make visibleStarredVariableTerms state be used at MyVariable
  const visibleStarredVariableTerms = useMemo(() => {
    const newVisibleStarredVariableTerms = starredVariables?.map(
      ({ entityId, variableId }) => `${entityId}/${variableId}`
    );
    return newVisibleStarredVariableTerms ?? [];
  }, [starredVariables]);

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
    fieldSequence.forEach((node) => {
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
  }, [fieldSequence, showMultiFilterDescendants]);

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
          isMultiPick={isMultiPick}
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
          asDropdown={asDropdown}
        />
      );
    },
    [
      multiFilterDescendants,
      isMultiPick,
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
  }, [setShowOnlyStarredVariables]);

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
            className="btn"
            style={{
              display: 'grid',
              padding: '0.5em',
              gridAutoFlow: 'column',
              gap: '0.4em',
              cursor: starredVariableToggleDisabled ? 'not-allowed' : 'default',
              opacity: starredVariableToggleDisabled ? '0.5' : '1',
              color: '#f8cb6a',
            }}
            type="button"
            onClick={toggleShowOnlyStarredVariables}
            disabled={starredVariableToggleDisabled}
          >
            <Toggle
              value={showOnlyStarredVariables}
              onChange={() => {}}
              disabled={starredVariableToggleDisabled}
              size="small"
              themeRole="primary"
            />
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
      <VarTooltip />
      <br />
      <br />
      <strong>
        <Link
          to="../../../../documentation/variable-constraints"
          target="_blank"
          onClick={(event) => {
            event.preventDefault();
            setActiveDocument('variable-constraints');
          }}
        >
          Learn more
        </Link>
      </strong>{' '}
      about variable compatibility
    </>
  );

  /** Render info on disabled fields, if appropriate. */
  const renderDisabledFields = () =>
    disabledFields.size > 0 && (
      <div
        style={{
          margin: '0.75em',
        }}
      >
        <HtmlTooltip
          css={{
            zIndex: 1,
            /*
             * This is needed to address a compiler error.
             * Not sure why it's complaining, but here we are...
             */
          }}
          title={tooltipContent}
          interactive
          enterDelay={500}
          enterNextDelay={500}
          leaveDelay={0}
          // resolving link inside material-ui's tooltip
          disableFocusListener={true}
        >
          <button
            className="link"
            style={{
              color: '#666',
            }}
            type="button"
            onClick={() => {
              // useContext
              setShowOnlyCompatibleVariablesHandler(
                !showOnlyCompatibleVariables
              );
            }}
          >
            <Toggle
              label="Only show compatible variables"
              labelPosition="right"
              value={showOnlyCompatibleVariables}
              onChange={() => {}}
              size="small"
              themeRole="primary"
            />
          </button>
        </HtmlTooltip>
      </div>
    );

  /**
   * Render featured fields panel, if data supports it.
   */
  const renderFeaturedFields = () => {
    return featuredFields.length && allowedFeaturedFields.length ? (
      <div
        style={{
          padding: '0.5em 1em',
          borderTop: '1px solid #ccc',
          borderBottom: '1px solid #ccc',
          borderLeft: asDropdown ? 'none' : '1px solid #ccc',
          borderRight: asDropdown ? 'none' : '1px solid #ccc',
        }}
      >
        <details
          open={Options.featuredVariablesOpen}
          onToggle={(event: React.SyntheticEvent<HTMLDetailsElement>) => {
            Options.featuredVariablesOpen = event.currentTarget.open;
          }}
        >
          <summary
            style={{
              cursor: 'pointer',
            }}
          >
            <h3
              style={{
                fontSize: '1.05em',
                display: 'inline-block',
                padding: '0.25em',
                margin: 0,
                color: '#222',
                fontWeight: 500,
              }}
            >
              Featured variables
            </h3>
          </summary>
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              marginTop: '0.25em',
              padding: 0,
            }}
          >
            {allowedFeaturedFields.map((field) => {
              const isActive = field.term === activeField?.term;
              const isDisabled = disabledFields.has(field.term);
              const [entityId, variableId] = field.term.split('/');
              const CustomCheckbox =
                customCheckboxes && field.term in customCheckboxes
                  ? customCheckboxes[field.term]
                  : undefined;
              const checked = selectedFields.some((f) => f.term === field.term);
              const onChange = (node: any, checked: boolean) => {
                if (onSelectedFieldsChange == null) return;
                const nextSelectedFields = (checked
                  ? selectedFields.concat(field)
                  : selectedFields.filter((f) => f.term !== field.term)
                ).map((field) => field.term);
                onSelectedFieldsChange(nextSelectedFields);
              };

              return (
                <li
                  key={field.term}
                  style={{
                    lineHeight: '15px',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      marginLeft: '1em',
                    }}
                  >
                    {isMultiPick &&
                      (CustomCheckbox ? (
                        <CustomCheckbox
                          checked={checked}
                          toggleCheckbox={onChange}
                        />
                      ) : (
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => onChange(null, e.target.checked)}
                        />
                      ))}
                    <FieldNode
                      isMultiPick={isMultiPick}
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
                      asDropdown={asDropdown}
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

  return asDropdown ? (
    <div
      style={{
        position: 'relative',
      }}
    >
      <SelectTree
        key={dropdownLabel}
        {...(isMultiPick && {
          selectedList: selectedFields.map((field) => field.term),
          isSelectable: true,
          isMultiPick: true,
          onSelectionChange: onSelectedFieldsChange,
        })}
        linksPosition={CheckboxTree.LinkPlacement.Top}
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
        customCheckboxes={customCheckboxes}
        additionalFilters={additionalFilters}
        isAdditionalFilterApplied={isAdditionalFilterApplied}
        buttonDisplayContent={dropdownLabel}
        wrapPopover={(treeSection) => (
          <>
            {clearSelectionButton}
            <div
              style={{
                position: 'relative',
                borderRadius: '0.25em',
                padding: '0.5em 0.5em 0.5em 0',
                height: '60vh',
                width: '30em',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {renderDisabledFields()}
              {renderFeaturedFields()}
              {treeSection}
            </div>
          </>
        )}
      />
    </div>
  ) : (
    <div
      style={{
        position: 'relative',
        borderRadius: '0.25em',
        padding: '0.5em 0.5em 0.5em 0',
        height: scope === 'download' ? 'auto' : '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {renderDisabledFields()}
      {renderFeaturedFields()}

      <CheckboxTree
        {...(isMultiPick && {
          selectedList: selectedFields.map((field) => field.term),
          isSelectable: true,
          isMultiPick: true,
          onSelectionChange: onSelectedFieldsChange,
        })}
        linksPosition={CheckboxTree.LinkPlacement.Top}
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
        customCheckboxes={customCheckboxes}
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

const baseFieldNodeLinkStyle = {
  padding: '0.25em 0.5em',
  borderRadius: '0.5em',
  display: 'inline-block',
  cursor: 'pointer',
};

const activeFieldNodeLinkStyle = {
  background: '#e6e6e6',
};

const disabledFieldNodeLinkStyle = {
  cursor: 'not-allowed',
  opacity: '0.5',
};

const starStyleOff = {
  color: '#767676',
  fontSize: '1.1em',
};

const starStyleOn = {
  color: '#f8cb6a',
  fontSize: '1.1em',
};

const FieldNode = ({
  field,
  searchTerm,
  isActive,
  isDisabled,
  isMultiPick,
  customDisabledVariableMessage,
  handleFieldSelect,
  activeFieldEntity,
  isStarred,
  starredVariablesLoading,
  onClickStar,
  scrollIntoView,
  isMultiFilterDescendant,
  showMultiFilterDescendants,
  asDropdown,
}: FieldNodeProps) => {
  const nodeRef = useRef<HTMLAnchorElement>(null);

  const nodeColor = { color: asDropdown ? '#2f2f2f' : '#069' };

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
        isMultiPick
          ? ''
          : isDisabled
          ? customDisabledVariableMessage ??
            'This variable cannot be used with this plot and other variable selections.'
          : 'Select this variable.'
      }
    >
      <a
        ref={nodeRef}
        style={
          isActive
            ? {
                ...baseFieldNodeLinkStyle,
                ...activeFieldNodeLinkStyle,
                ...nodeColor,
              }
            : isDisabled
            ? {
                ...baseFieldNodeLinkStyle,
                ...disabledFieldNodeLinkStyle,
                ...nodeColor,
              }
            : { ...baseFieldNodeLinkStyle, ...nodeColor }
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
      style={
        field.term.includes('entity')
          ? {
              fontWeight: 'bold',
              fontSize: '1.05em',
              cursor: 'pointer',
              marginLeft: '0.5em',
              ...nodeColor,
            }
          : { ...baseFieldNodeLinkStyle, ...nodeColor }
      }
    >
      {safeHtml(field.display)}
    </div>
  );

  const canBeStarred = isFilterField(field) && !isMultiFilterDescendant;

  return (
    <div
      style={
        canBeStarred
          ? {
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              paddingLeft: isMultiPick ? 0 : '1em',
            }
          : {}
      }
    >
      {fieldContents}
      {isFilterField(field) && !isMultiFilterDescendant && (
        <Tooltip title={makeStarButtonTooltipContent(field, isStarred)}>
          <button
            className={`link`}
            style={isStarred ? { ...starStyleOn } : { ...starStyleOff }}
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
