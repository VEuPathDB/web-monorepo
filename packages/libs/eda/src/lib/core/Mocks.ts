import { isLeft, isRight } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';
import {
  Analysis,
  AnalysisClient,
  AnalysisDescriptor,
  AnalysisPreferences,
  AnalysisSummary,
  NewAnalysis,
  SingleAnalysisPatchRequest,
} from '../core';
import { max } from 'lodash';

export function makeMockAnalysisStore(
  analysisStore: LocalForage,
  preferenceStore: LocalForage
): AnalysisClient {
  return {
    async getPreferences() {
      const prefs = await preferenceStore.getItem('preferences');
      const result = AnalysisPreferences.decode(prefs);
      if (isRight(result)) return result.right;
      throw new Error(PathReporter.report(result).join('\n'));
    },
    async setPreferences(preferences: AnalysisPreferences) {
      await preferenceStore.setItem<AnalysisPreferences>(
        'preferences',
        preferences
      );
    },
    async getAnalyses() {
      const records: AnalysisSummary[] = [];
      await analysisStore.iterate((value) => {
        const result = Analysis.decode(value);
        if (isLeft(result)) {
          throw new Error(PathReporter.report(result).join('\n'));
        }
        const { descriptor, ...analysisSummary } = result.right;
        records.push(analysisSummary);
      });
      return records;
    },
    async createAnalysis(newAnalysis: NewAnalysis) {
      const usedIds = await analysisStore.keys();
      const analysisId = String((max(usedIds.map((x) => Number(x))) ?? 0) + 1);
      const now = new Date().toISOString();
      await analysisStore.setItem<Analysis>(analysisId, {
        ...newAnalysis,
        ...computeSummaryCounts(newAnalysis.descriptor),
        analysisId,
        creationTime: now,
        modificationTime: now,
      });
      return { analysisId };
    },
    async getAnalysis(id: string) {
      const analysis = await analysisStore.getItem(id);
      if (analysis) {
        const result = Analysis.decode(analysis);
        if (isRight(result)) return result.right;
        throw new Error(PathReporter.report(result).join('\n'));
      }
      throw new Error(`Could not find analysis with id "${id}".`);
    },
    async updateAnalysis(
      analysisId: string,
      analysisPatch: SingleAnalysisPatchRequest
    ) {
      const analysis = await analysisStore.getItem(analysisId);
      if (analysis == null) {
        throw new Error(
          `Tried to update a nonexistent analysis with id "${analysisId}".`
        );
      }

      const result = Analysis.decode(analysis);
      if (isLeft(result)) {
        throw new Error(PathReporter.report(result).join('\n'));
      }

      const decodedAnalysis = result.right;
      const now = new Date().toISOString();
      await analysisStore.setItem<Analysis>(analysisId, {
        ...decodedAnalysis,
        ...analysisPatch,
        ...(analysisPatch.descriptor == null
          ? {}
          : computeSummaryCounts(analysisPatch.descriptor)),
        modificationTime: now,
      });
    },
    async deleteAnalysis(id: string) {
      await analysisStore.removeItem(id);
    },
    async deleteAnalyses(ids: Iterable<string>) {
      const deletionPromises = Array.from(ids).map((id) =>
        analysisStore.removeItem(id)
      );

      await Promise.allSettled(deletionPromises);
    },
    async copyAnalysis(analysisId: string, sourceUserId?: string) {
      const analysis = await this.getAnalysis(analysisId);
      return await this.createAnalysis({ ...analysis, isPublic: false });
    },
    async getPublicAnalyses() {
      const analysisList = await this.getAnalyses();
      return analysisList
        .filter(({ isPublic }) => isPublic === true)
        .map((analysisSummary) => ({
          ...analysisSummary,
          userId: 1234,
          userName: 'You',
          userOrganization: 'Your Organization',
        }));
    },
  } as AnalysisClient;
}

export function computeSummaryCounts(
  descriptor: AnalysisDescriptor
): Pick<
  AnalysisSummary,
  'numComputations' | 'numFilters' | 'numVisualizations'
> {
  return {
    numFilters: descriptor.subset.descriptor.length,
    numComputations: descriptor.computations.length,
    numVisualizations: descriptor.computations
      .map(({ visualizations }) => visualizations.length)
      .reduce((memo, visualizationCount) => memo + visualizationCount, 0),
  };
}
