import { renderHook } from '@testing-library/react-hooks';
import { usePromise } from '../../hooks/usePromise';

jest.useFakeTimers();

function delay<T>(value: T, time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time, value);
  });
}

function resolve() {
  return Promise.resolve(10);
}

function reject() {
  return Promise.reject('error');
}

describe('usePromise', () => {

  it('should handle resolve', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePromise(resolve));
    expect(result.current.pending).toBe(true);
    await waitForNextUpdate();
    expect(result.current.value).toBe(10);
    expect(result.current.error).toBeUndefined();
    expect(result.current.pending).toBe(false);
  });

  it('should handle reject', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePromise(reject));
    expect(result.current.pending).toBe(true);
    await waitForNextUpdate();
    expect(result.current.value).toBeUndefined();
    expect(result.current.error).toBe('error');
    expect(result.current.pending).toBe(false);
  });

  it('should ignore old promise', async () => {
    const { result, waitForNextUpdate, rerender } = renderHook(({ callback }) => usePromise(callback), {
      initialProps: { callback: () => delay('one', 20) }
    });
    jest.advanceTimersByTime(10);
    rerender({ callback: () => delay('two', 30) });
    jest.advanceTimersByTime(50);
    await waitForNextUpdate();
    expect(result.current.value).toBe('two');
  });

});
