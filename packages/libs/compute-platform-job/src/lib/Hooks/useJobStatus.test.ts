import { renderHook, act } from '@testing-library/react-hooks';
import { useJobStatus } from './useJobStatus';
import { SequenceRetrievalApi } from '../Service/SequenceRetrievalApi';

function makeFakeApi(fetchJob: jest.Mock) {
  return { fetchJob } as unknown as SequenceRetrievalApi;
}

describe('useJobStatus', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('does nothing without a job id', () => {
    const fetchJob = jest.fn();
    const { result } = renderHook(() =>
      useJobStatus({ api: makeFakeApi(fetchJob), jobId: undefined })
    );

    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(fetchJob).not.toHaveBeenCalled();
    expect(result.current.status).toBeUndefined();
  });

  it('starts as queued and follows the polled job to completion, then stops polling', async () => {
    const fetchJob = jest
      .fn()
      .mockResolvedValueOnce({ jobID: 'j1', status: 'in-progress' })
      .mockResolvedValue({ jobID: 'j1', status: 'complete' });
    const { result } = renderHook(() =>
      useJobStatus({ api: makeFakeApi(fetchJob), jobId: 'j1' })
    );

    expect(result.current.status).toBe('queued');

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(fetchJob).toHaveBeenCalledWith('j1');
    expect(result.current.status).toBe('in-progress');

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.status).toBe('complete');

    await act(async () => {
      jest.advanceTimersByTime(60000);
    });
    expect(fetchJob).toHaveBeenCalledTimes(2);
  });

  it('exposes the latest job response', async () => {
    const fetchJob = jest
      .fn()
      .mockResolvedValue({ jobID: 'j1', status: 'queued', queuePosition: 4 });
    const { result } = renderHook(() =>
      useJobStatus({ api: makeFakeApi(fetchJob), jobId: 'j1' })
    );

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.job.queuePosition).toBe(4);
  });

  it('resets to queued when the job id changes', async () => {
    const fetchJob = jest
      .fn()
      .mockResolvedValue({ jobID: 'j1', status: 'in-progress' });
    const { result, rerender } = renderHook(
      ({ jobId }) => useJobStatus({ api: makeFakeApi(fetchJob), jobId }),
      { initialProps: { jobId: 'j1' } }
    );

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.status).toBe('in-progress');

    rerender({ jobId: 'j2' });

    expect(result.current.status).toBe('queued');
    expect(result.current.job).toEqual({});
  });
});
