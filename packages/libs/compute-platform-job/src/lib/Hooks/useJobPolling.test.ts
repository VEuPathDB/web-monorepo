import { renderHook, act } from '@testing-library/react-hooks';
import { useJobPolling } from './useJobPolling';
import { JobStatus } from '../Service/ServiceTypes';

describe('useJobPolling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not poll when the status is already terminal', () => {
    const onPoll = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useJobPolling({ status: 'complete' as JobStatus, onPoll })
    );

    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(onPoll).not.toHaveBeenCalled();
    expect(result.current.isPolling).toBe(false);
  });

  it('polls on the 2s tier while non-terminal', async () => {
    const onPoll = jest.fn().mockResolvedValue(undefined);
    renderHook(() => useJobPolling({ status: 'queued' as JobStatus, onPoll }));

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
      useJobPolling({ status: 'in-progress' as JobStatus, onPoll })
    );

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);

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
      useJobPolling({ status: 'in-progress' as JobStatus, onPoll })
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
      ({ status }) => useJobPolling({ status, onPoll }),
      { initialProps: { status: 'in-progress' as JobStatus } }
    );

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);

    rerender({ status: 'complete' as JobStatus });

    await act(async () => {
      jest.advanceTimersByTime(60000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);
  });

  it('clears its timer on unmount', async () => {
    const onPoll = jest.fn().mockResolvedValue(undefined);
    const { unmount } = renderHook(() =>
      useJobPolling({ status: 'in-progress' as JobStatus, onPoll })
    );

    unmount();

    await act(async () => {
      jest.advanceTimersByTime(60000);
    });
    expect(onPoll).not.toHaveBeenCalled();
  });

  it('does not update state after unmount when a poll is still in flight', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    let resolvePoll: (() => void) | undefined;
    const onPoll = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolvePoll = resolve;
        })
    );
    const { unmount } = renderHook(() =>
      useJobPolling({ status: 'in-progress' as JobStatus, onPoll })
    );

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(onPoll).toHaveBeenCalledTimes(1);

    unmount();

    await act(async () => {
      resolvePoll?.();
    });

    expect(consoleError).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });

  describe('tab visibility', () => {
    afterEach(() => {
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
        useJobPolling({ status: 'in-progress' as JobStatus, onPoll })
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
        useJobPolling({ status: 'in-progress' as JobStatus, onPoll })
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

    it('does not start a concurrent poll on rapid hide/show toggling', async () => {
      let resolvePoll: (() => void) | undefined;
      const onPoll = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            resolvePoll = resolve;
          })
      );
      renderHook(() =>
        useJobPolling({ status: 'in-progress' as JobStatus, onPoll })
      );

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });
      expect(onPoll).toHaveBeenCalledTimes(1);

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
