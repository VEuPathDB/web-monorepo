import { type, voidType, string, array } from 'io-ts';
import { memoize } from 'lodash';

import {
  createJsonRequest,
  FetchClient,
} from '@veupathdb/web-common/lib/util/api';

import {
  Analysis,
  AnalysisDetails,
  AnalysisPreferences,
  AnalysisSummary,
  NewAnalysis,
  NewAnalysisDetails,
} from '../types/analysis';

import { ioTransformer } from './ioTransformer';

export class AnalysisClient extends FetchClient {
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
  getAnalyses(): Promise<Analysis[]> {
    return this.fetch(
      createJsonRequest({
        path: '/analyses',
        method: 'GET',
        transformResponse: ioTransformer(array(Analysis)),
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
  createAnalysis(analysis: NewAnalysis): Promise<{ id: string }> {
    return this.fetch(
      createJsonRequest({
        path: `/analyses`,
        method: 'POST',
        body: analysis,
        transformResponse: ioTransformer(type({ id: string })),
      })
    );
  }
  updateAnalysis(analysis: Analysis): Promise<void> {
    return this.fetch(
      createJsonRequest({
        path: `/analyses/${analysis.id}`,
        method: 'PUT',
        body: analysis,
        transformResponse: ioTransformer(voidType),
      })
    );
  }
  deleteAnalysis(analysisId: string): Promise<void> {
    return this.fetch(
      createJsonRequest({
        path: `/analyses/${analysisId}`,
        method: 'DELETE',
        body: { analysisId },
        transformResponse: ioTransformer(voidType),
      })
    );
  }
  deleteAnalyses(analysisIds: Iterable<string>): Promise<void> {
    return this.fetch(
      createJsonRequest({
        path: '/analyses',
        method: 'PATCH',
        body: Array.from(analysisIds).map((id) => ({
          op: 'delete',
          id,
        })),
        transformResponse: ioTransformer(voidType),
      })
    );
  }
}

export class NewAnalysisClient extends FetchClient {
  static getClient = memoize(
    (baseUrl: string, authKey: string): NewAnalysisClient =>
      new NewAnalysisClient({
        baseUrl,
        init: { headers: { 'Auth-Key': authKey } },
      }),
    (baseUrl, authKey) => JSON.stringify({ baseUrl, authKey })
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
  getAnalysis(analysisId: string): Promise<AnalysisDetails> {
    return this.fetch(
      createJsonRequest({
        path: `/analyses/${analysisId}`,
        method: 'GET',
        transformResponse: ioTransformer(AnalysisDetails),
      })
    );
  }
  createAnalysis(
    analysis: NewAnalysisDetails
  ): Promise<{ analysisId: string }> {
    return this.fetch(
      createJsonRequest({
        path: `/analyses`,
        method: 'POST',
        body: analysis,
        transformResponse: ioTransformer(type({ analysisId: string })),
      })
    );
  }
  updateAnalysis(
    analysisId: string,
    analysisPatch: Partial<NewAnalysisDetails>
  ): Promise<void> {
    return this.fetch(
      createJsonRequest({
        path: `/analyses/${analysisId}`,
        method: 'PUT',
        body: analysisPatch,
        transformResponse: ioTransformer(voidType),
      })
    );
  }
  deleteAnalysis(analysisId: string): Promise<void> {
    return this.fetch(
      createJsonRequest({
        path: `/analyses/${analysisId}`,
        method: 'DELETE',
        body: { analysisId },
        transformResponse: ioTransformer(voidType),
      })
    );
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
