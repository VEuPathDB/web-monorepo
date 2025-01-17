import { EMPTY, of, merge } from 'rxjs';
import { filter, map, mergeMap, mergeMapTo, tap } from 'rxjs/operators';
import * as RecordStoreModule from '@veupathdb/wdk-client/lib/StoreModules/RecordStoreModule';
import {
  QuestionActions,
  RecordActions,
} from '@veupathdb/wdk-client/lib/Actions';
import { uniq, flow, partialRight } from 'lodash';
import * as tree from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import * as cat from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';
import { PATHWAY_DYN_COLS_LOADED } from '../actioncreators/RecordViewActionCreators';
import { isGenomicsService } from '../wrapWdkService';

export const key = 'record';

export function reduce(state, action) {
  state = RecordStoreModule.reduce(state, action);
  if (state.questions == null) state = { ...state, questions: {} };
  // state = QuestionStoreModule.reduce(state, action);
  state = Object.assign({}, state, {
    pathwayRecord: handlePathwayRecordAction(state.pathwayRecord, action),
    dynamicColsOfIncomingStep: handleDynColsOfIncomingStepAction(
      state.dynamicColsOfIncomingStep,
      action
    ),
  });
  switch (action.type) {
    case RecordActions.RECORD_RECEIVED:
      return {
        ...pruneCategories(state),
        // collapse all sections by default. later we will read state from localStorage.
        collapsedSections: RecordStoreModule.getAllFields(state),
      };
    default:
      return state;
  }
}

export function observe(action$, state$, services) {
  return merge(
    RecordStoreModule.observe(action$, state$, services),
    observeSnpsAlignment(action$, state$, services),
    observeRequestedOrganisms(action$, state$, services)
  );
}

function handleDynColsOfIncomingStepAction(state = [], action) {
  switch (action.type) {
    case PATHWAY_DYN_COLS_LOADED:
      return action.payload;
    default:
      return state;
  }
}

let initialPathwayRecordState = {
  activeNodeData: null,
  generaSelection: [],
};

/** Handle pathway actions */
function handlePathwayRecordAction(state = initialPathwayRecordState, action) {
  switch (action.type) {
    case 'pathway-record/set-active-node':
      return Object.assign({}, state, {
        activeNodeData: action.payload.activeNodeData,
      });
    case 'pathway-record/set-pathway-error':
      return Object.assign({}, state, {
        error: action.payload.error,
      });
    case 'pathway-record/genera-selected':
      return Object.assign({}, state, {
        generaSelection: action.payload.generaSelection,
      });
    case 'pathway-record/set-filtered-nodeList':
      return Object.assign({}, state, {
        filteredNodeList: action.payload.filteredNodeList,
      });

    default:
      return state;
  }
}

/** prune categoryTree */
function pruneCategories(nextState) {
  let { record, categoryTree } = nextState;
  if (isGeneRecord(record)) {
    categoryTree = flow(
      partialRight(pruneCategoryBasedOnShowStrains, record),
      partialRight(pruneCategoryBasedOnHasAlphaFold, record),
      partialRight(pruneCategoriesByMetaTable, record),
      partialRight(removeProteinCategories, record)
    )(categoryTree);
    nextState = Object.assign({}, nextState, { categoryTree });
  }
  if (isDatasetRecord(record)) {
    categoryTree = pruneByDatasetCategory(categoryTree, record);
    nextState = Object.assign({}, nextState, { categoryTree });
  }
  return nextState;
}

