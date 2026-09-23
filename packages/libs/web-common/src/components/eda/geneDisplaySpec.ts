import { StudyEntity } from '@veupathdb/eda/lib/core';

export interface GeneDisplaySpec {
  ids: string[];
  variableId: string;
  entityId: string;
  traceName?: string;
  mode: 'highlight' | 'subset';
}

/**
 * The spec with its `entityId` replaced by the entity that declares its
 * variable.
 *
 * The plot configs name the gene id variable but not its entity, so the caller
 * fills `entityId` with the x-axis entity as a guess. That guess is only right
 * when both axes are from the same entity. When they are from different
 * entities (a gene measurement against a sample-level covariate, say), the gene
 * id variable may be on the other one, and filtering on the wrong entity
 * silently matches nothing.
 *
 * So we look the variable up by id in the study metadata instead. EDA does not
 * require variable ids to be unique across entities, so this lookup is only
 * sound when exactly one entity declares the variable. If several do, we cannot
 * tell which one was meant and throw rather than pick one arbitrarily. If none
 * do, the caller's guess is returned unchanged.
 */
export function resolveGeneDisplaySpec(
  geneDisplaySpec: GeneDisplaySpec | undefined,
  entities: StudyEntity[]
): GeneDisplaySpec | undefined {
  if (geneDisplaySpec == null) return undefined;
  const declaringEntities = entities.filter((entity) =>
    entity.variables.some(
      (variable) => variable.id === geneDisplaySpec.variableId
    )
  );
  if (declaringEntities.length > 1) {
    throw new Error(
      `Gene id variable "${geneDisplaySpec.variableId}" is declared on ` +
        `more than one entity (${declaringEntities
          .map((entity) => entity.id)
          .join(', ')}); cannot tell which one to filter on.`
    );
  }
  const [declaringEntity] = declaringEntities;
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
