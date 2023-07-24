import { allDataLoaded } from '@veupathdb/wdk-client/lib/Actions/StaticDataActions';
import { getLeaves } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

export function reduce(state, action) {
  switch (action.type) {
    // flatten search tree
    case allDataLoaded.type:
      return {
        ...state,
        searchTree: {
          ...state.searchTree,
          children: state.searchTree.children.map((node) =>
            node.properties.label[0] ===
            'TranscriptRecordClasses.TranscriptRecordClass'
              ? node
              : { ...node, children: getLeaves(node, (node) => node.children) }
          ),
        },
      };
    default:
      return state;
  }
}

// FIXME Update basket count in header when wdk basket actions are moved to epic middleware
// export function observe(action$, state$, services) {
// }
