import { renderHook } from '@testing-library/react-hooks';
import { useInterval } from '../../src/hooks/interval';

jest.useFakeTimers();

describe('useInterval', () => {

  it('should work with a single callback', () => {
    const callback = jest.fn();
    renderHook(() => useInterval(callback, 10));
    jest.advanceTimersByTime(55);
    expect(callback).toHaveBeenCalledTimes(5);
  });

  it('should work when callback is updated', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const { rerender } = renderHook(({ callback }) => useInterval(callback, 10), {
      initialProps: { callback: callback1 }
    });
    jest.advanceTimersByTime(20);
    rerender({ callback: callback2 });
    jest.advanceTimersByTime(10);
    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('should work when interval time is updated', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(({ intervalTime }) => useInterval(callback, intervalTime), {
      initialProps: { intervalTime: 10 }
    });
    jest.advanceTimersByTime(55); // 5 times
    rerender({ intervalTime: 20 });
    jest.advanceTimersByTime(55); // 2 times
    expect(callback).toHaveBeenCalledTimes(7);
  });

});


