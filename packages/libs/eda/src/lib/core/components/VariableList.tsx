/*
 * This is based on FieldList.jsx for typing
 */

import { difference, uniq } from 'lodash';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import Tooltip from '@veupathdb/wdk-client/lib/Components/Overlays/Tooltip';
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
  node: VariableFieldTreeNode;
  searchTerm: string;
  isActive: boolean;
  handleFieldSelect: (node: VariableFieldTreeNode) => void;
  activeFieldEntity?: string;
  isStarred: boolean;
  starredVariablesLoading: boolean;
  onClickStar: () => void;
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
}

interface getNodeSearchStringType {
  field: {
    term: string;
    display?: string;
    description?: string;
    variableName?: string;
  };
}

export default function VariableList(props: VariableListProps) {
  const {
    activeField,
    onActiveFieldChange,
    valuesMap,
    fieldTree,
    autoFocus,
    starredVariables,
    toggleStarredVariable,
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
    (node: FieldTreeNode) => {
      onActiveFieldChange(node.field.term);
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

  const starredVariablesLoading = starredVariables == null;

  const starredVariablesSet = useMemo(() => new Set(starredVariables), [
    starredVariables,
  ]);

  const renderNode = useCallback(
    (node: FieldTreeNode) => {
      const [, variableId] = node.field.term.split('/');

      return (
        <FieldNode
          node={node}
          searchTerm={searchTerm}
          isActive={node.field.term === activeField?.term}
          handleFieldSelect={handleFieldSelect}
          //add activefieldEntity prop (parent entity obtained from activeField)
          //alternatively, send activeField and isActive is directly checked at FieldNode
          activeFieldEntity={activeFieldEntity}
          isStarred={starredVariablesSet.has(variableId)}
          starredVariablesLoading={starredVariablesLoading}
          onClickStar={() => toggleStarredVariable(variableId)}
        />
      );
    },
    [
      activeField?.term,
      activeFieldEntity,
      handleFieldSelect,
      searchTerm,
      starredVariablesLoading,
      starredVariablesSet,
      toggleStarredVariable,
    ]
  );

  const [showOnlyStarredVariables, setShowOnlyStarredVariables] = useState(
    false
  );

  const toggleShowOnlyStarredVariables = useCallback(() => {
    setShowOnlyStarredVariables((oldValue) => !oldValue);
  }, []);

  const starredVariableToggleDisabled = starredVariablesSet.size === 0;

  useEffect(() => {
    if (starredVariableToggleDisabled) {
      setShowOnlyStarredVariables(false);
    }
  }, [starredVariableToggleDisabled]);

  const additionalFilters = useMemo(
    () => [
      <Tooltip
        content={makeStarredVariablesFilterTooltipContent(
          showOnlyStarredVariables,
          starredVariableToggleDisabled
        )}
        hideDelay={0}
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
      toggleShowOnlyStarredVariables,
      starredVariableToggleDisabled,
    ]
  );

  const isAdditionalFilterApplied = showOnlyStarredVariables;

  const tree = useMemo(
    () =>
      !showOnlyStarredVariables || starredVariableToggleDisabled
        ? fieldTree
        : pruneDescendantNodes(
            (node) =>
              node.children.length > 0 ||
              starredVariablesSet.has(node.field.term.split('/')[1]),
            fieldTree
          ),
    [
      fieldTree,
      showOnlyStarredVariables,
      starredVariablesSet,
      starredVariableToggleDisabled,
    ]
  );

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
  node,
  searchTerm,
  isActive,
  handleFieldSelect,
  activeFieldEntity,
  isStarred,
  starredVariablesLoading,
  onClickStar,
}: FieldNodeProps) => {
  const nodeRef = useRef<HTMLAnchorElement>(null);

  useLayoutEffect(() => {
    // hack: Use setTimeout since DOM may not reflect the current state of expanded nodes.
    // hack: This ensures that the node is visible when attempting to scroll into view.
    let timerId = setTimeout(() => {
      if (isActive && nodeRef.current?.offsetParent instanceof HTMLElement) {
        scrollIntoViewIfNeeded(nodeRef.current.offsetParent);
      }
    });
    return () => clearTimeout(timerId);
  }, [isActive, searchTerm]);

  const fieldContents = (
    <Tooltip content={node.field.description} hideDelay={0}>
      {isFilterField(node.field) ? (
        <a
          ref={nodeRef}
          className={
            'wdk-AttributeFilterFieldItem' +
            (isActive ? ' wdk-AttributeFilterFieldItem__active' : '')
          }
          href={'#' + node.field.term}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFieldSelect(node);
          }}
        >
          <Icon fa={getIcon(node.field)} /> {node.field.display}
        </a>
      ) : (
        //add condition for identifying entity parent and entity parent of activeField
        <div
          className={
            'wdk-Link wdk-AttributeFilterFieldParent' +
            (node.field.term.includes('entity:')
              ? ' wdk-AttributeFilterFieldEntityParent'
              : '') +
            (activeFieldEntity != null &&
            node.field.term.split(':')[1] === activeFieldEntity
              ? ' wdk-AttributeFilterFieldParent__active'
              : '')
          }
        >
          {node.field.display}
        </div>
      )}
    </Tooltip>
  );

  return (
    <>
      {isFilterField(node.field) && (
        <Tooltip
          content={makeStarButtonTooltipContent(node, isStarred)}
          hideDelay={0}
        >
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

const getIcon = (field: Field) => {
  return isRange(field) ? 'bar-chart-o' : isMulti(field) ? 'th-list' : 'list';
};

function makeStarButtonTooltipContent(
  node: VariableFieldTreeNode,
  isStarred: boolean
) {
  return (
    <>
      Click to {isStarred ? 'remove' : 'add'}{' '}
      <strong>{node.field.display}</strong> {isStarred ? 'from' : 'to'}{' '}
      <strong>My Variables</strong>.
    </>
  );
}

function makeStarredVariablesFilterTooltipContent(
  showOnlyStarredVariables: boolean,
  starredVariablesToggleDisabled: boolean
) {
  return starredVariablesToggleDisabled ? (
    <>
      To use this filter, add at least one variable to{' '}
      <strong>My Variables</strong>.
    </>
  ) : showOnlyStarredVariables ? (
    <>Click to show all variables.</>
  ) : (
    <>
      Click to show only variables from <strong>My Variables</strong>.
    </>
  );
}
