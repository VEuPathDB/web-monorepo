import {
  createJsonRequest,
  FetchClient,
} from '@veupathdb/web-common/lib/util/api';
import { number, record, string, type, TypeOf } from 'io-ts';
import { Filter } from '../types/filter';
import { StudyMetadata } from '../types/study';
import { ioTransformer } from './ioTransformer';

export type StudyResponse = TypeOf<typeof StudyResponse>;

export const StudyResponse = type({
  study: StudyMetadata,
});

export interface DistributionRequestParams {
  filters: Filter[];
}

export type DistributionResponse = TypeOf<typeof DistributionResponse>;

export const DistributionResponse = type({
  entitiesCount: number,
  distribution: record(string, number),
});

export class SubsettingClient extends FetchClient {
  getStudyMetadata(studyId: string): Promise<StudyMetadata> {
    return this.fetch(
      createJsonRequest({
        method: 'GET',
        path: `/studies/${studyId}`,
        transformResponse: (res) =>
          ioTransformer(StudyResponse)(res).then((r) => r.study),
      })
    );
  }
  getEntityCount(
    studyId: string,
    entityId: string,
    filters: Filter[]
  ): Promise<{ count: number }> {
    return this.fetch(
      createJsonRequest({
        method: 'POST',
        path: `/studies/${studyId}/entities/${entityId}/count`,
        body: { filters },
        transformResponse: ioTransformer(type({ count: number })),
      })
    );
  }
  getDistribution(
    studyId: string,
    entityId: string,
    variableId: string,
    params: DistributionRequestParams
  ): Promise<DistributionResponse> {
    return this.fetch(
      createJsonRequest({
        method: 'POST',
        path: `/studies/${studyId}/entities/${entityId}/variables/${variableId}/distribution`,
        body: params,
        transformResponse: ioTransformer(DistributionResponse),
      })
    );
  }
}
