import { type, voidType, string, array } from 'io-ts';
import { pick } from 'lodash';

import {
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
        this.guestAnalysesTransfer$ = this.fetchWithUser((user) =>
          createJsonRequest({
            path: `${this.findUserPath(user.id)}/analyses`,
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
        } catch (e) {
          this.wdkService.submitErrorIfNot500(e);
        }
      }
    }
  }

  private findUserPath(userId: number) {
    return `/users/${userId}`;
  }

  async getPreferences(): Promise<AnalysisPreferences> {
    await this.transferGuestAnalyses();
    return this.fetchWithUser((user) =>
      createJsonRequest({
        path: `${this.findUserPath(user.id)}/preferences`,
        method: 'GET',
        transformResponse: ioTransformer(AnalysisPreferences),
      })
    );
  }

  async setPreferences(preferences: AnalysisPreferences): Promise<void> {
    await this.transferGuestAnalyses();
    return this.fetchWithUser((user) =>
      createJsonRequest({
        path: `${this.findUserPath(user.id)}/preferences`,
        method: 'PUT',
        body: preferences,
        transformResponse: ioTransformer(voidType),
      })
    );
  }
  async getAnalyses(): Promise<AnalysisSummary[]> {
    await this.transferGuestAnalyses();
    return this.fetchWithUser((user) =>
      createJsonRequest({
        path: `${this.findUserPath(user.id)}/analyses`,
        method: 'GET',
        transformResponse: ioTransformer(array(AnalysisSummary)),
      })
    );
  }
  async getAnalysis(analysisId: string): Promise<Analysis> {
    await this.transferGuestAnalyses();
    return this.fetchWithUser((user) =>
      createJsonRequest({
        path: `${this.findUserPath(user.id)}/analyses/${analysisId}`,
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

    return this.fetchWithUser((user) =>
      createJsonRequest({
        path: `${this.findUserPath(user.id)}/analyses`,
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
      'descriptor',
      'isPublic',
    ]);

    return this.fetchWithUser((user) =>
      createJsonRequest({
        path: `${this.findUserPath(user.id)}/analyses/${analysisId}`,
        method: 'PATCH',
        body,
        transformResponse: ioTransformer(voidType),
      })
    );
  }
  async deleteAnalysis(analysisId: string): Promise<void> {
    await this.transferGuestAnalyses();
    return this.fetchWithUser((user) => ({
      path: `${this.findUserPath(user.id)}/analyses/${analysisId}`,
      method: 'DELETE',
      transformResponse: ioTransformer(voidType),
    }));
  }
  async deleteAnalyses(analysisIds: Iterable<string>): Promise<void> {
    await this.transferGuestAnalyses();
    return this.fetchWithUser((user) =>
      createJsonRequest({
        path: `${this.findUserPath(user.id)}/analyses`,
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
    return this.fetchWithUser((user) => {
      // Copy from self if no sourceUserId is provided
      const sourceUserPath = this.findUserPath(
        sourceUserId == null ? user.id : sourceUserId
      );

      return {
        path: `${sourceUserPath}/analyses/${analysisId}/copy`,
        method: 'POST',
        transformResponse: ioTransformer(type({ analysisId: string })),
      };
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
}
