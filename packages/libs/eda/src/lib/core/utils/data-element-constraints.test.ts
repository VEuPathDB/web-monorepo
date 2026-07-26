import { jointCandidateEntities } from './data-element-constraints';
import { StudyEntity, StringVariable } from '../types/study';
import { VariableDescriptor } from '../types/variable';
import { ancestorEntitiesForEntityId } from './data-element-constraints';

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

// Mirrors the real-world bug: two sibling entities (two independent RNASeq
// datasets under the same "Sample" parent), each with their own gene
// identifier variable and their own measurement variable.
const hsapref = makeEntity('hsapref_htseq', [
  makeStringVariable('VEUPATHDB_GENE_ID'),
  makeStringVariable('SEQUENCE_READ_COUNT_SENSE', true),
]);
const pfal3d7 = makeEntity('pfal3d7_htseq', [
  makeStringVariable('VEUPATHDB_GENE_ID'),
  makeStringVariable('SEQUENCE_READ_COUNT_SENSE', true),
]);
const entities = [hsapref, pfal3d7];

describe('jointCandidateEntities', () => {
  it('returns both sibling entities when neither input has been narrowed yet', () => {
    const disabledVariablesByInputName: Record<string, VariableDescriptor[]> = {
      identifierVariable: [],
      valueVariable: [],
    };

    const result = jointCandidateEntities(
      ['identifierVariable', 'valueVariable'],
      entities,
      disabledVariablesByInputName
    );

    expect(result).toEqual(new Set(['hsapref_htseq', 'pfal3d7_htseq']));
  });

  it('returns a single entity once one input has been narrowed to it', () => {
    // Simulates identifierVariable already being locked to pfal3d7 (e.g. by
    // the user), which disables hsapref's variables via the dependency-order
    // same-branch rule.
    const disabledVariablesByInputName: Record<string, VariableDescriptor[]> = {
      identifierVariable: [
        { entityId: 'hsapref_htseq', variableId: 'VEUPATHDB_GENE_ID' },
        {
          entityId: 'hsapref_htseq',
          variableId: 'SEQUENCE_READ_COUNT_SENSE',
        },
      ],
      valueVariable: [
        { entityId: 'hsapref_htseq', variableId: 'VEUPATHDB_GENE_ID' },
        {
          entityId: 'hsapref_htseq',
          variableId: 'SEQUENCE_READ_COUNT_SENSE',
        },
      ],
    };

    const result = jointCandidateEntities(
      ['identifierVariable', 'valueVariable'],
      entities,
      disabledVariablesByInputName
    );

    expect(result).toEqual(new Set(['pfal3d7_htseq']));
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
