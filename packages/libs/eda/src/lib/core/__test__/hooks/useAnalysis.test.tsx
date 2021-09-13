import { omit } from 'lodash';
import { act, renderHook } from '@testing-library/react-hooks';
import { useAnalysis, Status } from '../../hooks/analysis';
import { Analysis, NewAnalysis } from '../../types/analysis';
import { AnalysisClient } from '../../api/analysis-api';
import DataClient from '../../api/dataClient';
import {
  StudyMetadata,
  StudyRecord,
  StudyRecordClass,
  WorkspaceContext,
} from '../..';
import { SubsettingClient } from '../../api/subsetting-api';

const stubAnalysis: NewAnalysis = {
  name: 'My Analysis',
  studyId: '123',
  filters: [],
  derivedVariables: [],
  starredVariables: [],
  variableUISettings: {},
  visualizations: [],
  computations: [],
  dataTableSettings: {
    selectedVariables: {},
    sorting: [],
  },
};

const key = '123';

let records: Record<string, Analysis>;
let nextId: number;

const analysisClient: AnalysisClient = {
  async getAnalyses() {
    return Object.values(records);
  },
  async getAnalysis(id: string) {
    if (id in records) return records[id];
    throw new Error('Could not find analysis for id ' + id);
  },
  async createAnalysis(newAnalysis: NewAnalysis) {
    const id = String(nextId++);
    records[id] = {
      ...newAnalysis,
      id,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    };
    return { id };
  },
  async updateAnalysis(analysis: Analysis) {
    records[analysis.id] = analysis;
  },
  async deleteAnalysis(id: string) {
    delete records[id];
  },
} as AnalysisClient;

const wrapper: React.ComponentType = ({ children }) => (
  <WorkspaceContext.Provider
    value={{
      analysisClient,
      studyMetadata: {} as StudyMetadata,
      studyRecord: {} as StudyRecord,
      studyRecordClass: {} as StudyRecordClass,
      subsettingClient: {} as SubsettingClient,
      dataClient: {} as DataClient,
    }}
  >
    {children}
  </WorkspaceContext.Provider>
);

beforeEach(() => {
  records = {
    123: {
      ...stubAnalysis,
      id: key,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    },
  };
  nextId = 1;
});

const render = () => renderHook(() => useAnalysis(key), { wrapper });

describe('useAnalysis', () => {
  it('should have the correct status on success path', async () => {
    const { result, waitForValueToChange } = render();
    expect(result.current.status).toBe(Status.InProgress);
    await waitForValueToChange(() => result.current.status);
    expect(result.current.status).toBe(Status.Loaded);
  });

  it('should have the correct status on failure path', async () => {
    const { result, waitForValueToChange } = render();
    expect(result.current.status).toBe(Status.InProgress);
    await waitForValueToChange(() => result.current.status);
    expect(result.current.status).toBe(Status.Error);
  });

  it('should load an analysis', async () => {
    const { result, waitFor } = render();
    await waitFor(() => result.current.status === Status.Loaded);
    expect(result.current.analysis).toBeDefined();
    expect(result.current.analysis?.name).toBe('My Analysis');
  });

  it('should allow updates', async () => {
    const { result, waitFor } = render();
    await waitFor(() => result.current.status === Status.Loaded);
    act(() => {
      result.current.setName('New Name');
    });
    expect(result.current.analysis?.name).toBe('New Name');
  });

  it('should update store on save', async () => {
    const { result, waitFor } = render();
    await waitFor(() => result.current.status === Status.Loaded);
    act(() => result.current.setName('New Name'));
    expect(result.current.hasUnsavedChanges).toBeTruthy();
    await act(() => result.current.saveAnalysis());
    const analyses = await analysisClient.getAnalyses();
    const analysis = analyses.find((analysis) => analysis.id === key);
    expect(analysis?.name).toBe('New Name');
    expect(result.current.hasUnsavedChanges).toBeFalsy();
  });

  it('should update store on copy', async () => {
    const { result, waitFor } = render();
    await waitFor(() => result.current.status === Status.Loaded);
    const res = await result.current.copyAnalysis();
    const analyses = await analysisClient.getAnalyses();
    const newAnalysis = analyses.find((analysis) => analysis.id === res.id);
    expect(omit(result.current.analysis, 'id')).toEqual(
      omit(newAnalysis, 'id')
    );
    expect(result.current.analysis).not.toBe(newAnalysis);
  });

  it('should update store on delete', async () => {
    const { result, waitFor } = render();
    await waitFor(() => result.current.status === Status.Loaded);
    await result.current.deleteAnalysis();
    const analyses = await analysisClient.getAnalyses();
    const analysis = analyses.find((analysis) => analysis.id === key);
    expect(analysis).toBeUndefined();
  });
});
