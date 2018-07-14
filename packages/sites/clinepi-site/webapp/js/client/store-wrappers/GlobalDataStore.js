import studiesReducer from 'Client/App/Studies/StudyReducer';
export default GlobalDataStore => class ClinEpiGlobalDataStore extends GlobalDataStore {
  handleAction(state = {}, action) {
    state = super.handleAction(state, action);

    // Update state only if `studies` has changed to prevent false-positives
    // when attempting to detect if globalData has changed.
    const studies = studiesReducer(state.studies, action);
    return state.studies !== studies
      ? { ...state, studies }
      : state;
  }
}
