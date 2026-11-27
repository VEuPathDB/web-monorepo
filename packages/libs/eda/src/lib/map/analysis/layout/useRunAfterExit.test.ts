import { renderHook } from '@testing-library/react-hooks';
import { useRunAfterExit } from './useRunAfterExit';

describe('useRunAfterExit', () => {
  it('runs a scheduled action once the exit transition ends, not before', () => {
    const action = jest.fn();
    const { result } = renderHook(() => useRunAfterExit());
    result.current.schedule(action);
    expect(action).not.toHaveBeenCalled();
    result.current.onExited();
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('runs it only once, and does nothing when nothing is scheduled', () => {
    const action = jest.fn();
    const { result } = renderHook(() => useRunAfterExit());
    result.current.onExited();
    result.current.schedule(action);
    result.current.onExited();
    result.current.onExited();
    expect(action).toHaveBeenCalledTimes(1);
  });
});
