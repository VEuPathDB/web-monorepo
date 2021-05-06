/*
 * This is based on FieldList.jsx for typing
 */

import { difference, uniq } from 'lodash';
import React, {
  useLayoutEffect,
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react';
//correct paths as this is a copy of FieldList component at @veupathdb/
import { scrollIntoViewIfNeeded } from '@veupathdb/wdk-client/lib/Utils/DomUtils';
import {
  areTermsInString,
  makeSearchHelpText,
} from '@veupathdb/wdk-client/lib/Utils/SearchUtils';
import { preorderSeq } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import CheckboxTree from '@veupathdb/wdk-client/lib/Components/CheckboxTree/CheckboxTree';
import Icon from '@veupathdb/wdk-client/lib/Components/Icon/IconAlt';
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
}

type valuesMapType = Record<string, string>;

interface VariableListProps {
  activeField?: VariableField;
  onActiveFieldChange: (term: string) => void;
  valuesMap: valuesMapType;
  fieldTree: VariableFieldTreeNode;
  autoFocus: boolean;
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

  // If a new entity is expanded, we will collapse other entities and select the default
  // variable of the newly expanded entity. Note that the logic of selecting the default
  // variable is handled externally to this component.
  const handleExpansionChange = useCallback(
    (nextExpandedNodes: string[]) => {
      const newNodes = difference(nextExpandedNodes, expandedNodes);
      // FIXME Handle expandAll?? Currently only the first entity will be expanded.
      const newEntityNode = newNodes.find((node) => node.startsWith('entity:'));
      if (newEntityNode) {
        const newEntityId = newEntityNode.slice(7);
        if (activeFieldEntity !== newEntityId) {
          onActiveFieldChange(newEntityId);
        }
        const nodes = nextExpandedNodes.filter(
          (term) => !term.startsWith('entity:') || term === newEntityNode
        );
        setExpandedNodes(nodes);
      } else {
        setExpandedNodes(nextExpandedNodes);
      }
    },
    [activeFieldEntity, expandedNodes, onActiveFieldChange]
  );

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

  const renderNode = useCallback(
    (node: FieldTreeNode) => {
      return (
        <FieldNode
          node={node}
          searchTerm={searchTerm}
          isActive={node.field.term === activeField?.term}
          handleFieldSelect={handleFieldSelect}
          //add activefieldEntity prop (parent entity obtained from activeField)
          //alternatively, send activeField and isActive is directly checked at FieldNode
          activeFieldEntity={activeFieldEntity}
        />
      );
    },
    [activeField?.term, activeFieldEntity, handleFieldSelect, searchTerm]
  );

  return (
    <div className={cx('-VariableList')}>
      <CheckboxTree
        autoFocusSearchBox={autoFocus}
        tree={fieldTree}
        expandedList={expandedNodes}
        getNodeId={getNodeId}
        getNodeChildren={getNodeChildren}
        onExpansionChange={handleExpansionChange}
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

  return (
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
};

const getIcon = (field: Field) => {
  return isRange(field) ? 'bar-chart-o' : isMulti(field) ? 'th-list' : 'list';
};
