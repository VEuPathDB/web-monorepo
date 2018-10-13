import { compose, curryN, update } from 'lodash/fp';
import { getLeaves } from 'wdk-client/TreeUtils';

/** Compose reducer functions from right to left */
const composeReducers = (...reducers) => (state, action) =>
  reducers.reduceRight((state, reducer) => reducer(state, action), state);

const composeReducerWith = curryN(2, composeReducers);

export default compose(
  update('globalData.reduce', composeReducerWith(mbioGlobalData))
)


function mbioGlobalData(state, action) {
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