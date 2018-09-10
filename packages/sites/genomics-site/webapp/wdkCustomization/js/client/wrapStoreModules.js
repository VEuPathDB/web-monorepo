import { compose, curryN, update } from 'lodash/fp';
import { getLeaves } from 'wdk-client/TreeUtils';

/**
 * Compose reducer functions from right to left. In other words, the
 * last reducer provided is called first, the second to last is called
 * second, and so on.
 */
const composeReducers = (...reducers) => (state, action) =>
  reducers.reduceRight((state, reducer) => reducer(state, action), state);

/**
 * Curried with fixed size of two arguments.
 */
const composeReducerWith = curryN(2, composeReducers);

export default compose(
  update('globalData.reduce', composeReducerWith(reduceGlobalData))
)


function reduceGlobalData(state, action) {
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