/** Remove protein related categories from tree */
function removeProteinCategories(categoryTree, record) {
  if (
    record.attributes.gene_type !== 'protein coding' &&
    record.attributes.gene_type !== 'protein coding gene' &&
    record.attributes.gene_type !== 'transposable element gene'
  ) {
    let children = categoryTree.children.filter(function (category) {
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
  )
    return categoryTree;

  // Remove the table from the category tree
  return tree.pruneDescendantNodes((individual) => {
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

/** Remove alphafold_url based on value of hasAlphaFold attribute */
function pruneCategoryBasedOnHasAlphaFold(categoryTree, record) {
  // Fields to remove if hasAlphaFold is "0"
  const alphaFoldFields = new Set([
    'AlphaFoldLinkouts',
    'hasAlphaFold',
    'alphafold_url',
  ]);
  // Keep tree as-is if hasAlphaFold is "1"
  return record.attributes.hasAlphaFold === '1'
    ? categoryTree
    : // Remove alphaFoldFields from categoryTree
      tree.pruneDescendantNodes(
        (individual) => !alphaFoldFields.has(cat.getRefName(individual)),
        categoryTree
      );
}

/** Use MetaTable to determine if a leaf is appropriate for record instance */
function pruneCategoriesByMetaTable(categoryTree, record) {
  let metaTableIndex = record.tables.MetaTable.reduce((index, row) => {
    if (index[row.target_name + '-' + row.target_type] === undefined) {
      index[row.target_name + '-' + row.target_type] = { keep: false };
    }
    if (index[row.target_name + '-' + row.target_type].keep) return index;
    if (
      row.organisms == null ||
      row.organisms === record.attributes.organism_full
    ) {
      index[row.target_name + '-' + row.target_type].keep = true;
    }
    return index;
  }, {});
  // show tables in individual (ontology) that in metatable apply to this organim,
  //  and tables in individual that are not in metatable
  //  (so exclude tables in metatable that do not apply to this organim)
  return tree.pruneDescendantNodes((individual) => {
    if (individual.children.length > 0) return true;
    if (individual.wdkReference == null) return false;
    let key = cat.getRefName(individual) + '-' + cat.getTargetType(individual);
    if (metaTableIndex[key] === undefined) return true;
    return metaTableIndex[key].keep;
  }, categoryTree);
}

function pruneByDatasetCategory(categoryTree, record) {
  // Remove Dataset Version and Source Version from genome datasets, otherwise remove genome tables from non-genome datasets
  // Additionally, choose either the genome dataset history (GenomeHistory) or non-genome dataset history table (DatasetHistory).
  if (record.attributes.newcategory === 'Genomes') {
    categoryTree = tree.pruneDescendantNodes((individual) => {
      if (individual.children.length > 0) return true;
      if (individual.wdkReference == null) return false;
      if (individual.wdkReference.name === 'version') return false;
      if (individual.wdkReference.name === 'Version') return false;
      if (individual.wdkReference.name === 'DatasetHistory') return false;
      return true;
    }, categoryTree);
  } else {
    categoryTree = tree.pruneDescendantNodes((individual) => {
      if (individual.children.length > 0) return true;
      if (individual.wdkReference == null) return false;
      if (individual.wdkReference.name === 'TranscriptTypeCounts') return false;
      if (individual.wdkReference.name === 'GeneTypeCounts') return false;
      if (individual.wdkReference.name === 'SequenceTypeCounts') return false;
      if (individual.wdkReference.name === 'GenomeAssociatedData') return false;
      if (individual.wdkReference.name === 'ExternalDatabases') return false;
      if (individual.wdkReference.name === 'GenomeHistory') return false;
      if (individual.wdkReference.name === 'genecount') return false;
      if (individual.wdkReference.name === 'Busco') return false;
      return true;
    }, categoryTree);
  }

  // Example graphs should only be shown on RNASeq, Microarray, Phenotype datasets
  if (
    !['RNASeq', 'DNA Microarray', 'Phenotype'].includes(
      record.attributes.newcategory
    )
  ) {
    categoryTree = tree.pruneDescendantNodes((individual) => {
      if (individual.children.length > 0) return true;
      if (individual.wdkReference == null) return false;
      if (individual.wdkReference.name === 'ExampleGraphs') return false;
      return true;
    }, categoryTree);
  }
  return categoryTree;
}

// Custom observers
// ----------------
//
// An observer allows us to perform side-effects in response to actions that are
// dispatched to the store.

/**
 * Load filterParam data for snp alignment form.
 */
function observeSnpsAlignment(action$) {
  return action$.pipe(
    filter((action) => action.type === RecordActions.RECORD_UPDATE),
    mergeMap((action) =>
      isGeneRecord(action.payload.record) &&
      'SNPsAlignment' in action.payload.record.tables
        ? of(action.payload.record.attributes.organism_full)
        : isSnpsRecord(action.payload.record)
        ? of(action.payload.record.attributes.organism_text)
        : EMPTY
    ),
    map((organismSinglePick) => {
      return QuestionActions.updateActiveQuestion({
        searchName: 'SnpAlignmentForm',
        initialParamData: {
          organismSinglePick,
          ngsSnp_strain_meta: JSON.stringify({ filters: [] }),
        },
      });
    })
  );
}

/**
 * Whenever a gene or genomic sequence record is loaded, increment
 * the count of the associated organism.
 */
function observeRequestedOrganisms(action$, state$, { wdkService }) {
  return action$.pipe(
    filter((action) => action.type === RecordActions.RECORD_RECEIVED),
    tap(({ payload: { recordClass, record } }) => {
      if (!isGenomicsService(wdkService)) {
        throw new Error(
          'Tried to report organism metrics via a misconfigured GenomicsService'
        );
      }

      const recordOrganisms = getRecordOrganisms({
        recordClass,
        record,
      });

      recordOrganisms?.forEach((recordOrganism) => {
        wdkService.incrementOrganismCount(recordOrganism);
      });
    }),
    mergeMapTo(EMPTY)
  );
}

// TODO Declare type and clear value if it doesn't conform, e.g., validation

/** Returns an array of organism names associated to the record */
function getRecordOrganisms({
  recordClass: { urlSegment: recordClassUrlSegment },
  record,
}) {
  if (
    recordClassUrlSegment === 'gene' ||
    recordClassUrlSegment === 'genomic-sequence' ||
    recordClassUrlSegment === 'snp'
  ) {
    const organismAttributeName =
      recordClassUrlSegment === 'snp' ? 'organism_text' : 'organism_full';

    const organismAttribute = record.attributes?.[organismAttributeName];

    return typeof organismAttribute !== 'string' ? [] : [organismAttribute];
  } else if (recordClassUrlSegment === 'dataset') {
    const versionTable = record.tables?.Version ?? [];

    const organisms = versionTable.flatMap(({ organism }) =>
      typeof organism !== 'string' || organism === 'ALL' ? [] : [organism]
    );

    return uniq(organisms);
  } else {
    return undefined;
  }
}

function isGeneRecord(record) {
  return record.recordClassName === 'GeneRecordClasses.GeneRecordClass';
}

function isSnpsRecord(record) {
  return record.recordClassName === 'SnpRecordClasses.SnpRecordClass';
}

function isDatasetRecord(record) {
  return record.recordClassName === 'DatasetRecordClasses.DatasetRecordClass';
}
