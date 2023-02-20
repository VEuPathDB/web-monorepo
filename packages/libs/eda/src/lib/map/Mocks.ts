import localforage from 'localforage';

import { makeMockAnalysisStore } from '../core/Mocks';

const analysisStore = localforage.createInstance({
  name: 'mockAnalysisStore',
});

const preferenceStore = localforage.createInstance({
  name: 'mockPreferenceStore',
});

export const mockAnalysisStore = makeMockAnalysisStore(
  analysisStore,
  preferenceStore
);
