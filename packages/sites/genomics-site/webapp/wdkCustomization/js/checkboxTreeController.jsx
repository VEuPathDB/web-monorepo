import React from 'react';
import ReactDOM from 'react-dom';
import SearchableCheckboxTree from 'wdk-client-components/SearchableCheckboxTree';
import CheckboxTree from 'wdk-client-components/CheckboxTree';
import {
  getTargetType,
  getRefName,
  getId,
  getDisplayName,
  getDescription,
  getNodeFormValue,
  getBasicNodeReactElement,
  getNodeChildren
} from 'wdk-client-utils/OntologyUtils';
import {
  isLeafNode,
  getLeaves,
  getNodeByValue
} from 'wdk-client-utils/TreeUtils';

// serves as MVC controller for checkbox tree on results page
export default class CheckboxTreeController {

  constructor(element, name, tree, fieldName, selectedList, defaultSelectedList) {
    this.element = element;
    this.name = name;
    this.tree = tree;
    this.fieldName = fieldName;
    this.searchText = "";
    this.setSearchText = this.setSearchText.bind(this);
    this.resetSearchText = this.resetSearchText.bind(this);
    this.searchNodes = this.searchNodes.bind(this);
    this.displayCheckboxTree = this.displayCheckboxTree.bind(this);
    this.updateSelectedList = this.updateSelectedList.bind(this);
    this.updateExpandedList = this.updateExpandedList.bind(this);
    this.loadDefaultSelectedList = this.loadDefaultSelectedList.bind(this);
    this.loadCurrentSelectedList = this.loadCurrentSelectedList.bind(this);
    this.getBasicNodeReactElement = getBasicNodeReactElement.bind(this);
    this.getNodeFormValue = getNodeFormValue.bind(this);
    this.getNodeChildren = getNodeChildren.bind(this);
    this.selectedList = selectedList;
    this.expandedList = CheckboxTree.setExpandedList(this.tree, this.getNodeFormValue, this.getNodeChildren, this.selectedList);
    this.defaultSelectedList = defaultSelectedList;
    this.currentSelectedList = (selectedList || []).concat();
    this.searchableTextMap = this.createSearchableTextMap(this.tree);
  }

  displayCheckboxTree() {
    ReactDOM.render(
      <SearchableCheckboxTree tree={this.tree}
      //<CheckboxTree tree={this.tree}
                    selectedList={this.selectedList}
                    expandedList={this.expandedList}
                    name={this.name}
                    fieldName={this.fieldName}
                    onSearchTextSet={this.setSearchText}
                    onSearchTextReset={this.resetSearchText}
                    onSearch={this.searchNodes}
                    onSelectedListUpdated={this.updateSelectedList}
                    onExpandedListUpdated={this.updateExpandedList}
                    onDefaultSelectedListLoaded={this.loadDefaultSelectedList}
                    onCurrentSelectedListLoaded={this.loadCurrentSelectedList}
                    getBasicNodeReactElement={this.getBasicNodeReactElement}
                    getNodeFormValue={this.getNodeFormValue}
                    getNodeChildren={this.getNodeChildren}
      />, this.element[0]);
  }


  setSearchText(value) {
    this.searchText = value;
    this.displayCheckboxTree();
  }

  resetSearchText() {
    this.searchText = "";
    CheckboxTree.setExpandedList(this.tree, getNodeFormValue, getNodeChildren, this.selectedList);
    this.displayCheckboxTree();
  }

  searchNodes(node) {
    if(this.searchText.length > 0) {
      let nodeSearchText = this.searchableTextMap[getNodeFormValue(node)];
      return nodeSearchText == undefined || nodeSearchText == null ? false : nodeSearchText.indexOf(this.searchText.toLowerCase()) > -1;
    }
    else {
      return undefined;
    }
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



  createSearchableTextMap(nodes) {
    let searchableTextMap = {};
    let parentMap = this.computeParents(nodes);
    nodes.forEach(node => {
      let leaves = getLeaves(node, getNodeChildren);
      leaves.forEach(leaf => {
        let nodeList = [];
        nodeList.push(getNodeFormValue(leaf));
        let searchableText = [];
        searchableText.push(getDisplayName(leaf).toLowerCase());
        if(getDescription(leaf) != undefined) {
          searchableText.push(getDescription(leaf).toLowerCase());
        }
        this.getAncestors(leaf, parentMap).forEach(ancestor => {
          nodeList.push(getNodeFormValue(ancestor));
          searchableText.push(getDisplayName(ancestor).toLowerCase());
          if(getDescription(ancestor) != undefined) {
            searchableText.push(getDescription(ancestor).toLowerCase());
          }
        });
        nodeList.forEach(item => {
          searchableTextMap[item] = searchableTextMap[item] ? searchableTextMap[item] + " " + searchableText.join(" ") : searchableText.join(" ");
        });
      });
    });
    return searchableTextMap;
  }


  getAncestors(node, parentMap, ancestors = []) {
    if(parentMap[getNodeFormValue(node)] === undefined) {
      return ancestors;
    }
    let parent = parentMap[getNodeFormValue(node)];
    ancestors.push(parent);
    this.getAncestors(parent, parentMap, ancestors);
    return ancestors;
  }


  computeParents(nodes) {
    let parentMap = {};
    nodes.forEach(node => {
      parentMap[getNodeFormValue(node)] = undefined;
      this.addParents(node, parentMap);
    });
    return parentMap;
  }


  addParents(parentNode, parentMap) {
    if(!isLeafNode(parentNode, getNodeChildren)) {
      getNodeChildren(parentNode).forEach(childNode => {
        parentMap[getNodeFormValue(childNode)] = parentNode;
        this.addParents(childNode, parentMap);
      });
    }
  }


}