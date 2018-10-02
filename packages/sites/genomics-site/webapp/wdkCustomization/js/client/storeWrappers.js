import { getLeaves } from 'wdk-client/TreeUtils';

export const GlobalDataStore = GlobalDataStore => class ApiGlobalDataStore extends GlobalDataStore {
  handleAction(state, action) {
    state = super.handleAction(state, action);
    switch(action.type) {
      case 'static/all-data-loaded': return {
        ...state,
        searchTree: {
          ...state.searchTree,
          children: state.searchTree.children.map(node =>
            node.properties.label[0] === 'TranscriptRecordClasses.TranscriptRecordClass'
              ? node
              : { ...node, children: getLeaves(node, node => node.children) })
        }
      };
      default: return state;
    }
  }
}
