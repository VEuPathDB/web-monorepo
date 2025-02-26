import { GeoConfig } from '../types/geoConfig';
import { StudyEntity } from '../types/study';
import { findLast } from 'lodash';

/**
 * Given an entity note in the study tree, check to see if it has the following variables
 *
 * longitude (exactly one)
 * latitude (exactly one)
 * geoaggregator (multiple)
 *
 * If they exist, return a GeoConfig, else return undefined.
 */
export function entityToGeoConfig(
  entity: StudyEntity,
  zoomLevelToAggregationLevel: (leafletZoomLevel: number) => number
): GeoConfig | undefined {
  // first find the longitude variable
  const longitudeVariables = entity.variables.filter(
    (variable) => variable.displayType === 'longitude'
  );
  if (longitudeVariables.length === 1) {
    const longitudeVariable = longitudeVariables[0];
    const latitudeVariables = entity.variables.filter(
      (variable) => variable.displayType === 'latitude'
    );
    if (latitudeVariables.length === 1) {
      const latitudeVariable = latitudeVariables[0];
      const geoAggregatorVariables = entity.variables
        .filter((variable) => variable.displayType === 'geoaggregator')
        .sort((a, b) =>
          a.displayOrder != null && b.displayOrder != null
            ? a.displayOrder - b.displayOrder
            : 0
        );
      if (geoAggregatorVariables.length > 0) {
        return {
          entity,
          zoomLevelToAggregationLevel,
          latitudeVariableId: latitudeVariable.id,
          longitudeVariableId: longitudeVariable.id,
          aggregationVariableIds: geoAggregatorVariables.map(({ id }) => id),
        };
      }
    }
  }
  return undefined;
}

/**
 * Given the geoConfigs (one per entity with geo variables) and an entity ID,
 * return the geoConfig/entity that is furthest from the root that is the parent of the provided entity ID.
 *
 * Assumes `geoConfigs` is in root to leaf order.
 */
export function findLeastAncestralGeoConfig(
  geoConfigs: GeoConfig[],
  entityId: string
): GeoConfig {
  return (
    findLast(geoConfigs, ({ entity }) =>
      entityHasChildEntityWithId(entity, entityId)
    ) ?? geoConfigs[0]
  );
}

// Check if the specified entity or any of its descendants has the given entityId.
function entityHasChildEntityWithId(
  entity: StudyEntity,
  entityId: string
): boolean {
  return (
    entity.id === entityId ||
    (entity.children?.some((child) =>
      entityHasChildEntityWithId(child, entityId)
    ) ??
      false)
  );
}

// simple convenience function
// defaults to root-most geoConfig for safety.
export function getGeoConfig(
  geoConfigs: GeoConfig[],
  entityId?: string
): GeoConfig {
  return (
    geoConfigs.find(({ entity: { id } }) => id === entityId) ?? geoConfigs[0]
  );
}
