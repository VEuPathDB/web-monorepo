import React, { Component } from 'react';
import { bindAll } from 'lodash';
import { PageController } from '@veupathdb/wdk-client/lib/Controllers';
import CheckboxTree, {
  LinksPosition,
} from '@veupathdb/coreui/lib/components/inputs/checkboxes/CheckboxTree/CheckboxTree';
import {
  areTermsInString,
  makeSearchHelpText,
} from '@veupathdb/wdk-client/lib/Utils/SearchUtils';

interface TreeNode {
  id: string;
  display: string;
  children?: TreeNode[];
}

interface TreeDataViewerState {
  text: string;
  expandedNodes: string[];
  searchTerm: string;
}

class TreeDataViewer extends Component<{}, TreeDataViewerState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      text: '',
      expandedNodes: [],
      searchTerm: '',
    };
    bindAll(this, ['onTextChange', 'onExpansionChange', 'onSearchTermChange']);
  }

  // event handlers update individual state values
  onTextChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    update(this, { text: event.target.value });
  }

  onExpansionChange(expandedNodes: string[]) {
    update(this, { expandedNodes: expandedNodes });
  }

  onSearchTermChange(searchTerm: string) {
    update(this, { searchTerm: searchTerm });
  }

  render() {
    let display: React.ReactNode = '';
    if (this.state.text !== '') {
      try {
        const parsedTree: TreeNode = JSON.parse(this.state.text);
        display = (
          <CheckboxTree
            tree={parsedTree}
            getNodeId={(node: TreeNode) => node.id}
            getNodeChildren={(node: TreeNode) =>
              node.children ? node.children : []
            }
            onExpansionChange={this.onExpansionChange}
            showRoot={true}
            renderNode={(node: TreeNode) => <span>{node.display}</span>}
            expandedList={this.state.expandedNodes}
            isSelectable={false}
            selectedList={[]}
            isSearchable={true}
            searchBoxPlaceholder="Search..."
            searchBoxHelp={makeSearchHelpText('the structure below')}
            searchTerm={this.state.searchTerm}
            onSearchTermChange={this.onSearchTermChange}
            searchPredicate={isNodeInSearch}
            linksPosition={LinksPosition.Top}
          />
        );
      } catch (e) {
        display = <span>{(e as Error).message}</span>;
      }
    }
    return (
      <div>
        <h3>Tree Data Viewer</h3>
        <p>
          Enter a tree of data in JSON format, where a Node is{' '}
          {'{ id:String, display:String, children:Array[Node] }'}.
        </p>
        <p>
          <textarea value={this.state.text} onChange={this.onTextChange} />
        </p>
        <div>{display}</div>
      </div>
    );
  }
}

function isNodeInSearch(node: TreeNode, terms: string): boolean {
  return areTermsInString(terms, `${node.id} ${node.display}`);
}

function update<S>(stateContainer: Component<{}, S>, changedState: Partial<S>) {
  stateContainer.setState(Object.assign(stateContainer.state, changedState));
}

export default class TreeDataViewerController extends PageController {
  getTitle() {
    return 'Tree Data Viewer';
  }
  renderView() {
    return <TreeDataViewer {...this.props} />;
  }
}
