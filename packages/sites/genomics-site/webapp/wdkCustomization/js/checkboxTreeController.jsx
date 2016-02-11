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

  constructor(element, name, tree, selectedList, defaultSelectedList, getAttributes) {
    this.element = element;
    this.name = name;
    this.tree = tree;
    this.getAttributes = getAttributes;
    this.displayCheckboxTree = this.displayCheckboxTree.bind(this);
    this.updateSelectedList = this.updateSelectedList.bind(this);
    this.updateExpandedList = this.updateExpandedList.bind(this);
    this.loadDefaultSelectedList = this.loadDefaultSelectedList.bind(this);
    this.loadCurrentSelectedList = this.loadCurrentSelectedList.bind(this);
    this.getNodeReactElement = this.getNodeReactElement.bind(this);
    this.getNodeFormValue = this.getNodeFormValue.bind(this);
    this.getNodeChildren = this.getNodeChildren.bind(this);
    this.getNodeData = this.getNodeData.bind(this);
    this.selectedList = selectedList;
    this.expandedList = this.setExpandedList(this.tree, this.selectedList);
    this.defaultSelectedList = defaultSelectedList;
    this.currentSelectedList = (selectedList || []).concat();
  }

  displayCheckboxTree() {
    console.log("Element again is " + JSON.stringify(this.element[0]));
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

  getNodeData(node) {
    let data = {};
    if(node.question) {
      data.id = node.id;
      data.displayName = node.displayName;
      data.description = node.description;
      return data;
    }
    let targetType = getTargetType(node);
    if (targetType === 'attribute') {
      let attribute = this.getAttributes(node);
      if(attribute == null) {
      // This should not happen...will replace with an exception
      data.displayName = getRefName(node) + "??";
      data.description = getRefName(node) + "??";
      data.id =  "attribute_" + getId(node);
      }
      else {
        data.displayName = attribute.displayName;
        data.description = attribute.help;
        data.id = getRefName(node);
      }
    }
    else {
      data.id = getId(node);
      data.displayName = getDisplayName(node);
      data.description = getDescription(node);
    }
    return data;
  }

  getNodeFormValue(node) {
    return this.getNodeData(node).id
  }


  getNodeReactElement(node) {
    let data = this.getNodeData(node);
    return <span title={data.description}>{data.displayName}</span>
  }


  getNodeChildren(node) {
    return node.children;
  }

  updateSelectedList(selectedList) {
    this.selectedList = selectedList;
    this.displayCheckboxTree();
  }

  updateExpandedList(expandedList) {
    this.expandedList = expandedList;
    this.displayCheckboxTree();
  }

  loadDefaultSelectedList() {
    this.updateSelectedList(this.defaultSelectedList);
  }

  loadCurrentSelectedList() {
    console.log("Current selected list " + JSON.stringify(this.currentSelectedList));
    this.updateSelectedList(this.currentSelectedList);
  }
}