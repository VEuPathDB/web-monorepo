import { omit } from 'lodash';
import { act, renderHook } from '@testing-library/react-hooks';
import { computeSummaryCounts } from '../../Mocks';
import { useAnalysis, Status } from '../../hooks/analysis';
import { Analysis, NewAnalysis, makeNewAnalysis } from '../../types/analysis';
import {
  AnalysisClient,
  SingleAnalysisPatchRequest,
} from '../../api/AnalysisClient';
import DataClient from '../../api/DataClient';
import {
  StudyMetadata,
  StudyRecord,
  StudyRecordClass,
  WorkspaceContext,
} from '../..';
import SubsettingClient from '../../api/SubsettingClient';
import { DownloadClient } from '../../api/DownloadClient';
import { ComputeClient } from '../../api/ComputeClient';
import { PropsWithChildren } from 'react';

const analysisId = '123';

const stubAnalysis: NewAnalysis = makeNewAnalysis(analysisId);

let records: Record<string, Analysis>;
let nextId: number;

const analysisClient: AnalysisClient = {
  async getAnalyses() {
    return Object.values(records).map(
      ({ descriptor, ...analysisSummary }) => analysisSummary
    );
  },
  async getAnalysis(id: string) {
    if (id in records) return records[id];
    throw new Error('Could not find analysis for id ' + id);
  },
  async createAnalysis(newAnalysis: NewAnalysis) {
    const analysisId = String(nextId++);
    records[analysisId] = {
      ...newAnalysis,
      ...computeSummaryCounts(newAnalysis.descriptor),
      analysisId,
      creationTime: new Date().toISOString(),
      modificationTime: new Date().toISOString(),
    };
    return { analysisId };
  },
  async updateAnalysis(
    analysisId: string,
    analysisPatch: SingleAnalysisPatchRequest
  ) {
    if (!(analysisId in records))
      throw new Error(
        'Tried to update a nonexistent analysis with id ' + analysisId
      );

    records[analysisId] = {
      ...records[analysisId],
      ...analysisPatch,
      ...(analysisPatch.descriptor == null
        ? {}
        : computeSummaryCounts(analysisPatch.descriptor)),
      modificationTime: new Date().toISOString(),
    };
  },
  async deleteAnalysis(id: string) {
    delete records[id];
  },
} as AnalysisClient;

const wrapper: React.FC<PropsWithChildren> = ({ children }) => (
  <WorkspaceContext.Provider
    value={{
      analysisClient,
      studyMetadata: {} as StudyMetadata,
      studyRecord: {} as StudyRecord,
      studyRecordClass: {} as StudyRecordClass,
      subsettingClient: {} as SubsettingClient,
      dataClient: {} as DataClient,
      downloadClient: {} as DownloadClient,
      computeClient: {} as ComputeClient,
    }}
  >
    {children}
  </WorkspaceContext.Provider>
);

beforeEach(() => {
  const now = new Date().toISOString();

  records = {
    123: {
      ...stubAnalysis,
      ...computeSummaryCounts(stubAnalysis.descriptor),
      analysisId,
      creationTime: now,
      modificationTime: now,
    },
  };
  nextId = 1;
});

const render = () =>
  renderHook(() => useAnalysis(analysisId), {
    wrapper,
  });

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
    expect(result.current.analysis?.displayName).toBe('My Analysis');
  });

  it('should allow updates', async () => {
    const { result, waitFor } = render();
    await waitFor(() => result.current.status === Status.Loaded);
    act(() => {
      result.current.setName('New Name');
    });
    expect(result.current.analysis?.displayName).toBe('New Name');
  });

  it('should update store on save', async () => {
    const { result, waitFor } = render();
    await waitFor(() => result.current.status === Status.Loaded);
    act(() => {
      result.current.setName('New Name');
    });
    expect(result.current.hasUnsavedChanges).toBeTruthy();
    await act(() => result.current.saveAnalysis());
    const analyses = await analysisClient.getAnalyses();
    const analysis = analyses.find(
      (analysis) => analysis.analysisId === analysisId
    );
    expect(analysis?.displayName).toBe('New Name');
    expect(result.current.hasUnsavedChanges).toBeFalsy();
  });

  it('should update store on copy', async () => {
    const { result, waitFor } = render();
    await waitFor(() => result.current.status === Status.Loaded);
    const res = await result.current.copyAnalysis();
    const analyses = await analysisClient.getAnalyses();
    const newAnalysis = analyses.find(
      (analysis) => analysis.analysisId === res.analysisId
    );
    expect(omit(result.current.analysis, 'analysisId')).toEqual(
      omit(newAnalysis, 'analysisId')
    );
    expect(result.current.analysis).not.toBe(newAnalysis);
  });

  it('should update store on delete', async () => {
    const { result, waitFor } = render();
    await waitFor(() => result.current.status === Status.Loaded);
    await result.current.deleteAnalysis();
    const analyses = await analysisClient.getAnalyses();
    const analysis = analyses.find(
      (analysis) => analysis.analysisId === analysisId
    );
    expect(analysis).toBeUndefined();
  });
});
