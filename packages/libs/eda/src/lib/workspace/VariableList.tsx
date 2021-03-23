/*
 * This is based on FieldList.jsx for typing
 */

import { memoize, uniq } from 'lodash';
import PropTypes from 'prop-types';
import React, { useLayoutEffect, useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
//correct paths as this is a copy of FieldList component at @veupathdb/
import { scrollIntoViewIfNeeded } from '@veupathdb/wdk-client/lib/Utils/DomUtils';
import { Seq } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
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

//defining types - some are not used (need cleanup later)
interface activeFieldProp {
  type?: string;
  term: string;
  display: string;
  parent?: string;
  isRange?: boolean;
  precision?: number;
  variableName?: string;
  description?: string;
}

interface FieldExtendType extends FieldTreeNode {
  field: activeFieldProp;
  children: [];
}

interface FieldNodeType {
  node: FieldExtendType;
  searchTerm: string;
  isActive: boolean;
  handleFieldSelect: (node: FieldTreeNode) => void;
  activeFieldEntity: string;
}

type valuesMapType = Record<string, string>;

interface VariableListProps {
  activeField: activeFieldProp;
  onActiveFieldChange: (term: string) => void;
  valuesMap: valuesMapType;
  fieldTree: FieldTreeNode;
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
  const _getPathToField = (field: Field) => {
    if (field == null) return [];

    return findAncestorFields(fieldTree, field.term)
      .map((field) => field.term)
      .toArray();
  };

  const {
    activeField,
    onActiveFieldChange,
    valuesMap,
    fieldTree,
    autoFocus,
  } = props;
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedNodes, setExpandedNodes] = useState(
    _getPathToField(activeField)
  );

  useEffect(() => {
    if (
      activeField.parent != null &&
      expandedNodes.includes(activeField.parent)
    ) {
      setExpandedNodes(
        uniq(expandedNodes.concat(_getPathToField(activeField)))
      );
    }
  }, [activeField]);

  const handleCheckboxTreeRef = (component: CheckboxTree<FieldTreeNode>) => {
    const treeDomNode = ReactDOM.findDOMNode(component);
  };

  const handleExpansionChange = (expandedNodes: string[]) => {
    setExpandedNodes(expandedNodes);
  };

  const handleFieldSelect = (node: FieldTreeNode) => {
    onActiveFieldChange(node.field.term);
    const expandedNodesNew = Seq.from(expandedNodes)
      .concat(_getPathToField(node.field))
      .concat(node.children.length > 0 ? Seq.of(node.field.term) : Seq.empty())
      .uniq()
      .toArray();
    setExpandedNodes(expandedNodesNew);
  };

  const handleSearchTermChange = (searchTerm: string) => {
    // update search term, then if it is empty, make sure selected field is visible
    setSearchTerm(searchTerm);
  };

  const getNodeId = (node: FieldTreeNode) => {
    return node.field.term;
  };

  const getNodeChildren = (node: FieldTreeNode) => {
    return isMulti(node.field) ? [] : node.children;
  };

  const getFieldSearchString = (node: FieldTreeNode) => {
    return isMulti(node.field)
      ? preorderSeq(node).map(getNodeSearchString(valuesMap)).join(' ')
      : getNodeSearchString(valuesMap)(node);
  };

  const searchPredicate = (node: FieldTreeNode, searchTerms: string[]) => {
    return areTermsInString(searchTerms, getFieldSearchString(node));
  };

  return (
    <div className="field-list">
      <CheckboxTree
        ref={handleCheckboxTreeRef}
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
        onSearchTermChange={handleSearchTermChange}
        searchPredicate={searchPredicate}
        renderNode={(node: FieldTreeNode) => (
          <FieldNode
            node={node}
            searchTerm={searchTerm}
            isActive={node.field.term === activeField.term}
            handleFieldSelect={handleFieldSelect}
            //add activefieldEntity prop (parent entity obtained from activeField)
            //alternatively, send activeField and isActive is directly checked at FieldNode
            activeFieldEntity={activeField.term.split('/')[0]}
          />
        )}
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

//FieldNodeType type causes a ts error (tried several), so let's use any for now
const FieldNode = ({
  node,
  searchTerm,
  isActive,
  handleFieldSelect,
  activeFieldEntity,
}: any) => {
  //useRef typing is tricky (tried several), so let's use any for now
  const nodeRef = useRef<any>(null);

  useLayoutEffect(() => {
    if (isActive && nodeRef.current && nodeRef?.current?.offsetParent) {
      scrollIntoViewIfNeeded(nodeRef?.current?.offsetParent);
    }
  }, [isActive, nodeRef.current, searchTerm]);

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
        //add condition for making background color of parent entity
        <div
          className={
            'wdk-Link wdk-AttributeFilterFieldParent' +
            (node.field.term.split(':')[1] === activeFieldEntity
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
