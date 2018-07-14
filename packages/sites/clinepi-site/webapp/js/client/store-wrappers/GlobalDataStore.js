import studiesReducer from 'Client/App/Studies/StudyReducer';
export default GlobalDataStore => class ClinEpiGlobalDataStore extends GlobalDataStore {
  handleAction(state = {}, action) {
    const studies = studiesReducer(state.studies, action);
    // Update state only if `studies` has changed to prevent false-positives
    // when attempting to detect if globalData has changed.
    if (state.studies !== studies) {
      state = { ...state, studies }
    }
    return super.handleAction(state, action);
  }
}
