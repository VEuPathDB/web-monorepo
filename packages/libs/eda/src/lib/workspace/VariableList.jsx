import { memoize, uniq } from 'lodash';
import PropTypes from 'prop-types';
import React, { useLayoutEffect, useRef } from 'react';
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

/**
 * Tree of Fields, used to set the active field.
 */
//change class name from FieldList to VariableList
export default class VariableList extends React.Component {
  // eslint-disable-line react/no-deprecated

  constructor(props) {
    super(props);
    this.handleCheckboxTreeRef = this.handleCheckboxTreeRef.bind(this);
    this.getNodeId = this.getNodeId.bind(this);
    this.getNodeChildren = this.getNodeChildren.bind(this);
    this.handleExpansionChange = this.handleExpansionChange.bind(this);
    this.handleFieldSelect = this.handleFieldSelect.bind(this);
    this.handleSearchTermChange = this.handleSearchTermChange.bind(this);
    this.searchPredicate = this.searchPredicate.bind(this);
    this.getFieldSearchString = memoize(this.getFieldSearchString);

    this.state = {
      searchTerm: '',

      // expand branch containing selected field
      expandedNodes: this._getPathToField(this.props.activeField),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.activeField == null ||
      this.props.activeField === nextProps.activeField
    )
      return;

    if (
      nextProps.activeField.parent != null &&
      !this.state.expandedNodes.includes(nextProps.activeField.parent)
    ) {
      this.setState({
        expandedNodes: uniq(
          this.state.expandedNodes.concat(
            this._getPathToField(nextProps.activeField)
          )
        ),
      });
    }
  }

  handleCheckboxTreeRef(component) {
    this.treeDomNode = ReactDOM.findDOMNode(component);
  }

  handleExpansionChange(expandedNodes) {
    this.setState({ expandedNodes });
  }

  handleFieldSelect(node) {
    this.props.onActiveFieldChange(node.field.term);
    const expandedNodes = Seq.from(this.state.expandedNodes)
      .concat(this._getPathToField(node.field))
      .concat(node.children.length > 0 ? Seq.of(node.field.term) : Seq.empty())
      .uniq()
      .toArray();
    this.setState({ expandedNodes });
  }

  handleSearchTermChange(searchTerm) {
    // update search term, then if it is empty, make sure selected field is visible
    this.setState({ searchTerm });
  }
  getNodeId(node) {
    return node.field.term;
  }

  getNodeChildren(node) {
    return isMulti(node.field) ? [] : node.children;
  }

  getFieldSearchString(node) {
    return isMulti(node.field)
      ? preorderSeq(node)
          .map(getNodeSearchString(this.props.valuesMap))
          .join(' ')
      : getNodeSearchString(this.props.valuesMap)(node);
  }

  searchPredicate(node, searchTerms) {
    return areTermsInString(searchTerms, this.getFieldSearchString(node));
  }

  _getPathToField(field) {
    if (field == null) return [];

    return findAncestorFields(this.props.fieldTree, field.term)
      .map((field) => field.term)
      .toArray();
  }

  render() {
    var { activeField, autoFocus, fieldTree } = this.props;

    return (
      <div className="field-list">
        <CheckboxTree
          ref={this.handleCheckboxTreeRef}
          autoFocusSearchBox={autoFocus}
          tree={fieldTree}
          expandedList={this.state.expandedNodes}
          getNodeId={this.getNodeId}
          getNodeChildren={this.getNodeChildren}
          onExpansionChange={this.handleExpansionChange}
          isSelectable={false}
          isSearchable={true}
          searchBoxPlaceholder="Find a variable"
          searchBoxHelp={makeSearchHelpText(
            'the variables by name or description'
          )}
          searchTerm={this.state.searchTerm}
          onSearchTermChange={this.handleSearchTermChange}
          searchPredicate={this.searchPredicate}
          renderNode={(node) => (
            <FieldNode
              node={node}
              searchTerm={this.state.searchTerm}
              isActive={
                activeField != null && node.field.term === activeField.term
              }
              handleFieldSelect={this.handleFieldSelect}
              //add activefieldEntity prop (parent entity obtained from activeField)
              //alternatively, send activeField and isActive is directly checked at FieldNode
              activeFieldEntity={activeField?.term.split('/')[0]}
            />
          )}
        />
      </div>
    );
  }
}

//change name from FieldList to VariableList
VariableList.propTypes = {
  autoFocus: PropTypes.bool,
  fieldTree: PropTypes.object.isRequired,
  onActiveFieldChange: PropTypes.func.isRequired,
  activeField: PropTypes.object,
  valuesMap: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string).isRequired)
    .isRequired,
};

function getNodeSearchString(valuesMap) {
  return function ({
    field: { term, display = '', description = '', variableName = '' },
  }) {
    return `${display} ${description} ${variableName} ${
      valuesMap[term] || ''
    }`.toLowerCase();
  };
}

function FieldNode({
  node,
  searchTerm,
  isActive,
  handleFieldSelect,
  activeFieldEntity,
}) {
  const nodeRef = useRef(null);

  useLayoutEffect(() => {
    if (isActive && nodeRef.current && nodeRef.current.offsetParent) {
      scrollIntoViewIfNeeded(nodeRef.current.offsetParent);
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
            (activeFieldEntity &&
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
}

function getIcon(field) {
  return isRange(field) ? 'bar-chart-o' : isMulti(field) ? 'th-list' : 'list';
}
