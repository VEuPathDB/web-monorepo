import { GeoConfig } from '../types/geoConfig';
import { StudyEntity } from '../types/study';
import { sortBy } from 'lodash';

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
    (variable) => variable.type === 'longitude'
  );
  if (longitudeVariables.length === 1) {
    const longitudeVariable = longitudeVariables[0];
    const siblingVariables = entity.variables.filter(
      (variable) => variable.parentId === longitudeVariable.parentId
    );
    const numberSiblings = siblingVariables.filter(
      (variable) => variable.type === 'number'
    );
    if (numberSiblings.length === 1) {
      const stringCategoricals = siblingVariables.filter(
        (variable) =>
          variable.type === 'string' &&
          (variable.dataShape === 'categorical' ||
            variable.dataShape === 'binary')
      );

      if (stringCategoricals.length === 6) {
        return {
          entity,
          zoomLevelToAggregationLevel,
          latitudeVariableId: numberSiblings[0].id,
          longitudeVariableId: longitudeVariable.id,
          aggregationVariableIds: stringCategoricals.map(({ id }) => id),
        };
      } else {
        return undefined;
      }
    }
  }
  return undefined;
}
