import { selectReporterComponent } from './util/reporterSelector';
import * as persistence from './util/persistence';

/** Return subcass of the provided StepDownloadFormViewStore */
export function StepDownloadFormViewStore(WdkStepDownloadFormViewStore) {
  let { STEP_DOWNLOAD_SELECT_REPORTER } = WdkStepDownloadFormViewStore.actionTypes;
  return class ApiStoreDownloadFormViewStore extends WdkStepDownloadFormViewStore {
    reduce(state, action) {
      let nextState = super.reduce(state, action);
      // if new reporter was just selected, update form state to initial state of that form
      if (action.type == STEP_DOWNLOAD_SELECT_REPORTER) {
        let Reporter = selectReporterComponent(nextState.selectedReporter, nextState.recordClass.name);
        let userStoreState = this._storeContainer.UserStore.getState();
        let { formState, formUiState } = Reporter.getInitialState(nextState, userStoreState);
        nextState.formState = formState;
        nextState.formUiState = formUiState;
      }
      return nextState;
    }
  }
}

/** Return a subclass of the provided RecordViewStore */
export function RecordViewStore(WdkRecordViewStore) {
  let { actionTypes } = WdkRecordViewStore;
  return class ApiRecordViewStore extends WdkRecordViewStore {
    reduce(state, action) {
      let nextState = super.reduce(state, action);
      switch (action.type) {
        case actionTypes.SET_ACTIVE_RECORD: {
          let { record, recordClass } = nextState;
          if (recordClass.name === 'GeneRecordClasses.GeneRecordClass' &&
              record.attributes.gene_type !== 'protein coding') {
            nextState.categoryTree = removeProteinCategories(nextState.categoryTree);
          }
          nextState.collapsedSections = getCollapsedSections(nextState);
          return nextState;
        }
        case actionTypes.SHOW_SECTION:
        case actionTypes.HIDE_SECTION:
          setCollapsedSections(nextState);
          return nextState;
        default:
          return nextState;
      }
    }
  }
}

/** Remove protein related categories from tree */
function removeProteinCategories(categoryTree) {
  return Object.assign({}, categoryTree, {
    children: categoryTree.children.filter(function(category) {
      let label = category.properties.label[0];
      return label !== 'Protein properties' && label !== 'Proteomics';
    })
  });
}

/** Get collapsed categories from localStorage */
function getCollapsedSections(state) {
  try {
    return persistence.get(
      'collapsedSections/' + state.recordClass.name, state.collapsedSections);
  }
  catch (error) {
    console.error('Warning: Could not retrieve collapsed section from local storage.', error);
    return state.collapsedSections;
  }
}

/** Set collapsed categories to localStorage */
function setCollapsedSections(state) {
  try {
    persistence.set('collapsedSections/' + state.recordClass.name,
      state.collapsedSections || []);
  }
  catch (error) {
    console.error('Warning: Could not set collapsed section to local storage.', error);
  }
}
