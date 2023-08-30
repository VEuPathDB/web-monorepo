import { type, voidType, string, array } from 'io-ts';
import { pick } from 'lodash';

import {
  ApiRequest,
  createJsonRequest,
  FetchClientWithCredentials,
  ioTransformer,
} from '@veupathdb/http-utils';

import {
  Analysis,
  AnalysisPreferences,
  AnalysisSummary,
  NewAnalysis,
  PublicAnalysisSummary,
} from '../types/analysis';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';

export type SingleAnalysisPatchRequest = Partial<
  Pick<Analysis, 'displayName' | 'description' | 'descriptor' | 'isPublic'>
>;

export class AnalysisClient extends FetchClientWithCredentials {
  private guestAnalysesTransfer$?: Promise<void>;

  private async transferGuestAnalyses() {
    const user = await this.getUser();

    if (user.isGuest) {
      // If the user is a guest, persist their id
      sessionStorage.setItem('eda::guestUserId', String(user.id));
    } else {
      // If the user is registered, try to read and delete
      // a previously-persisted guest user's id
      const guestUserIdStr = sessionStorage.getItem('eda::guestUserId') ?? '';
      sessionStorage.removeItem('eda::guestUserId');
      const guestUserId = parseInt(guestUserIdStr, 10);

      // If said guest user id is valid, initialize and retain a promise
      // which performs a transfer of that guest user's analyses to the logged-in user
      if (!Number.isNaN(guestUserId)) {
        this.guestAnalysesTransfer$ = this.fetchWithDetails((user, projectId) =>
          createJsonRequest({
            path: this.makeAnalysesPath(user.id, projectId),
            method: 'PATCH',
            body: {
              inheritOwnershipFrom: guestUserId,
            },
            transformResponse: ioTransformer(voidType),
          })
        );
      }

      // If a "guest analyses transfer" has been initiated, await its completion
      if (this.guestAnalysesTransfer$ != null) {
        try {
          await this.guestAnalysesTransfer$;
        } catch (e: any) {
          this.wdkService.submitErrorIfNot500(e);
        }
      }
    }
  }

  protected async fetchWithDetails<T>(
    callback: (user: User, projectId: string) => ApiRequest<T>
  ): Promise<T> {
    const projectId = (await this.wdkService.getConfig()).projectId;
    return this.fetchWithUser((user) => callback(user, projectId));
  }

  private makeUserPath(userId: number) {
    return `/users/${userId}`;
  }

  private makePreferencesPath(userId: number, projectId: string) {
    return `${this.makeUserPath(userId)}/preferences/${projectId}`;
  }

  private makeAnalysesPath(userId: number, projectId: string) {
    return `${this.makeUserPath(userId)}/analyses/${projectId}`;
  }

  async getPreferences(): Promise<AnalysisPreferences> {
    await this.transferGuestAnalyses();
    return this.fetchWithDetails((user, projectId) =>
      createJsonRequest({
        path: this.makePreferencesPath(user.id, projectId),
        method: 'GET',
        transformResponse: ioTransformer(AnalysisPreferences),
      })
    );
  }

  async setPreferences(preferences: AnalysisPreferences): Promise<void> {
    await this.transferGuestAnalyses();
    return this.fetchWithDetails((user, projectId) =>
      createJsonRequest({
        path: `${this.makePreferencesPath(user.id, projectId)}`,
        method: 'PUT',
        body: preferences,
        transformResponse: ioTransformer(voidType),
      })
    );
  }
  async getAnalyses(): Promise<AnalysisSummary[]> {
    await this.transferGuestAnalyses();
    return this.fetchWithDetails((user, projectId) =>
      createJsonRequest({
        path: this.makeAnalysesPath(user.id, projectId),
        method: 'GET',
        transformResponse: ioTransformer(array(AnalysisSummary)),
      })
    );
  }
  async getAnalysis(analysisId: string): Promise<Analysis> {
    await this.transferGuestAnalyses();
    return this.fetchWithDetails((user, projectId) =>
      createJsonRequest({
        path: `${this.makeAnalysesPath(user.id, projectId)}/${analysisId}`,
        method: 'GET',
        transformResponse: ioTransformer(Analysis),
      })
    );
  }
  async createAnalysis(analysis: NewAnalysis): Promise<{ analysisId: string }> {
    await this.transferGuestAnalyses();
    const body: NewAnalysis = pick(analysis, [
      'displayName',
      'description',
      'descriptor',
      'isPublic',
      'studyId',
      'apiVersion',
      'studyVersion',
    ]);

    console.log('fetching in createAnalysis');
    return this.fetchWithDetails((user, projectId) =>
      createJsonRequest({
        path: this.makeAnalysesPath(user.id, projectId),
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
    await this.transferGuestAnalyses();
    const body: SingleAnalysisPatchRequest = pick(analysisPatch, [
      'displayName',
      'description',
      'notes',
      'descriptor',
      'isPublic',
    ]);

    console.log('fetching in updateAnalysis');
    return this.fetchWithDetails((user, projectId) =>
      createJsonRequest({
        path: `${this.makeAnalysesPath(user.id, projectId)}/${analysisId}`,
        method: 'PATCH',
        body,
        transformResponse: ioTransformer(voidType),
      })
    );
  }
  async deleteAnalysis(analysisId: string): Promise<void> {
    await this.transferGuestAnalyses();
    return this.fetchWithDetails((user, projectId) => ({
      path: `${this.makeAnalysesPath(user.id, projectId)}/${analysisId}`,
      method: 'DELETE',
      transformResponse: ioTransformer(voidType),
    }));
  }
  async deleteAnalyses(analysisIds: Iterable<string>): Promise<void> {
    await this.transferGuestAnalyses();
    return this.fetchWithDetails((user, projectId) =>
      createJsonRequest({
        path: this.makeAnalysesPath(user.id, projectId),
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
    return this.fetchWithDetails((user, projectId) => {
      return {
        path: `${this.makeAnalysesPath(
          sourceUserId ?? user.id,
          projectId
        )}/${analysisId}/copy`,
        method: 'POST',
        transformResponse: ioTransformer(type({ analysisId: string })),
      };
    });
  }

  async importAnalysis(analysisId: string): Promise<{ analysisId: string }> {
    return this.fetchWithDetails((user, projectId) => ({
      path: `/import-analysis/${projectId}/${analysisId}`,
      method: 'GET',
      transformResponse: ioTransformer(type({ analysisId: string })),
    }));
  }

  async getPublicAnalyses(): Promise<PublicAnalysisSummary[]> {
    return this.fetchWithDetails((user, projectId) =>
      createJsonRequest({
        path: `/public/analyses/${projectId}`,
        method: 'GET',
        transformResponse: ioTransformer(array(PublicAnalysisSummary)),
      })
    );
  }
}
