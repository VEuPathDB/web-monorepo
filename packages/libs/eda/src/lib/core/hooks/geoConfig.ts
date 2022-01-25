import { useMemo } from 'react';
import { StudyEntity } from '../types/study';

import { leafletZoomLevelToGeohashLevel } from '../utils/visualization';

type GeoConfig = {};

export function useGeoConfig(entities: StudyEntity[]): GeoConfig {
  return useMemo(() => entities.filter(() => true).map(() => ({})), [entities]);
}
