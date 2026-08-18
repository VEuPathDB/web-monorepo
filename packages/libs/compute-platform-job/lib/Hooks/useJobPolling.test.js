var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
import { renderHook, act } from '@testing-library/react-hooks';
import { useJobPolling } from './useJobPolling';
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
      useJobPolling({ status: 'complete', onPoll })
    );
    act(() => {
      jest.advanceTimersByTime(60000);
    });
    expect(onPoll).not.toHaveBeenCalled();
    expect(result.current.isPolling).toBe(false);
  });
  it('polls on the 2s tier while non-terminal', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const onPoll = jest.fn().mockResolvedValue(undefined);
      renderHook(() => useJobPolling({ status: 'queued', onPoll }));
      expect(onPoll).not.toHaveBeenCalled();
      yield act(() =>
        __awaiter(void 0, void 0, void 0, function* () {
          jest.advanceTimersByTime(2000);
        })
      );
      expect(onPoll).toHaveBeenCalledTimes(1);
      yield act(() =>
        __awaiter(void 0, void 0, void 0, function* () {
          jest.advanceTimersByTime(2000);
        })
      );
      expect(onPoll).toHaveBeenCalledTimes(2);
    }));
  it('never overlaps requests: the next tick waits for the current one', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      let resolvePoll;
      const onPoll = jest.fn(
        () =>
          new Promise((resolve) => {
            resolvePoll = resolve;
          })
      );
      renderHook(() => useJobPolling({ status: 'in-progress', onPoll }));
      yield act(() =>
        __awaiter(void 0, void 0, void 0, function* () {
          jest.advanceTimersByTime(2000);
        })
      );
      expect(onPoll).toHaveBeenCalledTimes(1);
      yield act(() =>
        __awaiter(void 0, void 0, void 0, function* () {
          jest.advanceTimersByTime(10000);
        })
      );
      expect(onPoll).toHaveBeenCalledTimes(1);
      yield act(() =>
        __awaiter(void 0, void 0, void 0, function* () {
          resolvePoll === null || resolvePoll === void 0
            ? void 0
            : resolvePoll();
        })
      );
      yield act(() =>
        __awaiter(void 0, void 0, void 0, function* () {
          jest.advanceTimersByTime(2000);
        })
      );
      expect(onPoll).toHaveBeenCalledTimes(2);
    }));
  it('keeps polling after a failed request', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const onPoll = jest
        .fn()
        .mockRejectedValueOnce(new Error('network'))
        .mockResolvedValue(undefined);
      renderHook(() => useJobPolling({ status: 'in-progress', onPoll }));
      yield act(() =>
        __awaiter(void 0, void 0, void 0, function* () {
          jest.advanceTimersByTime(2000);
        })
      );
      expect(onPoll).toHaveBeenCalledTimes(1);
      yield act(() =>
        __awaiter(void 0, void 0, void 0, function* () {
          jest.advanceTimersByTime(2000);
        })
      );
      expect(onPoll).toHaveBeenCalledTimes(2);
    }));
  it('stops scheduling once the status becomes terminal', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const onPoll = jest.fn().mockResolvedValue(undefined);
      const { rerender } = renderHook(
        ({ status }) => useJobPolling({ status, onPoll }),
        { initialProps: { status: 'in-progress' } }
      );
      yield act(() =>
        __awaiter(void 0, void 0, void 0, function* () {
          jest.advanceTimersByTime(2000);
        })
      );
      expect(onPoll).toHaveBeenCalledTimes(1);
      rerender({ status: 'complete' });
      yield act(() =>
        __awaiter(void 0, void 0, void 0, function* () {
          jest.advanceTimersByTime(60000);
        })
      );
      expect(onPoll).toHaveBeenCalledTimes(1);
    }));
  it('clears its timer on unmount', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const onPoll = jest.fn().mockResolvedValue(undefined);
      const { unmount } = renderHook(() =>
        useJobPolling({ status: 'in-progress', onPoll })
      );
      unmount();
      yield act(() =>
        __awaiter(void 0, void 0, void 0, function* () {
          jest.advanceTimersByTime(60000);
        })
      );
      expect(onPoll).not.toHaveBeenCalled();
    }));
  it('does not update state after unmount when a poll is still in flight', () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      let resolvePoll;
      const onPoll = jest.fn(
        () =>
          new Promise((resolve) => {
            resolvePoll = resolve;
          })
      );
      const { unmount } = renderHook(() =>
        useJobPolling({ status: 'in-progress', onPoll })
      );
      yield act(() =>
        __awaiter(void 0, void 0, void 0, function* () {
          jest.advanceTimersByTime(2000);
        })
      );
      expect(onPoll).toHaveBeenCalledTimes(1);
      unmount();
      yield act(() =>
        __awaiter(void 0, void 0, void 0, function* () {
          resolvePoll === null || resolvePoll === void 0
            ? void 0
            : resolvePoll();
        })
      );
      expect(consoleError).not.toHaveBeenCalled();
      consoleError.mockRestore();
    }));
  describe('tab visibility', () => {
    afterEach(() => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        value: false,
      });
    });
    const setHidden = (hidden) => {
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        value: hidden,
      });
    };
    const fireVisibilityChange = () => {
      document.dispatchEvent(new Event('visibilitychange'));
    };
    it('pauses while hidden', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        setHidden(true);
        const onPoll = jest.fn().mockResolvedValue(undefined);
        renderHook(() => useJobPolling({ status: 'in-progress', onPoll }));
        yield act(() =>
          __awaiter(void 0, void 0, void 0, function* () {
            jest.advanceTimersByTime(60000);
          })
        );
        expect(onPoll).not.toHaveBeenCalled();
      }));
    it('polls immediately on return to visibility', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        setHidden(true);
        const onPoll = jest.fn().mockResolvedValue(undefined);
        renderHook(() => useJobPolling({ status: 'in-progress', onPoll }));
        yield act(() =>
          __awaiter(void 0, void 0, void 0, function* () {
            jest.advanceTimersByTime(60000);
          })
        );
        expect(onPoll).not.toHaveBeenCalled();
        setHidden(false);
        yield act(() =>
          __awaiter(void 0, void 0, void 0, function* () {
            fireVisibilityChange();
          })
        );
        expect(onPoll).toHaveBeenCalledTimes(1);
      }));
    it('does not start a concurrent poll on rapid hide/show toggling', () =>
      __awaiter(void 0, void 0, void 0, function* () {
        let resolvePoll;
        const onPoll = jest.fn(
          () =>
            new Promise((resolve) => {
              resolvePoll = resolve;
            })
        );
        renderHook(() => useJobPolling({ status: 'in-progress', onPoll }));
        yield act(() =>
          __awaiter(void 0, void 0, void 0, function* () {
            jest.advanceTimersByTime(2000);
          })
        );
        expect(onPoll).toHaveBeenCalledTimes(1);
        yield act(() =>
          __awaiter(void 0, void 0, void 0, function* () {
            setHidden(true);
            fireVisibilityChange();
            setHidden(false);
            fireVisibilityChange();
            setHidden(true);
            fireVisibilityChange();
            setHidden(false);
            fireVisibilityChange();
          })
        );
        expect(onPoll).toHaveBeenCalledTimes(1);
        yield act(() =>
          __awaiter(void 0, void 0, void 0, function* () {
            resolvePoll === null || resolvePoll === void 0
              ? void 0
              : resolvePoll();
          })
        );
        expect(onPoll).toHaveBeenCalledTimes(1);
      }));
  });
});
//# sourceMappingURL=useJobPolling.test.js.map
