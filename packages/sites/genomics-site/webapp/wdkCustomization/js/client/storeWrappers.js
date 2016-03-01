import { Stores } from 'wdk-client';
import { selectReporterComponent } from './util/reporterSelector';

export let StepDownloadFormViewStore = {

  reduce(origReduce) {
    return function(state, action) {
      let nextState = origReduce.call(this, state, action);

      // if new reporter was just selected, update form state to initial state of that form
      if (action.type == Stores.StepDownloadFormViewStore.actionTypes.STEP_DOWNLOAD_SELECT_REPORTER) {
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

export let RecordViewStore = {

  reduce(origReduce) {
    return function(state, action) {
      let nextState = origReduce.call(this, state, action);

      switch (action.type) {
        case 'record/set-active-record': {
          // Hide Protein properties and Proteomics categories for non- protein coding genes
          let { record, recordClass, categoryTree } = nextState;
          if (recordClass.name === 'GeneRecordClasses.GeneRecordClass' && record.attributes.gene_type !== 'protein coding') {
            categoryTree.children = categoryTree.children.filter(function(category) {
              let label = category.properties.label[0];
              return label !== 'Protein properties' && label !== 'Proteomics';
            });
          }
          return nextState;
        }

        default:
          return nextState;
      }
    }
  }

}
