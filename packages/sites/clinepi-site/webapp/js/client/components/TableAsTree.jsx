import React from 'react';
import { CategoriesCheckboxTree } from '@veupathdb/wdk-client/lib/Components';
import * as Category from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';                                                                                                                                                                                                                              

function makeTree (rows) {
  const n = Category.createNode; // helper for below
  let myTree = n('root', 'root', null, []);

  for (let i = 0; i < rows.length; i++) {
    let is_leaf = rows[i].is_leaf;
    if (is_leaf == 1) {
      setKeep(rows[i], rows);
    }
  }

  addChildren(myTree, rows, n);

  return myTree;
}

function setKeep (node, rows) {
  node.keep = 1;
  let parent = node.parent_source_id;

  for(let i = 0; i < rows.length; i++){
    let id = rows[i].unique_id;

    if(parent == id) {
      setKeep(rows[i], rows);
      break;
    }
  }
};

function addChildren (t, rows, n) {
  for (let i = 0; i < rows.length; i++) {
    let parent = rows[i].parent_source_id;
    let id = rows[i].unique_id;
    let display = rows[i].display_name;
    let keep = rows[i].keep;

    if (parent == Category.getId(t) && keep == 1) {
      let node = n(id, display, null, []);
      t.children.push(node);
    }
  }

  for (let j = 0; j < t.children.length; j++) {
    addChildren(t.children[j], rows, n);
  }
};

class TableAsTree extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      selectedLeaves: [],
      expandedBranches: []
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleUiChange = this.handleUiChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSearchTermChange = this.handleSearchTermChange.bind(this);
  }

  handleChange (selectedLeaves) {
    this.setState({selectedLeaves});
  }

  handleUiChange (expandedBranches) {
    this.setState({expandedBranches});
  }

  handleSubmit () {
    this.props.onChange(this.props.isMultiPick ? this.state.selectedLeaves : this.state.selectedLeaves[0]);
  }

  handleSearchTermChange (searchTerm) {
    this.setState({searchTerm});
  }

  render () {
    return (
        <div className="TableAsTree">
          <CategoriesCheckboxTree
            name="Characteristics"
            searchBoxPlaceholder={`Search for Characteristics here`}
            autoFocusSearchBox={false}
            tree={makeTree(this.props.value)}
            leafType="string"
            isMultiPick={true}
            searchTerm={this.state.searchTerm}
            onChange={this.handleChange}
            onUiChange={this.handleUiChange}
            selectedLeaves={this.state.selectedLeaves}
            expandedBranches={this.state.expandedBranches}
            onSearchTermChange={this.handleSearchTermChange}
            isSelectable={false}
          />
        </div>
    );
  }
};

export default TableAsTree;
