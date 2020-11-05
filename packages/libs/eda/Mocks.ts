import localforage from 'localforage';
import { StudyMetadataStore } from 'ebrc-client/modules/eda-workspace-core/hooks/useStudy';
import { AnalysisStore } from 'ebrc-client/modules/eda-workspace-core/hooks/useAnalysis';
import { Analysis, NewAnalysis } from 'ebrc-client/modules/eda-workspace-core/types/analysis';

export const mockStudyMetadataStore: StudyMetadataStore = {
  async getStudyMetadata(studyId) {
    return {
      id: studyId,
      name: 'Foo',
      rootEntity: {
        id: 'foo',
        name: 'Foo',
        description: 'foo',
        variablesTree: [],
        children: []
      }
    }
  }
}

const localStore = localforage.createInstance({
  name: 'mockAnalysisStore'
});

export const mockAnalysisStore: AnalysisStore = {
  async getAnalyses() {
    const records: Analysis[] = [];
    await localStore.iterate((value) => {
      records.push(value as Analysis);
    });
    return records;
  },
  async createAnalysis(newAnalysis: NewAnalysis) {
    const id = String((await localStore.keys()).length + 1);
    const now = new Date().toISOString();
    await localStore.setItem<Analysis>(id, { ...newAnalysis, id, created: now, modified: now });
    return id;
  },
  async getAnalysis(id: string) {
    const analysis = await localStore.getItem(id);
    if (analysis) return analysis as Analysis;
    throw new Error(`Could not find analysis with id "${id}".`);
  },
  async updateAnalysis(analysis: Analysis) {
    const now = new Date().toISOString();
    await localStore.setItem(analysis.id, { ...analysis, modified: now });
  },
  async deleteAnalysis(id: string) {
    await localStore.removeItem(id);
  }
};
