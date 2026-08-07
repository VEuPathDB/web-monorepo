import { renderHook, act } from '@testing-library/react-hooks';
import { DatasetStatusInfo } from '../Service';
import { useDatasetPolling } from './useDatasetPolling';

const PROJECT = 'PlasmoDB';

const RUNNING = {
  upload: { status: 'success' },
  import: { status: 'in-progress' },
} as DatasetStatusInfo;

const INSTALLED = {
  upload: { status: 'success' },
  import: { status: 'complete' },
  install: [
    {
      installTarget: PROJECT,
      meta: { status: 'complete' },
      data: { status: 'complete' },
    },
  ],
} as DatasetStatusInfo;

describe('useDatasetPolling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not poll when the status is already terminal', () => {
    const onPoll = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useDatasetPolling({ status: INSTALLED, projectId: PROJECT, onPoll })
    );

    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(onPoll).not.toHaveBeenCalled();
    expect(result.current.isPolling).toBe(false);
  });

  it('polls on the 2s tier while non-terminal', async () => {
    const onPoll = jest.fn().mockResolvedValue(undefined);
    renderHook(() =>
      useDatasetPolling({ status: RUNNING, projectId: PROJECT, onPoll })
    );

    expect(onPoll).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(onPoll).toHaveBeenCalledTimes(2);
  });

  it('never overlaps requests: the next tick waits for the current one', async () => {
    let resolvePoll: (() => void) | undefined;
    const onPoll = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolvePoll = resolve;
        })
    );
    renderHook(() =>
      useDatasetPolling({ status: RUNNING, projectId: PROJECT, onPoll })
    );

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);

    // Time passes, but the first request has not resolved.
    await act(async () => {
      jest.advanceTimersByTime(10000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolvePoll?.();
    });
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(onPoll).toHaveBeenCalledTimes(2);
  });

  it('keeps polling after a failed request', async () => {
    const onPoll = jest
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue(undefined);
    renderHook(() =>
      useDatasetPolling({ status: RUNNING, projectId: PROJECT, onPoll })
    );

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(onPoll).toHaveBeenCalledTimes(2);
  });

  it('stops scheduling once the status becomes terminal', async () => {
    const onPoll = jest.fn().mockResolvedValue(undefined);
    const { rerender } = renderHook(
      ({ status }) => useDatasetPolling({ status, projectId: PROJECT, onPoll }),
      { initialProps: { status: RUNNING } }
    );

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);

    rerender({ status: INSTALLED });

    await act(async () => {
      jest.advanceTimersByTime(60000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);
  });

  it('clears its timer on unmount', async () => {
    const onPoll = jest.fn().mockResolvedValue(undefined);
    const { unmount } = renderHook(() =>
      useDatasetPolling({ status: RUNNING, projectId: PROJECT, onPoll })
    );

    unmount();

    await act(async () => {
      jest.advanceTimersByTime(60000);
    });
    expect(onPoll).not.toHaveBeenCalled();
  });
});
