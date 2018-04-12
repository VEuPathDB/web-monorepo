import { Observable } from 'rxjs';
import { RecordViewStore, QuestionStore } from 'wdk-client/Stores';
import { QuestionActionCreators } from 'wdk-client/ActionCreators';
import { get } from 'lodash';
import { TreeUtils as tree, CategoryUtils as cat } from 'wdk-client';
import * as persistence from '../util/persistence';
import { TABLE_STATE_UPDATED, PATHWAY_DYN_COLS_LOADED } from '../actioncreators/RecordViewActionCreators';

const storageItems = {
  tables: {
    path: 'eupathdb.tables',
    isRecordScoped: true
  },
  collapsedSections: {
    path: 'collapsedSections',
    isRecordScoped: false
  },
  navigationVisible: {
    path: 'navigationVisible',
    isRecordScoped: false
  }
};

/** Api specific RecordViewStore */
export default class ApiRecordViewStore extends RecordViewStore {

  getInitialState() {
    return Object.assign({}, super.getInitialState(), {
      questions: {}
    });
  }

  handleAction(state, action) {
    state = super.handleAction(state, action);
    state = QuestionStore.prototype.handleAction(state, action);
    state = Object.assign({}, state, {
      pathwayRecord: handlePathwayRecordAction(state.pathwayRecord, action),
      eupathdb: handleEuPathDBAction(state.eupathdb, action),
      dynamicColsOfIncomingStep: handleDynColsOfIncomingStepAction(state.dynamicColsOfIncomingStep, action)
    });
    switch (action.type) {
      case 'record-view/active-record-received':
        return pruneCategories(state);
      default:
        return state;
    }
  }

  getEpics() {
    return [
      ...super.getEpics(),
      ...QuestionStore.prototype.getEpics(),
      snpsAlignmentEpic,
      userSettingsEpic
    ];
  }
}

function handleDynColsOfIncomingStepAction(state = [], action) {
  switch(action.type) {
    case PATHWAY_DYN_COLS_LOADED:
      return action.payload;
    default:
      return state;
  }
}

let initialPathwayRecordState = {
  activeNodeData: null,
  generaSelection: []
};

/** Handle pathway actions */
function handlePathwayRecordAction(state = initialPathwayRecordState, action) {

  switch(action.type) {
    case 'pathway-record/set-active-node':
      return Object.assign({}, state, {
        activeNodeData: action.payload.activeNodeData
      });
    case 'pathway-record/set-pathway-error':
      return Object.assign({}, state, {
        error: action.payload.error
      });
    case 'pathway-record/genera-selected':
      return Object.assign({}, state, {
        generaSelection: action.payload.generaSelection
      });
    case 'pathway-record/set-filtered-nodeList':
      return Object.assign({}, state, {
        filteredNodeList: action.payload.filteredNodeList
      });



    default:
      return state;
  }
}

/** Handle eupathdb actions */
function handleEuPathDBAction(state = { tables: {} }, { type, payload }) {
  switch(type) {
    case TABLE_STATE_UPDATED:
      return Object.assign({}, state, {
        tables: Object.assign({}, state.tables, {
          [payload.tableName]: payload.tableState
        })
      });

    default:
      return state;
  }
}

