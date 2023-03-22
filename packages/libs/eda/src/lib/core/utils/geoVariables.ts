import { GeoConfig } from '../types/geoConfig';
import { StudyEntity } from '../types/study';

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
