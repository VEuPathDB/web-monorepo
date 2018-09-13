import { getLeaves } from 'wdk-client/TreeUtils';

export function reduce(state, action) {
  switch(action.type) {
    // flatten search tree
    case 'static/all-data-loaded': return {
      ...state,
      searchTree: {
        ...state.searchTree,
        children: state.searchTree.children.map(node =>
          node.properties.label[0] === 'TranscriptRecordClasses.TranscriptRecordClass'
            ? node
            : { ...node, children: getLeaves(node, node => node.children) })
      }
    }
    default: return state;
  }
}