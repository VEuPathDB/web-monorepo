import ReactDOM from 'react-dom';
import CheckboxTree from 'wdk-client-components/CheckboxTree';
import { getNodeChildren } from 'wdk-client-utils/OntologyUtils';
import { getNodeId, nodeSearchPredicate, BasicNodeComponent } from 'wdk-client-utils/CategoryUtils';

// serves as MVC controller for checkbox tree on results page
export default class CheckboxTreeController {

  constructor(element, name, tree, selectedList, defaultSelectedList) {

    // set static properties of this object
    this.element = element;
    this.name = name;
    this.tree = tree;
    this.defaultSelectedList = defaultSelectedList;
    this.currentSelectedList = (selectedList ? selectedList.concat() : []);

    // set dynamic properties that change over the life of this object
    this.searchText = "";
    this.selectedList = selectedList;
    this.expandedList = null; // let the checkbox tree decide for now

    // bind functions that reference 'this' to this object
    this.setSearchText = this.setSearchText.bind(this);
    this.displayCheckboxTree = this.displayCheckboxTree.bind(this);
    this.updateSelectedList = this.updateSelectedList.bind(this);
    this.updateExpandedList = this.updateExpandedList.bind(this);
    this.loadDefaultSelectedList = this.loadDefaultSelectedList.bind(this);
    this.loadCurrentSelectedList = this.loadCurrentSelectedList.bind(this);
  }

  displayCheckboxTree() {
    let treeProps = {
      tree: this.tree,
      getNodeId: getNodeId,
      getNodeChildren: getNodeChildren,
      onExpansionChange: this.updateExpandedList,
      showRoot: false,
      nodeComponent: BasicNodeComponent,
      expandedList: this.expandedList,
      isSelectable: true,
      selectedList: this.selectedList,
      name: this.name,
      onSelectionChange: this.updateSelectedList,
      currentList: this.currentSelectedList,
      defaultList: this.defaultSelectedList,
      isSearchable: true,
      showSearchBox: true,
      searchBoxPlaceholder: "Search Columns...",
      searchBoxHelp: "Each column's name and description will be searched for your exact input text",
      searchText: this.searchText,
      onSearchTextChange: this.setSearchText,
      searchPredicate: nodeSearchPredicate
    };
    ReactDOM.render(<CheckboxTree {...treeProps}/>, this.element[0]);
  }

  setSearchText(value) {
    this.searchText = value;
    this.displayCheckboxTree();
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

  /**
   * Resets state to original inputs
   */
  resetState() {
    this.searchText = "";
    this.selectedList = this.currentSelectedList.concat();
    this.expandedList = null;
    this.displayCheckboxTree();
  }
}
