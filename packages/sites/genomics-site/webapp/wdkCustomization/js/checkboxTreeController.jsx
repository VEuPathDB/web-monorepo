import ReactDOM from 'react-dom';
import { CheckboxTree } from 'wdk-client/Components';
import { getNodeChildren } from 'wdk-client/OntologyUtils';
import { getNodeId, nodeSearchPredicate, BasicNodeComponent } from 'wdk-client/CategoryUtils';

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
    this.state = this.getOriginalState();

    // bind functions to this object will be called as stand-alone functions
    this.setSearchText = this.setSearchText.bind(this);
    this.updateSelectedList = this.updateSelectedList.bind(this);
    this.updateExpandedList = this.updateExpandedList.bind(this);
  }

  // returns a deep copy of original state so original state stays independent
  getOriginalState() {
    return {
      searchText: "",
      selectedList: this.currentSelectedList.concat(),
      // let the checkbox tree calculate
      expandedList: null
    };
  }
  
  renderTree() {
    let treeProps = {
      tree: this.tree,
      getNodeId: getNodeId,
      getNodeChildren: getNodeChildren,
      onExpansionChange: this.updateExpandedList,
      showRoot: false,
      nodeComponent: BasicNodeComponent,
      expandedList: this.state.expandedList,
      isSelectable: true,
      selectedList: this.state.selectedList,
      name: this.name,
      onSelectionChange: this.updateSelectedList,
      currentList: this.currentSelectedList,
      defaultList: this.defaultSelectedList,
      isSearchable: true,
      showSearchBox: true,
      searchBoxPlaceholder: "Search Columns...",
      searchBoxHelp: "Each column name will be searched. The column names will contain all your terms. Your terms are partially matched; for example, the term typ will match typically, type, atypical.",
      searchTerm: this.state.searchText,
      onSearchTermChange: this.setSearchText,
      searchPredicate: nodeSearchPredicate
    };
    ReactDOM.render(<CheckboxTree {...treeProps}/>, this.element[0]);
  }

  setSearchText(value) {
    this.state.searchText = value;
    this.renderTree();
  }

  /**
   * Callback to update the selected node list nd re-render the tree
   * @param selectedList - array of the values of the selected nodes
   */
  updateSelectedList(selectedList) {
    this.state.selectedList = selectedList;
    this.renderTree();
  }

  /**
   * Callback to update the expanded node list and re-render the tree
   * @param expandedList - array of the values of the expanded nodes
   */
  updateExpandedList(expandedList) {
    this.state.expandedList = expandedList;
    this.renderTree();
  }

  /**
   * Resets state to original inputs
   */
  unmountTree() {
    ReactDOM.unmountComponentAtNode(this.element[0]);
    this.state = this.getOriginalState();
  }
}
