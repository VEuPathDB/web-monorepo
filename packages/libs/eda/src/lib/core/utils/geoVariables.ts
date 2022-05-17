import { GeoConfig } from '../types/geoConfig';
import { StudyEntity } from '../types/study';

/**
 * Given a study, search its variable tree to find a node that has the following direct children
 *
 * a longitude variable
 * a number variable
 * six string categorical variables
 * and nothing more!
 *
 * returns the VariableTreNode or null
 *
 * This is a placeholder implementation, until more direct variable annotations (displayType) are available for b57
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
