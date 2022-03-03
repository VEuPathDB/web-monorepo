import { StudyEntity } from '../types/study';

export type GeoConfig = {
  entity: StudyEntity;
  zoomLevelToAggregationLevel: (zoomLevel: number) => number;
  latitudeVariableId: string;
  longitudeVariableId: string;
  aggregationVariableIds: string[];
};
