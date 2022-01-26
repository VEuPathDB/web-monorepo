import { useMemo } from 'react';
import { StudyEntity } from '../types/study';
import { findGeolocationNode } from '../utils/geoVariables';
import { leafletZoomLevelToGeohashLevel } from '../utils/visualization';
import { sortBy } from 'lodash';

/**
 * GeoConfig is a list that corresponds to (only) entities that have geo-variables
 *
 * Temporary implementation that looks for a specific combination of variables underneath a single variable tree node.
 * Assumes that aggregationVariables are in ID order (e.g. geohash_1 has the lowest ID and geohash_6 the highest)
 *
 */

type GeoConfig = {
  entity: StudyEntity;
  zoomLevelToAggregationLevel: (zoomLevel: number) => number;
  latitudeVariableId: string;
  longitudeVariableId: string;
  aggregationVariableIds: string[];
};

export function useGeoConfig(entities: StudyEntity[]): GeoConfig[] {
  return useMemo(
    () =>
      entities
        .map((entity) => {
          const geolocationNode = findGeolocationNode(entity);
          if (geolocationNode != null) {
            const directChildren = entity.variables.filter(
              (variable) => variable.parentId === geolocationNode.id
            );
            return {
              entity,
              zoomLevelToAggregationLevel: leafletZoomLevelToGeohashLevel, // default leaflet to geohash mapping
              latitudeVariableId: directChildren.find(
                (variable) => variable.type === 'number'
              )?.id,
              longitudeVariableId: directChildren.find(
                (variable) => variable.type === 'longitude'
              )?.id,
              aggregationVariableIds: sortBy(
                directChildren
                  .filter(
                    (variable) =>
                      variable.type === 'string' &&
                      variable.dataShape === 'continuous'
                  )
                  .map((variable) => variable.id)
              ),
            };
          } else {
            return undefined;
          }
        })
        .filter((item): item is GeoConfig => item != null),
    [entities]
  );
}
