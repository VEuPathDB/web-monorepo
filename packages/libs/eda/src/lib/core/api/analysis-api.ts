import { type, voidType, string, array } from 'io-ts';
import { memoize, pick } from 'lodash';

import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import {
  ApiRequest,
  FetchApiOptions,
  FetchClient,
  createJsonRequest,
} from '@veupathdb/web-common/lib/util/api';

import {
  Analysis,
  AnalysisPreferences,
  AnalysisSummary,
  NewAnalysis,
  PublicAnalysisSummary,
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

  protected async fetch<T>(apiRequest: ApiRequest<T>): Promise<T> {
    const apiRequestWithAuth: ApiRequest<T> = {
      ...apiRequest,
      headers: {
        ...(apiRequest.headers ?? {}),
        'Auth-Key': (await this.userRequestMetadata$).authKey,
      },
    };

    return super.fetch(apiRequestWithAuth);
  }

  private readonly userRequestMetadata$ = this.fetchUserRequestMetadata();

  private async fetchUserRequestMetadata() {
    const user = await this.wdkService.getCurrentUser();

    return {
      userPath: `/users/${user.id}`,
      authKey: this.findUserRequestAuthKey(user),
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
    const { userPath } = await this.userRequestMetadata$;

    return this.fetch(
      createJsonRequest({
        path: `${userPath}/preferences`,
        method: 'GET',
        transformResponse: ioTransformer(AnalysisPreferences),
      })
    );
  }
  async setPreferences(preferences: AnalysisPreferences): Promise<void> {
    const { userPath } = await this.userRequestMetadata$;

    return this.fetch(
      createJsonRequest({
        path: `${userPath}/preferences`,
        method: 'PUT',
        body: preferences,
        transformResponse: ioTransformer(voidType),
      })
    );
  }
  async getAnalyses(): Promise<AnalysisSummary[]> {
    const { userPath } = await this.userRequestMetadata$;

    return this.fetch(
      createJsonRequest({
        path: `${userPath}/analyses`,
        method: 'GET',
        transformResponse: ioTransformer(array(AnalysisSummary)),
      })
    );
  }
  async getAnalysis(analysisId: string): Promise<Analysis> {
    const { userPath } = await this.userRequestMetadata$;

    return this.fetch(
      createJsonRequest({
        path: `${userPath}/analyses/${analysisId}`,
        method: 'GET',
        transformResponse: ioTransformer(Analysis),
      })
    );
  }
  async createAnalysis(analysis: NewAnalysis): Promise<{ analysisId: string }> {
    const { userPath } = await this.userRequestMetadata$;

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
    const { userPath } = await this.userRequestMetadata$;

    const body: SingleAnalysisPatchRequest = pick(analysisPatch, [
      'displayName',
      'description',
      'descriptor',
      'isPublic',
    ]);

    return this.fetch(
      createJsonRequest({
        path: `${userPath}/analyses/${analysisId}`,
        method: 'PATCH',
        body,
        transformResponse: ioTransformer(voidType),
      })
    );
  }
  async deleteAnalysis(analysisId: string): Promise<void> {
    const { userPath } = await this.userRequestMetadata$;

    return this.fetch({
      path: `${userPath}/analyses/${analysisId}`,
      method: 'DELETE',
      transformResponse: ioTransformer(voidType),
    });
  }
  async deleteAnalyses(analysisIds: Iterable<string>): Promise<void> {
    const { userPath } = await this.userRequestMetadata$;

    return this.fetch(
      createJsonRequest({
        path: `${userPath}/analyses`,
        method: 'PATCH',
        body: {
          analysisIdsToDelete: [...analysisIds],
        },
        transformResponse: ioTransformer(voidType),
      })
    );
  }
  async copyAnalysis(
    analysisId: string,
    sourceUserId?: number
  ): Promise<{ analysisId: string }> {
    // Copy from self if no sourceUserId is provided
    const sourceUserPath =
      sourceUserId == null
        ? (await this.userRequestMetadata$).userPath
        : `/users/${sourceUserId}`;

    return this.fetch({
      path: `${sourceUserPath}/analyses/${analysisId}/copy`,
      method: 'POST',
      transformResponse: ioTransformer(type({ analysisId: string })),
    });
  }
  async getPublicAnalyses(): Promise<PublicAnalysisSummary[]> {
    return this.fetch(
      createJsonRequest({
        path: '/public/analyses',
        method: 'GET',
        transformResponse: ioTransformer(array(PublicAnalysisSummary)),
      })
    );
  }
  async transferGuestAnalyses(guestUserId: number): Promise<void> {
    const { userPath } = await this.userRequestMetadata$;

    return this.fetch(
      createJsonRequest({
        path: `${userPath}/analyses`,
        method: 'PATCH',
        body: {
          inheritOwnershipFrom: guestUserId,
        },
        transformResponse: ioTransformer(voidType),
      })
    );
  }
}
