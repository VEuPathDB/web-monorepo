import { createJsonRequest, FetchClient } from '@veupathdb/web-common/lib/util/api';
import { array, number, record, string, type, TypeOf } from 'io-ts';
import { Filter } from '../types/filter';
import { StudyMetadata } from "../types/study";
import { ioTransformer } from './ioTransformer';

export type StudyResponse = TypeOf<typeof StudyResponse>;

export const StudyResponse = type({
  study: StudyMetadata
});

export interface HistogramRequestParams {
  filters: Filter[];
}

export type HistogramResponse = TypeOf<typeof HistogramResponse>;

export const HistogramResponse = type({
  entitiesCount: number,
  distribution: record(string, number)
});

export class EdaClient extends FetchClient {
  getStudyMetadata(studyId: string): Promise<StudyMetadata> {
    return this.fetch(createJsonRequest({
      method: 'GET',
      path: `/studies/${studyId}`,
      transformResponse: res => ioTransformer(StudyResponse)(res).then(r => r.study)
    }));
  }
  getEntityCount(studyId: string, entityId: string, filters: Filter[]): Promise<{ count: number }> {
    return this.fetch(createJsonRequest({
      method: 'POST',
      path: `/studies/${studyId}/entities/${entityId}/count`,
      body: { filters },
      transformResponse: ioTransformer(type({ count: number }))
    }));
  }
  getDistribution(studyId: string, entityId: string, variableId: string, params: HistogramRequestParams): Promise<HistogramResponse> {
    return this.fetch(createJsonRequest({
      method: 'POST',
      path: `/studies/${studyId}/entities/${entityId}/variables/${variableId}/distribution`,
      body: params,
      transformResponse: ioTransformer(HistogramResponse)
    }));
  }
}
