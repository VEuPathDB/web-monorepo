import { omit } from 'lodash';
import { act, renderHook } from '@testing-library/react-hooks';
import { useAnalysisState, Status, AnalysisStore } from '../../hooks/useAnalysis';
import { Analysis, NewAnalysis } from '../../types/analysis';

let store: AnalysisStore;

let stubAnalysis: NewAnalysis = {
  name: 'My Analysis',
  studyId: '123',
  filters: [],
  derivedVariables: [],
  starredVariables: [],
  variableUISettings: {},
  visualizations: [],
}

const key = '123'

beforeEach(() => {
  const records: Record<string, Analysis> = {
    123: {
      ...stubAnalysis,
      id: key,
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    }
  };
  let nextId = 1;
  store = {
    async getAnalyses() {
      return Object.values(records);
    },
    async getAnalysis(id: string) {
      if (id in records) return records[id];
      throw new Error("Could not find analysis for id " + id);
    },
    async createAnalysis(newAnalysis: NewAnalysis) {
      const id = String(nextId++);
      records[id] = {
        ...newAnalysis,
        id,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      };
      return id;
    },
    async updateAnalysis(analysis: Analysis) {
      records[analysis.id] = analysis;
    },
    async deleteAnalysis(id: string) {
      delete records[id];
    }
  }
})

describe('useAnalysis', () => {

  it('should have the correct status on success path', async () => {
    const { result, waitForValueToChange } = renderHook(() => useAnalysisState(key, store));
    expect(result.current.status === Status.InProgress);
    await waitForValueToChange(() => result.current.status);
    expect(result.current.status === Status.Loaded);
  });

  it('should have the correct status on failure path', async () => {
    const { result, waitForValueToChange } = renderHook(() => useAnalysisState(key, store));
    expect(result.current.status === Status.InProgress);
    await waitForValueToChange(() => result.current.status);
    expect(result.current.status === Status.Error);
  });

  it('should load an analysis', async () => {
    const { result, waitFor } = renderHook(() => useAnalysisState(key, store));
    await waitFor(() => result.current.status === Status.Loaded);
    expect(result.current.history.current).toBeDefined();
    expect(result.current.history.current?.name).toBe('My Analysis');
  });

  it('should allow updates', async () => {
    const { result, waitFor } = renderHook(() => useAnalysisState(key, store));
    await waitFor(() => result.current.status === Status.Loaded)
    act(() => {
      result.current.setName('New Name');
    });
    expect(result.current.history.current?.name).toBe('New Name');
  });

  it('should update store on save', async () => {
    const { result, waitFor } = renderHook(() => useAnalysisState(key, store));
    await waitFor(() => result.current.status === Status.Loaded)
    act(() => result.current.setName('New Name'));
    expect(result.current.hasUnsavedChanges).toBeTruthy();
    await act(() => result.current.saveAnalysis());
    const analyses = await store.getAnalyses();
    const analysis = analyses.find(analysis => analysis.id === key);
    expect(analysis?.name).toBe('New Name');
    expect(result.current.hasUnsavedChanges).toBeFalsy();
  });

  it('should update store on copy', async () => {
    const { result, waitFor } = renderHook(() => useAnalysisState(key, store));
    await waitFor(() => result.current.status === Status.Loaded);
    const newId = await result.current.copyAnalysis();
    const analyses = await store.getAnalyses();
    const newAnalysis = analyses.find(analysis => analysis.id === newId);
    expect(omit(result.current.history.current, 'id')).toEqual(omit(newAnalysis, 'id'));
    expect(result.current.history.current).not.toBe(newAnalysis);
  });

  it('should update store on delete', async () => {
    const { result, waitFor } = renderHook(() => useAnalysisState(key, store));
    await waitFor(() => result.current.status === Status.Loaded);
    await result.current.deleteAnalysis();
    const analyses = await store.getAnalyses();
    const analysis = analyses.find(analysis => analysis.id === key);
    expect(analysis).toBeUndefined();
  });

});
