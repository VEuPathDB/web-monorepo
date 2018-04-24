import studiesReducer from 'Client/App/Studies/StudyReducer';
export default GlobalDataStore => class ClinEpiGlobalDataStore extends GlobalDataStore {
  handleAction(state = {}, action) {
    return {
      ...super.handleAction(state, action),
      studies: studiesReducer(state.studies, action)
    }
  }
}