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

  describe('tab visibility', () => {
    afterEach(() => {
      // Restore document.hidden to its default so cases don't leak into
      // each other.
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        value: false,
      });
    });

    const setHidden = (hidden: boolean) => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        value: hidden,
      });
    };

    const fireVisibilityChange = () => {
      document.dispatchEvent(new Event('visibilitychange'));
    };

    it('pauses while hidden', async () => {
      setHidden(true);
      const onPoll = jest.fn().mockResolvedValue(undefined);
      renderHook(() =>
        useDatasetPolling({ status: RUNNING, projectId: PROJECT, onPoll })
      );

      await act(async () => {
        jest.advanceTimersByTime(60000);
      });

      expect(onPoll).not.toHaveBeenCalled();
    });

    it('polls immediately on return to visibility', async () => {
      setHidden(true);
      const onPoll = jest.fn().mockResolvedValue(undefined);
      renderHook(() =>
        useDatasetPolling({ status: RUNNING, projectId: PROJECT, onPoll })
      );

      await act(async () => {
        jest.advanceTimersByTime(60000);
      });
      expect(onPoll).not.toHaveBeenCalled();

      setHidden(false);
      await act(async () => {
        fireVisibilityChange();
      });

      expect(onPoll).toHaveBeenCalledTimes(1);
    });

    it('resets backoff to the fastest tier on return to visibility', async () => {
      const onPoll = jest.fn().mockResolvedValue(undefined);
      renderHook(() =>
        useDatasetPolling({ status: RUNNING, projectId: PROJECT, onPoll })
      );

      // Advance far enough to reach the 15s steady tier (throughPollCount
      // for the 5s tier is 11, so poll past that).
      for (let i = 0; i < 12; i++) {
        await act(async () => {
          jest.advanceTimersByTime(5000);
        });
      }
      const callsBeforeHiding = onPoll.mock.calls.length;

      setHidden(true);
      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      setHidden(false);
      await act(async () => {
        fireVisibilityChange();
      });
      expect(onPoll).toHaveBeenCalledTimes(callsBeforeHiding + 1);

      // Next gap should be the fast 2s tier, not the 15s steady tier.
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });
      expect(onPoll).toHaveBeenCalledTimes(callsBeforeHiding + 2);
    });

    it('does not start a concurrent poll on rapid hide/show toggling', async () => {
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

      // Kick off the first (in-flight, never-resolving-yet) poll.
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });
      expect(onPoll).toHaveBeenCalledTimes(1);

      // Toggle visibility rapidly while that request is still pending.
      await act(async () => {
        setHidden(true);
        fireVisibilityChange();
        setHidden(false);
        fireVisibilityChange();
        setHidden(true);
        fireVisibilityChange();
        setHidden(false);
        fireVisibilityChange();
      });

      expect(onPoll).toHaveBeenCalledTimes(1);

      await act(async () => {
        resolvePoll?.();
      });

      expect(onPoll).toHaveBeenCalledTimes(1);
    });
  });
});
