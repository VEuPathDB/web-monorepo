import lodash from 'lodash';
import { TreeUtils as tree, CategoryUtils as cat, StaticDataUtils } from 'wdk-client';
import { WdkStore } from 'wdk-client/Stores';
import { selectReporterComponent } from './util/reporterSelector';
import * as persistence from './util/persistence';

let { StaticDataProps } = StaticDataUtils;

/** Return subcass of the provided StepDownloadFormViewStore */
export function DownloadFormStore(WdkDownloadFormStore) {
  return class ApiDownloadFormStore extends WdkDownloadFormStore {
    getSelectedReporter(selectedReporterName, recordClassName) {
      return selectReporterComponent(selectedReporterName, recordClassName);
    }
  }
}

export function GalaxyTermsStore() {
  return class ApiGalaxyTermsStore extends WdkStore {
    getRequiredStaticDataProps() {
      return [ StaticDataProps.PREFERENCES ];
    }
    getInitialState() {
      return { preferences: null };
    }
  };
}

/** Return a subclass of the provided RecordViewStore */
export function RecordViewStore(WdkRecordViewStore) {
  let { actionTypes } = WdkRecordViewStore;
  return class ApiRecordViewStore extends WdkRecordViewStore {

    getRequiredStaticDataProps() {
      return super.getRequiredStaticDataProps().concat(StaticDataProps.CONFIG,
          StaticDataProps.QUESTIONS, StaticDataProps.RECORDCLASSES);
    }

    reduce(state, action) {
      state = Object.assign({}, super.reduce(state, action), {
        pathwayRecord: handlePathwayRecordAction(state.pathwayRecord, action)
      });
      switch (action.type) {
        case actionTypes.ACTIVE_RECORD_RECEIVED:
          return handleRecordReceived(state);
        case actionTypes.SECTION_VISIBILITY_CHANGED:
        case actionTypes.ALL_FIELD_VISIBILITY_CHANGED:
          setStateInStorage('collapsedSections', state);
          return state;
        case actionTypes.NAVIGATION_VISIBILITY_CHANGED:
          setStateInStorage('navigationVisible', state);
          return state;
        default:
          return state;
      }
    }
  }
}

let initialPathwayRecordState = {
  activeNode: null,
  activeCompound: null,
  compoundError: null
};

function handlePathwayRecordAction(state = initialPathwayRecordState, action) {
  switch(action.type) {
    case 'pathway-record/set-active-node':
      return Object.assign({}, initialPathwayRecordState, {
        activeNode: action.payload.activeNode
      });
    case 'pathway-record/set-pathway-error':
      return Object.assign({}, initialPathwayRecordState, {
        error: action.payload.error
      });
    case 'pathway-record/compound-loading':
      return Object.assign({}, state, {
        activeCompound: null,
        compoundError: null
      });
    case 'pathway-record/compound-loaded':
      return Object.assign({}, state, {
        activeCompound: action.payload.compound,
        compoundError: null
      });
    case 'pathway-record/compound-error':
      return Object.assign({}, state, {
        activeCompound: null,
        compoundError: action.payload.error
      });
    default:
      return state;
  }
}

let handleRecordReceived = lodash.flow(updateNavigationVisibility, mergeCollapsedSections, pruneCategories);

/** Show navigation for genes, but hide for all other record types */
function updateNavigationVisibility(state) {
  let navigationVisible = getStateFromStorage('navigationVisible', state, state.recordClass.name === 'GeneRecordClasses.GeneRecordClass');
  return Object.assign(state, {}, { navigationVisible });
}

/** merge stored collapsedSections */
function mergeCollapsedSections(state) {
  return Object.assign({}, state, {
    collapsedSections: getStateFromStorage('collapsedSections', state)
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

// TODO Declare type and clear value if it doesn't conform

function getStateFromStorage(property, state, defaultValue = state[property]) {
  try {
    return persistence.get(property + '/' + state.recordClass.name, defaultValue);
  }
  catch (error) {
    console.error('Warning: Could not retrieve % from local storage.', property, error);
    return defaultValue;
  }
}

function setStateInStorage(property, state) {
  try {
    persistence.set(property + '/' + state.recordClass.name, state[property]);
  }
  catch (error) {
    console.error('Warning: Could not set %s to local storage.', property, error);
  }
}
