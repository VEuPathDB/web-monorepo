import { isRight } from 'fp-ts/lib/Either';
import { PathReporter } from 'io-ts/lib/PathReporter';
import localforage from 'localforage';
import { Analysis, NewAnalysis, AnalysisClient } from '../core';

const localStore = localforage.createInstance({
  name: 'mockAnalysisStore',
});

export const mockAnalysisStore: AnalysisClient = {
  async getAnalysiss() {
    const records: Analysis[] = [];
    await localStore.iterate((value) => {
      records.push(value as Analysis);
    });
    return records;
  },
  async createAnalysis(newAnalysis: NewAnalysis) {
    const id = String((await localStore.keys()).length + 2);
    const now = new Date().toISOString();
    await localStore.setItem<Analysis>(id, {
      ...newAnalysis,
      id,
      created: now,
      modified: now,
    });
    return { id };
  },
  async getAnalysis(id: string) {
    const analysis = await localStore.getItem(id);
    if (analysis) {
      const result = Analysis.decode(analysis);
      if (isRight(result)) return result.right;
      throw new Error(PathReporter.report(result).join('\n'));
    }
    throw new Error(`Could not find analysis with id "${id}".`);
  },
  async updateAnalysis(analysis: Analysis) {
    const now = new Date().toISOString();
    await localStore.setItem(analysis.id, { ...analysis, modified: now });
  },
  async deleteAnalysis(id: string) {
    await localStore.removeItem(id);
  },
} as AnalysisClient;
