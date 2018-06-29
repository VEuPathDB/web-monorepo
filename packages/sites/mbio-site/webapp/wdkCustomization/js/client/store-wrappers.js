import { getLeaves } from 'wdk-client/TreeUtils';

export const GlobalDataStore = GlobalDataStore => class MbioGlobalDataStore extends GlobalDataStore {

  handleAction(state, action) {
    state = super.handleAction(state, action);
    switch(action.type) {

      // flatten search tree
      case 'static/all-data-loaded': return {
        ...state,
        searchTree: {
          children: getLeaves(state.searchTree, node => node.children)
        }
      }

      default: return state;
    }
  }

}
