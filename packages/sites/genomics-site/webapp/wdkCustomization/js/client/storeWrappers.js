import { flow, get } from 'lodash';
import { TreeUtils as tree, CategoryUtils as cat } from 'wdk-client';
import * as persistence from './util/persistence';
import { TABLE_STATE_UPDATED } from './actioncreators/RecordViewActionCreators';
import { SECURITY_AGREEMENT_STATUS_CHANGED } from './actioncreators/GalaxyTermsActionCreators';

let storageItems = {
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

/** Provide GalaxyTermsStore */
export function GalaxyTermsStore(WdkStore) {
  return class ApiGalaxyTermsStore extends WdkStore {
    handleAction(state, { type, payload }) {
      switch(type) {
        case SECURITY_AGREEMENT_STATUS_CHANGED: return Object.assign({}, state, {
          securityAgreementStatus: payload.status
        });
        default: return state;
      }
    }
  };
}

/** Provide QueryGridViewStore */
export function QueryGridViewStore(WdkStore) {
  return class ApiQueryGridViewStore extends WdkStore { };
}

/** Provide FastConfigStore */
export function FastaConfigStore(WdkStore) {
  return class ApiFastaConfigStore extends WdkStore { };
}

/** Return a subclass of the provided RecordViewStore */
export function RecordViewStore(WdkRecordViewStore) {
  return class ApiRecordViewStore extends WdkRecordViewStore {
    reduce(state, action) {
      state = Object.assign({}, super.reduce(state, action), {
        pathwayRecord: handlePathwayRecordAction(state.pathwayRecord, action),
        eupathdb: handleEuPathDBAction(state.eupathdb, action)
      });
      switch (action.type) {
        case 'record-view/active-record-received':
          return handleRecordReceived(state);
        case 'record-view/section-visibility-changed':
        case 'record-view/all-fields-visibility-changed':
          setStateInStorage(storageItems.collapsedSections, state);
          return state;
        case 'record-view/navigation-visibility-changed':
          setStateInStorage(storageItems.navigationVisible, state);
          return state;
        case TABLE_STATE_UPDATED:
          setStateInStorage(storageItems.tables, state);
          return state;
        default:
          return state;
      }
    }
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
    default:
      return state;
  }
}

/** Handle eupathdb actions */
function handleEuPathDBAction(state = { tables: {} }, { type, payload }) {
  switch(type) {
    case TABLE_STATE_UPDATED: return Object.assign({}, state, {
      tables: Object.assign({}, state.tables, {
        [payload.tableName]: payload.tableState
      })
    });
    default: return state;
  }
}

let handleRecordReceived = flow(updateNavigationVisibility, mergeCollapsedSections, mergeTableState,  pruneCategories);

/** Show navigation for genes, but hide for all other record types */
function updateNavigationVisibility(state) {
  let navigationVisible = getStateFromStorage(storageItems.navigationVisible, state, state.recordClass.name === 'GeneRecordClasses.GeneRecordClass');
  return Object.assign(state, {}, { navigationVisible });
}

/** merge stored collapsedSections */
function mergeCollapsedSections(state) {
  return Object.assign({}, state, {
    collapsedSections: getStateFromStorage(storageItems.collapsedSections, state)
  });
}

/** merge stored table state */
function mergeTableState(state) {
  let eupathdb = Object.assign({}, state.eupathdb, {
    tables: getStateFromStorage(storageItems.tables, state)
  });
  return Object.assign({}, state, { eupathdb });
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


// TODO Declare type and clear value if it doesn't conform

/** Read state property value from storage */
function getStateFromStorage(descriptor, state, defaultValue = get(state, descriptor.path)) {
  try {
    let key = getStorageKey(descriptor, state);
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
    let key = getStorageKey(descriptor, state);
    persistence.set(key, get(state, descriptor.path));
  }
  catch (error) {
    console.error('Warning: Could not set %s to local storage.', descriptor.path, error);
  }
}

/** Create storage key for property */
function getStorageKey(descriptor, state) {
  let { path, isRecordScoped } = descriptor;
  return path + '/' + state.recordClass.name +
    (isRecordScoped ? '/' + state.record.id.map(p => p.value).join('/') : '');
}
