import { useMemo } from 'react';
import { StudyEntity } from '../types/study';
import { entityToGeoConfig } from '../utils/geoVariables';
import { leafletZoomLevelToGeohashLevel } from '../utils/visualization';
import { GeoConfig } from '../types/geoConfig';

/**
 * GeoConfig is a list that corresponds to (only) entities that have geo-variables
 *
 * Temporary implementation that looks for a specific combination of variables underneath a single variable tree node.
 * Assumes that aggregationVariables are in ID order (e.g. geohash_1 has the lowest ID and geohash_6 the highest)
 *
 */

export function useGeoConfig(entities: StudyEntity[]): GeoConfig[] {
  return useMemo(
    () =>
      entities
        .map((entity) =>
          entityToGeoConfig(entity, leafletZoomLevelToGeohashLevel)
        )
        .filter((item): item is GeoConfig => item != null),
    [entities]
  );
}
