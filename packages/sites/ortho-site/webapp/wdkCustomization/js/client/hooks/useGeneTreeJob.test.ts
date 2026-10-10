import { renderHook, act } from '@testing-library/react-hooks';
import { SequenceRetrievalApi } from '@veupathdb/compute-platform-job/src/lib/Service/SequenceRetrievalApi';
import { SubmitJobRequest } from '@veupathdb/compute-platform-job/src/lib/Service/ServiceTypes';
import { useGeneTreeJob } from './useGeneTreeJob';

const REQUEST: SubmitJobRequest = {
  features: [{ contig: 'a', start: 0, end: 10 }],
  postProcess: 'GENETREE',
  geneTreeOptions: { format: 'newick' },
};

function makeFakeApi(
  overrides: Partial<Record<keyof SequenceRetrievalApi, jest.Mock>>
) {
  return {
    submitJob: jest.fn().mockResolvedValue({ jobID: 'j1', status: 'queued' }),
    fetchJob: jest.fn().mockResolvedValue({ jobID: 'j1', status: 'queued' }),
    fetchJobFile: jest.fn().mockResolvedValue('(a,b);'),
    ...overrides,
  } as unknown as SequenceRetrievalApi;
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe('useGeneTreeJob', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('is idle until started', () => {
    const api = makeFakeApi({});
    const { result } = renderHook(() => useGeneTreeJob(api, 'orthomcl'));

    expect(result.current.phase).toBe('idle');
    expect(result.current.newick).toBeUndefined();
    expect(api.submitJob).not.toHaveBeenCalled();
  });

  it('submits the request, then reports the job as queued', async () => {
    const api = makeFakeApi({});
    const { result } = renderHook(() => useGeneTreeJob(api, 'orthomcl'));

    act(() => {
      result.current.start(REQUEST);
    });
    expect(result.current.phase).toBe('submitting');

    await flush();

    expect(api.submitJob).toHaveBeenCalledWith('orthomcl', REQUEST);
    expect(result.current.phase).toBe('running');
    expect(result.current.status).toBe('queued');
  });

  it('fetches the job output and exposes it once the job completes', async () => {
    const api = makeFakeApi({
      fetchJob: jest
        .fn()
        .mockResolvedValue({ jobID: 'j1', status: 'complete' }),
    });
    const { result } = renderHook(() => useGeneTreeJob(api, 'orthomcl'));

    act(() => {
      result.current.start(REQUEST);
    });
    await flush();
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    await flush();

    expect(api.fetchJobFile).toHaveBeenCalledWith('j1', 'output');
    expect(result.current.phase).toBe('done');
    expect(result.current.newick).toBe('(a,b);');
  });

  it.each(['failed', 'expired'] as const)(
    'reports a %s job as an error',
    async (status) => {
      const api = makeFakeApi({
        fetchJob: jest.fn().mockResolvedValue({ jobID: 'j1', status }),
      });
      const { result } = renderHook(() => useGeneTreeJob(api, 'orthomcl'));

      act(() => {
        result.current.start(REQUEST);
      });
      await flush();
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.phase).toBe('error');
      expect(result.current.error).toMatch(new RegExp(status));
      expect(api.fetchJobFile).not.toHaveBeenCalled();
    }
  );

  it('reports a rejected submission as an error', async () => {
    const api = makeFakeApi({
      submitJob: jest.fn().mockRejectedValue(new Error('boom')),
    });
    const { result } = renderHook(() => useGeneTreeJob(api, 'orthomcl'));

    act(() => {
      result.current.start(REQUEST);
    });
    await flush();

    expect(result.current.phase).toBe('error');
    expect(result.current.error).toBe('boom');
  });

  it('reports a failure to fetch the output as an error', async () => {
    const api = makeFakeApi({
      fetchJob: jest
        .fn()
        .mockResolvedValue({ jobID: 'j1', status: 'complete' }),
      fetchJobFile: jest.fn().mockRejectedValue(new Error('no file')),
    });
    const { result } = renderHook(() => useGeneTreeJob(api, 'orthomcl'));

    act(() => {
      result.current.start(REQUEST);
    });
    await flush();
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    await flush();

    expect(result.current.phase).toBe('error');
    expect(result.current.error).toBe('no file');
  });

  it('starting again discards the previous tree and submits a new job', async () => {
    const submitJob = jest
      .fn()
      .mockResolvedValueOnce({ jobID: 'j1', status: 'queued' })
      .mockResolvedValueOnce({ jobID: 'j2', status: 'queued' });
    const fetchJob = jest.fn().mockImplementation(async (id: string) => ({
      jobID: id,
      status: id === 'j1' ? 'complete' : 'queued',
    }));
    const api = makeFakeApi({ submitJob, fetchJob });
    const { result } = renderHook(() => useGeneTreeJob(api, 'orthomcl'));

    act(() => {
      result.current.start(REQUEST);
    });
    await flush();
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    await flush();
    expect(result.current.newick).toBe('(a,b);');

    act(() => {
      result.current.start(REQUEST);
    });
    expect(result.current.newick).toBeUndefined();
    await flush();

    expect(submitJob).toHaveBeenCalledTimes(2);
    expect(result.current.phase).toBe('running');
  });
});
