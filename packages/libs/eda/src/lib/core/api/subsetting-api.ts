/* eslint-disable @typescript-eslint/no-redeclare */
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { createJsonRequest, ioTransformer } from '@veupathdb/http-utils';
import {
  array,
  number,
  partial,
  intersection,
  union,
  string,
  type,
  TypeOf,
} from 'io-ts';
import { memoize } from 'lodash';
import { Filter } from '../types/filter';
import { StudyMetadata, StudyOverview } from '../types/study';
import { FetchClientWithCredentials } from './api-with-credentials';
import { WdkService } from '@veupathdb/wdk-client/lib/Core';

export type StudyResponse = TypeOf<typeof StudyResponse>;

export const StudyResponse = type({
  study: StudyMetadata,
});

export interface DistributionRequestParams {
  filters: Filter[];
  binSpec?: {
    displayRangeMin: number | string;
    displayRangeMax: number | string;
    binWidth: number;
    binUnits?: string;
  };
  valueSpec: 'count';
  /* | 'proportion' FIXME only count works right now */
}

export type DistributionResponse = TypeOf<typeof DistributionResponse>;

export const DistributionResponse = type({
  histogram: array(
    type({
      value: number,
      binStart: string,
      binEnd: string,
      binLabel: string,
    })
  ),
  statistics: intersection([
    partial({
      subsetMin: union([number, string]),
      subsetMax: union([number, string]),
      subsetMean: union([number, string]),
    }),
    type({
      numVarValues: number,
      numDistinctValues: number,
      numDistinctEntityRecords: number,
      numMissingCases: number,
    }),
  ]),
});

export class SubsettingClient extends FetchClientWithCredentials {
  static getClient = memoize(
    (baseUrl: string, wdkService: WdkService): SubsettingClient =>
      new SubsettingClient({ baseUrl }, wdkService)
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
          ioTransformer(StudyResponse)(res).then((r) =>
            orderVariables(r.study)
          ),
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

// !!MUTATION!! order variables in-place
function orderVariables(study: StudyMetadata) {
  for (const entity of preorder(
    study.rootEntity,
    (entity) => entity.children ?? []
  ))
    entity.variables.sort((var1, var2) => {
      if (var1.displayOrder && var2.displayOrder)
        return var1.displayOrder - var2.displayOrder;
      if (var1.displayOrder) return -1;
      if (var2.displayOrder) return 1;
      return var1.displayName < var2.displayName
        ? -1
        : var1.displayName > var2.displayName
        ? 1
        : 0;
    });
  return study;
}
