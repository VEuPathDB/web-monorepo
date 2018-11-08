import { empty, of, merge } from 'rxjs';
import { filter, map, mergeMap, switchMap } from 'rxjs/operators';
import { record as RecordStoreModule } from 'wdk-client/StoreModules';
import { QuestionActions, RecordActions } from 'wdk-client/Actions';
import { get } from 'lodash';
import { TreeUtils as tree, CategoryUtils as cat } from 'wdk-client';
import * as persistence from '../util/persistence';
import { TABLE_STATE_UPDATED, PATHWAY_DYN_COLS_LOADED } from '../actioncreators/RecordViewActionCreators';

export const key = 'record';

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

export function reduce(state, action) {
  state = RecordStoreModule.reduce(state, action);
  if (state.questions == null) state = { ...state, questions: {} };
  // state = QuestionStoreModule.reduce(state, action);
  state = Object.assign({}, state, {
    pathwayRecord: handlePathwayRecordAction(state.pathwayRecord, action),
    eupathdb: handleEuPathDBAction(state.eupathdb, action),
    dynamicColsOfIncomingStep: handleDynColsOfIncomingStepAction(state.dynamicColsOfIncomingStep, action)
  });
  switch (action.type) {
    case RecordActions.RECORD_RECEIVED:
      return pruneCategories(state);
    default:
      return state;
  }
}

export function observe(action$, state$, services) {
  return merge(
    // RecordStoreModule.observe(action$, state$, services),
    // QuestionStoreModule.observe(action$, state$, services),
    observeSnpsAlignment(action$, state$, services),
    observeUserSettings(action$, state$, services),
  )
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
    if (index[row.target_name + '-' + row.target_type] === undefined) {
      index[row.target_name + '-' + row.target_type] = {keep: false}; 
      }
    if (index[row.target_name + '-' + row.target_type].keep) return index;
    if (row.organisms == null || row.organisms === record.attributes.organism_full) {
       index[row.target_name + '-' + row.target_type].keep = true
       }
    return index;
  }, {});
  // show tables in individual (ontology) that in metatable apply to this organim, 
  //  and tables in individual that are not in metatable 
  //  (so exclude tables in metatable that do not apply to this organim)
  return tree.pruneDescendantNodes(
    individual => {
      if (individual.children.length > 0) return true;
      if (individual.wdkReference == null) return false;
      let key = cat.getRefName(individual) + '-' + cat.getTargetType(individual);
      if (metaTableIndex[key] === undefined) return true;
      return metaTableIndex[key].keep;
    },
    categoryTree
  )
}


// Custom observers
// ----------------
//
// An observer allows us to perform side-effects in response to actions that are
// dispatched to the store.

/**
 * When record is loaded, read state from storage and emit actions to restore state.
 * When state is changed, write state to storage.
 */
function observeUserSettings(action$, state$) {
  return action$.pipe(
    filter(action => action.type === RecordActions.RECORD_RECEIVED),
    switchMap(() => {
      let state = state$.value[key];
      
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

      return merge(
        of(
          {
            type: RecordActions.NAVIGATION_VISIBILITY,
            payload: { isVisible: navigationVisible }
          },
          ...collapsedSections.map(name => ({
            type: RecordActions.SECTION_VISIBILITY,
            payload: { name, isVisible: false }
          })),
          ...Object.entries(tableStates).map(([tableName, tableState]) => ({
            type: TABLE_STATE_UPDATED,
            payload: { tableName, tableState }
          }))
        ),
        action$.pipe(
          mergeMap(action => {
            switch (action.type) {
              case RecordActions.SECTION_VISIBILITY:
              case RecordActions.ALL_FIELD_VISIBILITY:
                setStateInStorage(storageItems.collapsedSections, state$.value[key]);
                break;
              case RecordActions.NAVIGATION_VISIBILITY:
                setStateInStorage(storageItems.navigationVisible, state$.value[key]);
                break;
              case TABLE_STATE_UPDATED:
                setStateInStorage(storageItems.tables, state$.value[key]);
                break;
            }
            return empty();
          })
        )
      )
    })
  );
}

/**
 * Load filterParam data for snp alignment form.
 */
function observeSnpsAlignment(action$) {
  return action$.pipe(
    filter(action => action.type === RecordActions.RECORD_UPDATE),
    mergeMap(action =>
      (isGeneRecord(action.payload.record) &&
        'SNPsAlignment' in action.payload.record.tables)
        ? of(action.payload.record.attributes.organism_full)
        : isSnpsRecord(action.payload.record) ? of(action.payload.record.attributes.organism_text)
          : empty()),
    map(organismSinglePick => {
      return QuestionActions.updateActiveQuestion({
        questionName: 'SnpAlignmentForm',
        paramValues: {
          organismSinglePick,
          ngsSnp_strain_meta: JSON.stringify({ filters: [] })
        }
      });
    })
  );
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
