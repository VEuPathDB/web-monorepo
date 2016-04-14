import lodash from 'lodash';
import { TreeUtils as tree, CategoryUtils as cat } from 'wdk-client';
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
        case actionTypes.ACTIVE_RECORD_RECEIVED: {
          return handleRecordReceived(nextState);
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

let handleRecordReceived = lodash.flow(mergeCollapsedSections, pruneCategories);

/** merge stored collapsedSections */
function mergeCollapsedSections(state) {
  return Object.assign({}, state, {
    collapsedSections: getCollapsedSections(state)
  });
}

/** prune categoryTree */
function pruneCategories(nextState) {
  let { record, categoryTree } = nextState;
  if (record.recordClassName === 'GeneRecordClasses.GeneRecordClass') {
    categoryTree = pruneCategoriesByMetaTable(removeProteinCategories(categoryTree, record), record);
    nextState = Object.assign({}, nextState, { categoryTree });
  }
  return nextState;
}

/** Remove protein related categories from tree */
function removeProteinCategories(categoryTree, record) {
  if (record.attributes.gene_type !== 'protein coding') {
    let children = categoryTree.children.filter(function(category) {
      let label = category.properties.label[0];
      return label !== 'Protein properties' && label !== 'Proteomics';
    });
    categoryTree = Object.assign({}, categoryTree, { children });
  }
  return categoryTree;
}

/** Use MetaTable to determine if a leaf is appropriate for record instance */
function pruneCategoriesByMetaTable(categoryTree, record) {
  let metaTableIndex = record.tables.MetaTable.reduce((index, row) => {
    index[row.target_name + '-' + row.target_type] = row;
    return index;
  }, {});
  return tree.pruneDescendantNodes(
    individual => {
      if (individual.children.length > 0) return true;
      if (individual.wdkReference == null) return false;
      let key = cat.getRefName(individual) + '-' + cat.getTargetType(individual);
      let metaTableRow = metaTableIndex[key];
      if (metaTableRow == null) return true;
      if (metaTableRow.organisms == null) return true;
      let organisms = metaTableRow.organisms.split(/,\s*/);
      let keep =  organisms.indexOf(record.attributes.organism_full) > -1;
      if (!keep) console.info('Removing individual based on MetaTable: %o', cat.getLabel(individual));
      return keep;
    },
    categoryTree
  )
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
