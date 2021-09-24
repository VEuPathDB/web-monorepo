import { type, voidType, string, array } from 'io-ts';
import { memoize, pick } from 'lodash';

import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import {
  FetchApiOptions,
  FetchClient,
  createJsonRequest,
} from '@veupathdb/web-common/lib/util/api';

import {
  Analysis,
  AnalysisPreferences,
  AnalysisSummary,
  NewAnalysis,
} from '../types/analysis';

import { ioTransformer } from './ioTransformer';

export type SingleAnalysisPatchRequest = Partial<
  Pick<Analysis, 'displayName' | 'description' | 'descriptor' | 'isPublic'>
>;

export class AnalysisClient extends FetchClient {
  static getClient = memoize(
    (userServiceUrl: string, wdkService: WdkService): AnalysisClient =>
      new AnalysisClient(
        {
          baseUrl: userServiceUrl,
        },
        wdkService
      )
  );

  constructor(options: FetchApiOptions, private wdkService: WdkService) {
    super(options);
  }

  private async fetchUserRequestMetadata() {
    const user = await this.wdkService.getCurrentUser();

    return {
      userPath: `/users/${user.id}`,
      authHeaders: { 'Auth-Key': this.findUserRequestAuthKey(user) },
    };
  }

  private findUserRequestAuthKey(wdkUser: User) {
    if (wdkUser.isGuest) {
      return String(wdkUser.id);
    }

    const wdkCheckAuthEntry = document.cookie
      .split('; ')
      .find((x) => x.startsWith('wdk_check_auth='));

    if (wdkCheckAuthEntry == null) {
      throw new Error(
        `Tried to retrieve a non-existent WDK auth key for user ${wdkUser.id}`
      );
    }

    return wdkCheckAuthEntry.replace(/^wdk_check_auth=/, '');
  }

  async getPreferences(): Promise<AnalysisPreferences> {
    const { userPath, authHeaders } = await this.fetchUserRequestMetadata();

    return this.fetch(
      createJsonRequest({
        path: `${userPath}/preferences`,
        headers: authHeaders,
        method: 'GET',
        transformResponse: ioTransformer(AnalysisPreferences),
      })
    );
  }
  async setPreferences(preferences: AnalysisPreferences): Promise<void> {
    const { userPath, authHeaders } = await this.fetchUserRequestMetadata();

    return this.fetch(
      createJsonRequest({
        path: `${userPath}/preferences`,
        headers: authHeaders,
        method: 'PUT',
        body: preferences,
        transformResponse: ioTransformer(voidType),
      })
    );
  }
  async getAnalyses(): Promise<AnalysisSummary[]> {
    const { userPath, authHeaders } = await this.fetchUserRequestMetadata();

    return this.fetch(
      createJsonRequest({
        path: `${userPath}/analyses`,
        headers: authHeaders,
        method: 'GET',
        transformResponse: ioTransformer(array(AnalysisSummary)),
      })
    );
  }
  async getAnalysis(analysisId: string): Promise<Analysis> {
    const { userPath, authHeaders } = await this.fetchUserRequestMetadata();

    return this.fetch(
      createJsonRequest({
        path: `${userPath}/analyses/${analysisId}`,
        headers: authHeaders,
        method: 'GET',
        transformResponse: ioTransformer(Analysis),
      })
    );
  }
  async createAnalysis(analysis: NewAnalysis): Promise<{ analysisId: string }> {
    const { userPath, authHeaders } = await this.fetchUserRequestMetadata();

    const body: NewAnalysis = pick(analysis, [
      'displayName',
      'description',
      'descriptor',
      'isPublic',
      'studyId',
      'apiVersion',
      'studyVersion',
    ]);

    return this.fetch(
      createJsonRequest({
        path: `${userPath}/analyses`,
        headers: authHeaders,
        method: 'POST',
        body,
        transformResponse: ioTransformer(type({ analysisId: string })),
      })
    );
  }
  async updateAnalysis(
    analysisId: string,
    analysisPatch: SingleAnalysisPatchRequest
  ): Promise<void> {
    const { userPath, authHeaders } = await this.fetchUserRequestMetadata();

    const body: SingleAnalysisPatchRequest = pick(analysisPatch, [
      'displayName',
      'description',
      'descriptor',
      'isPublic',
    ]);

    return this.fetch(
      createJsonRequest({
        path: `${userPath}/analyses/${analysisId}`,
        headers: authHeaders,
        method: 'PATCH',
        body,
        transformResponse: ioTransformer(voidType),
      })
    );
  }
  async deleteAnalysis(analysisId: string): Promise<void> {
    const { userPath, authHeaders } = await this.fetchUserRequestMetadata();

    return this.fetch({
      path: `${userPath}/analyses/${analysisId}`,
      headers: authHeaders,
      method: 'DELETE',
      transformResponse: ioTransformer(voidType),
    });
  }
  async deleteAnalyses(analysisIds: Iterable<string>): Promise<void> {
    const { userPath, authHeaders } = await this.fetchUserRequestMetadata();

    return this.fetch(
      createJsonRequest({
        path: `${userPath}/analyses`,
        headers: authHeaders,
        method: 'PATCH',
        body: {
          analysisIdsToDelete: [...analysisIds],
        },
        transformResponse: ioTransformer(voidType),
      })
    );
  }
}
