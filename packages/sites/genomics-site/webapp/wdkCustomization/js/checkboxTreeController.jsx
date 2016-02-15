import React from 'react';
import ReactDOM from 'react-dom';
import CheckboxTree from 'wdk-client-components/CheckboxTree';
import {
  getTargetType,
  getRefName,
  getId,
  getDisplayName,
  getDescription
} from 'wdk-client-utils/OntologyUtils';
import {
  isLeafNode,
  getLeaves,
  getNodeByValue
} from 'wdk-client-utils/TreeUtils';

// serves as MVC controller for checkbox tree on results page
export default class CheckboxTreeController {

  constructor(element, name, tree, selectedList, defaultSelectedList) {
    this.element = element;
    this.name = name;
    this.tree = tree;
    this.displayCheckboxTree = this.displayCheckboxTree.bind(this);
    this.updateSelectedList = this.updateSelectedList.bind(this);
    this.updateExpandedList = this.updateExpandedList.bind(this);
    this.loadDefaultSelectedList = this.loadDefaultSelectedList.bind(this);
    this.loadCurrentSelectedList = this.loadCurrentSelectedList.bind(this);
    this.getNodeReactElement = this.getNodeReactElement.bind(this);
    this.getNodeFormValue = this.getNodeFormValue.bind(this);
    this.getNodeChildren = this.getNodeChildren.bind(this);
    this.selectedList = selectedList;
    this.expandedList = this.setExpandedList(this.tree, this.selectedList);
    this.defaultSelectedList = defaultSelectedList;
    this.currentSelectedList = (selectedList || []).concat();
  }

  displayCheckboxTree() {
    ReactDOM.render(
      <CheckboxTree tree={this.tree}
                    selectedList={this.selectedList}
                    expandedList={this.expandedList}
                    name={this.name}
                    onSelectedListUpdated={this.updateSelectedList}
                    onExpandedListUpdated={this.updateExpandedList}
                    onDefaultSelectedListLoaded={this.loadDefaultSelectedList}
                    onCurrentSelectedListLoaded={this.loadCurrentSelectedList}
                    getNodeReactElement={this.getNodeReactElement}
                    getNodeFormValue={this.getNodeFormValue}
                    getNodeChildren={this.getNodeChildren}
      />, this.element[0]);
  }

  /**
   * Returns boolean indicating whether the given node is indeterminate
   */
  isIndeterminate(node, selectedList) {

    // if only some of the descendent leaf nodes are in the selected nodes list, the given
    // node is indeterminate.  If the given node is a leaf node, it cannot be indeterminate
    let indeterminate = false;

    // If the selected list is empty, or non-existant no nodes are intermediate and there is nothing to do.
    if (selectedList) {
      if (!isLeafNode(node, this.getNodeChildren)) {
        let leafNodes = getLeaves(node, this.getNodeChildren);
        let total = leafNodes.reduce((count, leafNode) => {
          return selectedList.indexOf(this.getNodeFormValue(leafNode)) > -1 ? count + 1 : count;
        }, 0);
        if (total > 0 && total < leafNodes.length) {
          indeterminate = true;
        }
      }
    }
    return indeterminate;
  }


  /**
   * Used to replace a non-existant expanded list with one obeying business rules (called recursively).
   * Invokes action callback for updating the new expanded list.
   */
  setExpandedList(nodes, selectedList, expandedList = []) {

    // If the selected list is empty or non-existant, the expanded list is likewise empty and there is nothing
    // more to do.
    if (selectedList && selectedList.length > 0) {
      nodes.forEach(node => {

        // According to the business rule, indeterminate nodes get expanded.
        if (this.isIndeterminate(node, selectedList)) {
          expandedList.push(this.getNodeFormValue(node));
        }
        // descend the tree
        this.setExpandedList(this.getNodeChildren(node), selectedList, expandedList);
      });
    }
    return expandedList;
  }


  /**
   * Callback to provide the value/id of the node (i.e., checkbox value).  Using 'name' for
   * leaves and processed 'label' for branches
   * @param node - given id
   * @returns {*} - id/value of node
   */
  getNodeFormValue(node) {
    return getTargetType(node) === 'attribute' ? getRefName(node) : getId(node);
  }


  /**
   * Callback to provide a React element holding the display name and description for the node
   * @param node - given node
   * @returns {XML} - React element
   */
  getNodeReactElement(node) {
    return <span title={getDescription(node)}>{getDisplayName(node)}</span>
  }


  /**
   * Callback to provide the node children
   * @param node - given node
   * @returns {Array}  child nodes
   */
  getNodeChildren(node) {
    return node.children;
  }


  /**
   * Callback to update the selected node list nd re-render the tree
   * @param selectedList - array of the values of the selected nodes
   */
  updateSelectedList(selectedList) {
    this.selectedList = selectedList;
    this.displayCheckboxTree();
  }


  /**
   * Callback to update the expanded node list and re-render the tree
   * @param expandedList - array of the values of the expanded nodes
   */
  updateExpandedList(expandedList) {
    this.expandedList = expandedList;
    this.displayCheckboxTree();
  }


  /**
   * Callback to update the selected node list to reflect the default selected list and re-render the tree
   */
  loadDefaultSelectedList() {
    this.updateSelectedList(this.defaultSelectedList);
  }


  /**
   * Callback to update the selected node list to reflect the selections in place when the add columns form was last submitted
   * or the current user preferences and to re-render the tree
   */
  loadCurrentSelectedList() {
    this.updateSelectedList(this.currentSelectedList);
  }
}