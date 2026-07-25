import { ancestorEntitiesForEntityId } from './data-element-constraints';
import { StudyEntity, StringVariable } from '../types/study';

function makeStringVariable(id: string, isFeatured = false): StringVariable {
  return {
    id,
    providerLabel: id,
    displayName: id,
    hideFrom: [],
    type: 'string',
    dataShape: 'categorical',
    distinctValuesCount: 5,
    isTemporal: false,
    isFeatured,
    isMergeKey: false,
    isMultiValued: false,
  };
}

function makeEntity(id: string, variables: StringVariable[]): StudyEntity {
  return {
    id,
    idColumnName: id + '_id',
    displayName: id,
    description: '',
    variables,
    isManyToOneWithParent: false,
  };
}

describe('ancestorEntitiesForEntityId - PCA overlay entity scoping', () => {
  // Mirrors the real WGCNA/PCA notebook study tree: "Sample" is the root
  // entity, with the four RNASeq/WGCNA entities as its *children* (not
  // ancestors). A PCA plot's output entity is Sample, so overlay/facet
  // variables should only be allowed from Sample itself (no ancestors exist
  // here, since Sample is the root) -- never from these descendant entities.
  const hsaprefEigengene = makeEntity('hsapref_eigengene', [
    makeStringVariable('Module_1'),
  ]);
  const hsaprefHtseq = makeEntity('hsapref_htseq', [
    makeStringVariable('VEUPATHDB_GENE_ID'),
  ]);
  const pfal3d7Eigengene = makeEntity('pfal3d7_eigengene', [
    makeStringVariable('Module_1'),
  ]);
  const pfal3d7Htseq = makeEntity('pfal3d7_htseq', [
    makeStringVariable('VEUPATHDB_GENE_ID'),
  ]);
  const sample: StudyEntity = {
    ...makeEntity('sample', [makeStringVariable('Sex')]),
    children: [hsaprefEigengene, hsaprefHtseq, pfal3d7Eigengene, pfal3d7Htseq],
  };
  const treeEntities = [
    sample,
    hsaprefEigengene,
    hsaprefHtseq,
    pfal3d7Eigengene,
    pfal3d7Htseq,
  ];

  it('resolves only the root entity itself when it is the output entity', () => {
    const result = ancestorEntitiesForEntityId('sample', treeEntities);
    expect(result.map((e) => e.id)).toEqual(['sample']);
  });

  it('resolves an entity and its ancestor(s) when given a child entity', () => {
    const result = ancestorEntitiesForEntityId(
      'pfal3d7_eigengene',
      treeEntities
    );
    expect(result.map((e) => e.id)).toEqual(['sample', 'pfal3d7_eigengene']);
  });
});
