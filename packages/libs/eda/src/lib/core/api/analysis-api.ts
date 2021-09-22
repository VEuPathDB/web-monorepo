import { type, voidType, string, array } from 'io-ts';
import { memoize, pick } from 'lodash';

import {
  createJsonRequest,
  FetchClient,
} from '@veupathdb/web-common/lib/util/api';

import {
  Analysis,
  AnalysisPreferences,
  AnalysisSummary,
  NewAnalysis,
} from '../types/analysis';

import { ioTransformer } from './ioTransformer';

interface AnalysisClientConfiguration {
  userServiceUrl: string;
  userId: number;
  authKey: string;
}

export type SingleAnalysisPatchRequest = Partial<
  Pick<Analysis, 'displayName' | 'description' | 'descriptor' | 'isPublic'>
>;

export class AnalysisClient extends FetchClient {
  static getClient = memoize(
    (config: AnalysisClientConfiguration): AnalysisClient =>
      new AnalysisClient({
        baseUrl: `${config.userServiceUrl}/${config.userId}`,
        init: { headers: { 'Auth-Key': config.authKey } },
      }),
    JSON.stringify
  );

  getPreferences(): Promise<AnalysisPreferences> {
    return this.fetch(
      createJsonRequest({
        path: '/preferences',
        method: 'GET',
        transformResponse: ioTransformer(AnalysisPreferences),
      })
    );
  }
  setPreferences(preferences: AnalysisPreferences): Promise<void> {
    return this.fetch(
      createJsonRequest({
        path: '/preferences',
        method: 'PUT',
        body: preferences,
        transformResponse: ioTransformer(voidType),
      })
    );
  }
  getAnalyses(): Promise<AnalysisSummary[]> {
    return this.fetch(
      createJsonRequest({
        path: '/analyses',
        method: 'GET',
        transformResponse: ioTransformer(array(AnalysisSummary)),
      })
    );
  }
  getAnalysis(analysisId: string): Promise<Analysis> {
    return this.fetch(
      createJsonRequest({
        path: `/analyses/${analysisId}`,
        method: 'GET',
        transformResponse: ioTransformer(Analysis),
      })
    );
  }
  createAnalysis(analysis: NewAnalysis): Promise<{ analysisId: string }> {
    return this.fetch(
      createJsonRequest({
        path: `/analyses`,
        method: 'POST',
        body: pick(analysis, [
          'displayName',
          'description',
          'descriptor',
          'isPublic',
          'studyId',
          'apiVersion',
          'studyVersion',
        ]),
        transformResponse: ioTransformer(type({ analysisId: string })),
      })
    );
  }
  updateAnalysis(
    analysisId: string,
    analysisPatch: SingleAnalysisPatchRequest
  ): Promise<void> {
    return this.fetch(
      createJsonRequest({
        path: `/analyses/${analysisId}`,
        method: 'PATCH',
        body: pick(analysisPatch, [
          'displayName',
          'description',
          'descriptor',
          'isPublic',
        ]),
        transformResponse: ioTransformer(voidType),
      })
    );
  }
  deleteAnalysis(analysisId: string): Promise<void> {
    return this.fetch({
      path: `/analyses/${analysisId}`,
      method: 'DELETE',
      transformResponse: ioTransformer(voidType),
    });
  }
  deleteAnalyses(analysisIds: Iterable<string>): Promise<void> {
    return this.fetch(
      createJsonRequest({
        path: '/analyses',
        method: 'PATCH',
        body: {
          analysisIdsToDelete: [...analysisIds],
        },
        transformResponse: ioTransformer(voidType),
      })
    );
  }
}
