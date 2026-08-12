import { StudyEntity } from '@veupathdb/eda/lib/core';

export interface GeneDisplaySpec {
  ids: string[];
  variableId: string;
  entityId: string;
  traceName?: string;
  mode: 'highlight' | 'subset';
}

/**
 * The spec's entity, corrected to the entity that actually declares its
 * variable.
 *
 * The caller derives `entityId` from the plot's x-axis, which is only the right
 * entity when both axes share one. A plot whose axes span two entities (a gene
 * measurement against a sample-level covariate, say) carries the gene id
 * variable on just one of them, and filtering on the other silently matches
 * nothing. The study metadata already knows where the variable lives, so ask it
 * rather than trusting the axis. Falls back to the given entity when the
 * variable cannot be found.
 */
export function resolveGeneDisplaySpec(
  geneDisplaySpec: GeneDisplaySpec | undefined,
  entities: StudyEntity[]
): GeneDisplaySpec | undefined {
  if (geneDisplaySpec == null) return undefined;
  const declaringEntity = entities.find((entity) =>
    entity.variables.some(
      (variable) => variable.id === geneDisplaySpec.variableId
    )
  );
  return declaringEntity == null ||
    declaringEntity.id === geneDisplaySpec.entityId
    ? geneDisplaySpec
    : { ...geneDisplaySpec, entityId: declaringEntity.id };
}

/**
 * Filters restricting the data to the spec's genes, regardless of display mode.
 * Use this for plots that cannot express highlighting within the plot itself.
 */
export function geneSubsetFilters(geneDisplaySpec?: GeneDisplaySpec) {
  if (geneDisplaySpec != null && geneDisplaySpec.ids.length > 0) {
    return [
      {
        type: 'stringSet' as const,
        entityId: geneDisplaySpec.entityId,
        variableId: geneDisplaySpec.variableId,
        stringSet: geneDisplaySpec.ids,
      },
    ];
  }
  return [];
}

export function filtersFromGeneDisplaySpec(geneDisplaySpec?: GeneDisplaySpec) {
  if (geneDisplaySpec?.mode === 'subset') {
    return geneSubsetFilters(geneDisplaySpec);
  }
  return [];
}
