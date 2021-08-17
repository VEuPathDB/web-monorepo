import { isRight } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';
import localforage from 'localforage';
import {
  Analysis,
  NewAnalysis,
  AnalysisClient,
  AnalysisPreferences,
} from '../core';
import { max } from 'lodash';

const analysisStore = localforage.createInstance({
  name: 'mockAnalysisStore',
});

const preferenceStore = localforage.createInstance({
  name: 'mockPreferenceStore',
});

export const mockAnalysisStore: AnalysisClient = {
  async getPreferences() {
    const prefs = await preferenceStore.getItem('preferences');
    const result = AnalysisPreferences.decode(prefs);
    if (isRight(result)) return result.right;
    throw new Error(PathReporter.report(result).join('\n'));
  },
  async setPreferences(preferences: AnalysisPreferences) {
    await preferenceStore.setItem('preferences', preferences);
  },
  async getAnalyses() {
    const records: Analysis[] = [];
    await analysisStore.iterate((value) => {
      records.push(value as Analysis);
    });
    return records;
  },
  async createAnalysis(newAnalysis: NewAnalysis) {
    const usedIds = await analysisStore.keys();
    const id = String((max(usedIds.map((x) => Number(x))) ?? 0) + 1);
    const now = new Date().toISOString();
    await analysisStore.setItem<Analysis>(id, {
      ...newAnalysis,
      id,
      created: now,
      modified: now,
    });
    return { id };
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
  async updateAnalysis(analysis: Analysis) {
    const now = new Date().toISOString();
    await analysisStore.setItem(analysis.id, { ...analysis, modified: now });
  },
  async deleteAnalysis(id: string) {
    await analysisStore.removeItem(id);
  },
  async deleteAnalyses(ids: string[]) {
    for (const id of ids) await analysisStore.removeItem(id);
  },
} as AnalysisClient;