/** prune categoryTree */
function pruneCategories(nextState) {
  let { record, categoryTree } = nextState;
  if (isGeneRecord(record)) {
    categoryTree = pruneCategoryBasedOnShowStrains(pruneCategoriesByMetaTable(removeProteinCategories(categoryTree, record), record), record);
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


/** Remove Strains based on value of show_strains attribute */
function pruneCategoryBasedOnShowStrains(categoryTree, record) {
 // Keep tree as-is if record is not protein coding, or if show_strains is true
 if (
     //  record.attributes.gene_type !== 'protein coding' ||
   record.attributes.show_strains === 'Yes'
 ) return categoryTree;

 // Remove the table from the category tree
 return tree.pruneDescendantNodes(individual => {
   // keep everything that isn't the table we care about
 return (
       cat.getTargetType(individual) !== 'table' ||
       cat.getRefName(individual) !== 'Strains'
     );

 //if (cat.getTargetType(individual) !== 'table') return true;
 //if (cat.getRefName(individual) !== 'Strains') return true;
 //  return false;
 }, categoryTree);
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


// Custom epics
// ------------
//
// An epic allows us to perform side-effects in resonse to actions that are
// dispatched to the store.

/**
 * When record is loaded, read state from storage and emit actions to restore state.
 * When state is changed, write state to storage.
 */
function userSettingsEpic(action$, { store }) {
  return action$
    .filter(action => action.type === 'record-view/active-record-received')
    .switchMap(() => {
      let state = store.getState();
      /** Show navigation for genes, but hide for all other record types */
      let navigationVisible = getStateFromStorage(
        storageItems.navigationVisible,
        state,
        isGeneRecord(state.record)
      );

      /** merge stored collapsedSections */
      let collapsedSections = getStateFromStorage(
        storageItems.collapsedSections,
        state,
        []
      );

      let tableStates = getStateFromStorage(
        storageItems.tables,
        state,
        {}
      );

      return Observable.of(
        {
          type: 'record-view/navigation-visibility-changed',
          payload: { isVisible: navigationVisible }
        },
        ...collapsedSections.map(name => ({
          type: 'record-view/section-visibility-changed',
          payload: { name, isVisible: false }
        })),
        ...Object.entries(tableStates).map(([tableName, tableState]) => ({
          type: TABLE_STATE_UPDATED,
          payload: { tableName, tableState }
        }))
      )
      .merge(action$.mergeMap(action => {
        switch (action.type) {
          case 'record-view/section-visibility-changed':
          case 'record-view/all-field-visibility-changed':
            setStateInStorage(storageItems.collapsedSections, store.getState());
            break;
          case 'record-view/navigation-visibility-changed':
            setStateInStorage(storageItems.navigationVisible, store.getState());
            break;
          case TABLE_STATE_UPDATED:
            setStateInStorage(storageItems.tables, store.getState());
            break;
        }
        return Observable.empty();
      }))
    })
}

/**
 * Load filterParam data for snp alignment form.
 */
function snpsAlignmentEpic(action$) {
  return action$
    .filter(action => action.type === 'record-view/active-record-updated')
    .mergeMap(action =>
      (isGeneRecord(action.payload.record) &&
        'SNPsAlignment' in action.payload.record.tables)
        ? Observable.of(action.payload.record.attributes.organism_full)
        : isSnpsRecord(action.payload.record) ? Observable.of(action.payload.record.attributes.organism_text)
          : Observable.empty())
    .map(organismSinglePick => {
      return QuestionActionCreators.ActiveQuestionUpdatedAction.create({
        questionName: 'SnpAlignmentForm',
        paramValues: {
          organismSinglePick,
          ngsSnp_strain_meta: JSON.stringify({ filters: [] })
        }
      });
    });
}



// TODO Declare type and clear value if it doesn't conform, e.g., validation

/** Read state property value from storage */
function getStateFromStorage(descriptor, state, defaultValue) {
  try {
    let key = getStorageKey(descriptor, state.record);
    return persistence.get(key, defaultValue);
  }
  catch (error) {
    console.error('Warning: Could not retrieve %s from local storage.', descriptor.path, error);
    return defaultValue;
  }
}

/** Write state property value to storage */
function setStateInStorage(descriptor, state) {
  try {
    let key = getStorageKey(descriptor, state.record);
    persistence.set(key, get(state, descriptor.path));
  }
  catch (error) {
    console.error('Warning: Could not set %s to local storage.', descriptor.path, error);
  }
}

/** Create storage key for property */
function getStorageKey(descriptor, record) {
  let { path, isRecordScoped } = descriptor;
  return path + '/' + record.recordClassName +
    (isRecordScoped ? '/' + record.id.map(p => p.value).join('/') : '');
}

function isGeneRecord(record) {
  return record.recordClassName === 'GeneRecordClasses.GeneRecordClass';
}

function isSnpsRecord(record) {
  return record.recordClassName === 'SnpRecordClasses.SnpRecordClass';
}
