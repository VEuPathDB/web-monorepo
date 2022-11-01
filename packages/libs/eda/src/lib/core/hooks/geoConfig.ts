import { useMemo } from 'react';
import { StudyEntity } from '../types/study';
import { entityToGeoConfig } from '../utils/geoVariables';
import { leafletZoomLevelToGeohashLevel } from '../utils/visualization';
import { GeoConfig } from '../types/geoConfig';

/**
 * GeoConfig is a list that corresponds to (only) entities that have geo-variables
 *
 * Here we inspect the study metadata to see which entities have the required variables
 * (latitude, longitude and geoaggregators)
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
