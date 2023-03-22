import React, { Component } from 'react';
import { bindAll } from 'lodash';
import { PageController } from '@veupathdb/wdk-client/lib/Controllers';
import CheckboxTree, { LinksPosition } from '@veupathdb/coreui/dist/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import { areTermsInString, makeSearchHelpText } from '@veupathdb/wdk-client/lib/Utils/SearchUtils';

class TreeDataViewer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      text: "",
      expandedNodes: [],
      searchTerm: ""
    };
    bindAll(this, [ 'onTextChange', 'onExpansionChange', 'onSearchTermChange' ]);
  }

  // event handlers update individual state values
  onTextChange(event)              { update(this, { text: event.target.value }); }
  onExpansionChange(expandedNodes) { update(this, { expandedNodes: expandedNodes}); }
  onSearchTermChange(searchTerm)   { update(this, { searchTerm: searchTerm }); }

  render() {
    let display = "";
    if (this.state.text != "") {
      try {
        let parsedTree = JSON.parse(this.state.text);
        display = <CheckboxTree
          tree={parsedTree}
          getNodeId={node => node.id}
          getNodeChildren={node => node.children ? node.children : []}
          onExpansionChange={this.onExpansionChange}
          showRoot={true}
          renderNode={node => <span>{node.display}</span>}
          expandedList={this.state.expandedNodes}
          isSelectable={false}
          selectedList={[]}
          isSearchable={true}
          searchBoxPlaceholder="Search..."
          searchBoxHelp={makeSearchHelpText("the structure below")}
          searchTerm={this.state.searchTerm}
          onSearchTermChange={this.onSearchTermChange}
          searchPredicate={isNodeInSearch}
          linksPosition={LinksPosition.Top}
          />
      }
      catch (e) {
        display = <span>{e.message}</span>;
      }
    }
    return (
      <div>
        <h3>Tree Data Viewer</h3>
        <p>
          Enter a tree of data in JSON format, where a Node is {"{ id:String, display:String, children:Array[Node] }"}.
        </p>
        <p>
          <textarea value={this.state.text} onChange={this.onTextChange}/>
        </p>
        <div>
          {display}
        </div>
      </div>
    );
  }
}

function isNodeInSearch(node, terms) {
  return areTermsInString(terms, `${node.id} ${node.display}`);
}

function update(stateContainer, changedState) {
  stateContainer.setState(Object.assign(stateContainer.state, changedState));
}

export default class TreeDataViewerController extends PageController {
  getTitle() { return "Tree Data Viewer"; }
  renderView() { return <TreeDataViewer {...this.props}/> }
}
