/* eslint-disable @typescript-eslint/no-redeclare */
import {
  createJsonRequest,
  FetchClient,
} from '@veupathdb/web-common/lib/util/api';
import { array, number, record, string, type, TypeOf } from 'io-ts';
import { memoize } from 'lodash';
import { Filter } from '../types/filter';
import { StudyMetadata, StudyOverview } from '../types/study';
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
  static getClient = memoize(
    (baseUrl: string): SubsettingClient => new SubsettingClient({ baseUrl })
  );

  getStudies(): Promise<StudyOverview[]> {
    return this.fetch(
      createJsonRequest({
        method: 'GET',
        path: '/studies',
        transformResponse: (res) =>
          ioTransformer(type({ studies: array(StudyOverview) }))(res).then(
            (r) => r.studies
          ),
      })
    );
  }
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
