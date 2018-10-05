import studiesReducer from 'Client/App/Studies/StudyReducer';
import restrictionReduder from 'Client/App/DataRestriction/DataRestrictionReducer';
import { newsReducer } from 'Client/App/NewsSidebar/NewsModule';

export default GlobalDataStore => class ClinEpiGlobalDataStore extends GlobalDataStore {
  handleAction(state = {}, action) {
    state = super.handleAction(state, action);
    state = mergeSubReducer(studiesReducer, 'studies', state, action);
    state = mergeSubReducer(restrictionReduder, 'dataRestriction', state, action);
    state = mergeSubReducer(newsReducer, 'news', state, action);
    return state;
  }
}

// Update state only if `state[key]` has changed to prevent false-positives
// when attempting to detect if globalData has changed.
function mergeSubReducer(reducer, key, state, action) {
  const subState = state[key];
  const nextSubState = reducer(subState, action);
  return subState !== nextSubState ? { ...state, [key]: nextSubState } : state;
}
