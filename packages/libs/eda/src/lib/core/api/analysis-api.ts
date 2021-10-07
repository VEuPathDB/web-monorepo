import { type, voidType, string, array } from 'io-ts';
import { memoize, once, pick } from 'lodash';

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

  private readonly user$: () => Promise<User>;
  private readonly authKey$: () => Promise<string>;
  private readonly userPath$: () => Promise<string>;

  constructor(options: FetchApiOptions, private wdkService: WdkService) {
    super(options);

    this.user$ = once(() => this.wdkService.getCurrentUser());
    this.authKey$ = once(() => this.user$().then(this.findUserRequestAuthKey));
    this.userPath$ = once(() =>
      this.user$().then((user) => this.findUserPath(user.id))
    );
  }

  protected async fetch<T>(
    apiRequest: ApiRequest<T>,
    transferGuestAnalysesFirst = true
  ): Promise<T> {
    if (transferGuestAnalysesFirst) {
      const user = await this.user$();

      if (user.isGuest) {
        sessionStorage.setItem('eda::guestUserId', String(user.id));
      } else {
        const guestUserIdStr = sessionStorage.getItem('eda::guestUserId') ?? '';
        sessionStorage.removeItem('eda::guestUserId');
        const guestUserId = parseInt(guestUserIdStr, 10);

        if (!Number.isNaN(guestUserId)) {
          await this.transferGuestAnalyses(guestUserId);
        }
      }
    }

    const apiRequestWithAuth: ApiRequest<T> = {
      ...apiRequest,
      headers: {
        ...(apiRequest.headers ?? {}),
        'Auth-Key': await this.authKey$(),
      },
    };

    return super.fetch(apiRequestWithAuth);
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

  private findUserPath(userId: number) {
    return `/users/${userId}`;
  }

  async getPreferences(): Promise<AnalysisPreferences> {
    return this.fetch(
      createJsonRequest({
        path: `${await this.userPath$()}/preferences`,
        method: 'GET',
        transformResponse: ioTransformer(AnalysisPreferences),
      })
    );
  }
  async setPreferences(preferences: AnalysisPreferences): Promise<void> {
    return this.fetch(
      createJsonRequest({
        path: `${await this.userPath$()}/preferences`,
        method: 'PUT',
        body: preferences,
        transformResponse: ioTransformer(voidType),
      })
    );
  }
  async getAnalyses(): Promise<AnalysisSummary[]> {
    return this.fetch(
      createJsonRequest({
        path: `${await this.userPath$()}/analyses`,
        method: 'GET',
        transformResponse: ioTransformer(array(AnalysisSummary)),
      })
    );
  }
  async getAnalysis(analysisId: string): Promise<Analysis> {
    return this.fetch(
      createJsonRequest({
        path: `${await this.userPath$()}/analyses/${analysisId}`,
        method: 'GET',
        transformResponse: ioTransformer(Analysis),
      })
    );
  }
  async createAnalysis(analysis: NewAnalysis): Promise<{ analysisId: string }> {
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
        path: `${await this.userPath$()}/analyses`,
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
    const body: SingleAnalysisPatchRequest = pick(analysisPatch, [
      'displayName',
      'description',
      'descriptor',
      'isPublic',
    ]);

    return this.fetch(
      createJsonRequest({
        path: `${await this.userPath$()}/analyses/${analysisId}`,
        method: 'PATCH',
        body,
        transformResponse: ioTransformer(voidType),
      })
    );
  }
  async deleteAnalysis(analysisId: string): Promise<void> {
    return this.fetch({
      path: `${await this.userPath$()}/analyses/${analysisId}`,
      method: 'DELETE',
      transformResponse: ioTransformer(voidType),
    });
  }
  async deleteAnalyses(analysisIds: Iterable<string>): Promise<void> {
    return this.fetch(
      createJsonRequest({
        path: `${await this.userPath$()}/analyses`,
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
        ? await this.userPath$()
        : this.findUserPath(sourceUserId);

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
      }),
      false
    );
  }
  private async transferGuestAnalyses(guestUserId: number): Promise<void> {
    return this.fetch(
      createJsonRequest({
        path: `${await this.userPath$()}/analyses`,
        method: 'PATCH',
        body: {
          inheritOwnershipFrom: guestUserId,
        },
        transformResponse: ioTransformer(voidType),
      }),
      false
    );
  }
}
