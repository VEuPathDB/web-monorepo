import { GeoConfig } from '../../../core/types/geoConfig';
import { StudyEntity, Variable } from '../../../core/types/study';
import { VariableDescriptor } from '../../../core/types/variable';
import { findLeastAncestralGeoConfig } from '../../../core/utils/geoVariables';
import {
  makeHiddenVariablesInScope,
  shouldHideVariable,
} from '../../../core/utils/wdk-filter-param-adapter';

/**
 * Multi-geo-entity support.
 *
 * A study may have several entities with geo-variables (e.g. households and
 * collection sites). The map places its markers by exactly one of them, the
 * "location entity". Data from other entities can only be shown on those
 * markers if it is related through the entity tree, i.e. it belongs to an
 * ancestor of the location entity, the location entity itself, or one of
 * its descendants (its "lineage").
 */

/** path from the root entity to `entityId` (inclusive), or undefined */
export function entityPath(
  root: StudyEntity,
  entityId: string
): StudyEntity[] | undefined {
  if (root.id === entityId) return [root];
  for (const child of root.children ?? []) {
    const path = entityPath(child, entityId);
    if (path) return [root, ...path];
  }
  return undefined;
}

function descendants(entity: StudyEntity): StudyEntity[] {
  return (entity.children ?? []).flatMap((child) => [
    child,
    ...descendants(child),
  ]);
}

/**
 * Entities whose data can be shown on markers placed by `geoEntityId`,
 * ordered root-to-leaf: ancestors, the entity itself, then descendants.
 */
export function lineageEntities(
  root: StudyEntity,
  geoEntityId: string
): StudyEntity[] {
  const path = entityPath(root, geoEntityId);
  if (path == null) return [];
  return [...path, ...descendants(path[path.length - 1])];
}

/**
 * Variables that cannot be used with markers placed by `geoEntityId`,
 * suitable for InputVariables' `additionalDisabledVariables`.
 */
export function variablesOutsideLineage(
  entities: StudyEntity[],
  lineageIds: ReadonlySet<string>
): VariableDescriptor[] {
  return entities
    .filter((entity) => !lineageIds.has(entity.id))
    .flatMap((entity) =>
      entity.variables
        .filter((variable) => variable.type !== 'category')
        .map((variable) => ({ entityId: entity.id, variableId: variable.id }))
    );
}

/**
 * The location entity for a map, in order of preference:
 * the one saved in the analysis, the one saved by the previous map UI on the
 * active marker configuration, or the least ancestral geo-entity on the path
 * to the active marker variable.
 */
export function resolveGeoConfig(
  geoConfigs: GeoConfig[],
  options: {
    geoEntityId?: string;
    legacyGeoEntityId?: string;
    markerVariable?: VariableDescriptor;
  }
): GeoConfig {
  const byId = (id?: string) =>
    id == null
      ? undefined
      : geoConfigs.find((config) => config.entity.id === id);
  return (
    byId(options.geoEntityId) ??
    byId(options.legacyGeoEntityId) ??
    (options.markerVariable
      ? findLeastAncestralGeoConfig(geoConfigs, options.markerVariable.entityId)
      : geoConfigs[0])
  );
}

/** the finest geohash variable, which selections and geo filters target */
export function finestGeohashVariableId(geoConfig: GeoConfig) {
  return geoConfig.aggregationVariableIds[
    geoConfig.aggregationVariableIds.length - 1
  ];
}

/** Columns used when listing records: featured variables first. */
export const MAX_FALLBACK_COLUMNS = 5;

/**
 * The variables shown for an entity's records: its featured variables (the
 * `isFeatured` annotation), or — when an entity has none — its first few
 * displayable variables, so the table is never empty. Geo-variables of the
 * location entity are always available separately and are left out.
 */
export function recordColumns(entity: StudyEntity): {
  variables: Variable[];
  usingFeatured: boolean;
} {
  const hidden = makeHiddenVariablesInScope(entity, 'download');
  const displayable = entity.variables.filter(
    (variable): variable is Variable =>
      variable.type !== 'category' &&
      !shouldHideVariable(hidden, variable) &&
      variable.displayType !== 'geoaggregator' &&
      variable.displayType !== 'latitude' &&
      variable.displayType !== 'longitude'
  );
  const featured = displayable.filter((variable) => variable.isFeatured);
  return featured.length > 0
    ? { variables: featured, usingFeatured: true }
    : {
        variables: displayable.slice(0, MAX_FALLBACK_COLUMNS),
        usingFeatured: false,
      };
}
