import { renderHook, act } from '@testing-library/react-hooks';
import { useStateWithHistory } from '../StateWithHistory';

describe('useStateWithHistory', () => {

  it('should work with size = 1', () => {
    const { result } = renderHook(() => useStateWithHistory('foo', { size: 1 }));
    expect(result.current.current).toBe('foo');
    expect(result.current.canRedo).toBeFalsy();
    expect(result.current.canUndo).toBeFalsy();
    act(() => {
      result.current.setCurrent('bar');
    })
    expect(result.current.current).toBe('bar');
  });

  it('should work with size > 1', () => {
    const { result } = renderHook(() => useStateWithHistory('a', { size: 5 }));
    expect(result.current.current).toBe('a');
    act(() => {
      result.current.setCurrent('b');
      result.current.setCurrent('c');
      result.current.setCurrent('d');
      result.current.setCurrent('e');
      result.current.setCurrent('f');
    });
    expect(result.current.current).toBe('f');
    expect(result.current.canUndo).toBeTruthy();
    expect(result.current.canRedo).toBeFalsy();
    act(() => {
      result.current.undo();
      result.current.undo();
      result.current.undo();
      result.current.undo();
      result.current.undo();
      result.current.undo();
    });
    expect(result.current.current).toBe('b');
    expect(result.current.canUndo).toBeFalsy();
    expect(result.current.canRedo).toBeTruthy();
    act(() => {
      result.current.redo();
    });
    expect(result.current.current).toBe('c');
    expect(result.current.canUndo).toBeTruthy();
    expect(result.current.canRedo).toBeTruthy();
  });

  it('should allow functional state updates', () => {
    const { result } = renderHook(() => useStateWithHistory(1, { size: 2 }));
    act(() => {
      result.current.setCurrent(n => n * 3);
    });
    expect(result.current.current).toBe(3);
    act(() => {
      result.current.setCurrent(n => n * 3);
    });
    expect(result.current.current).toBe(9);
  });

  it('should allow to initialize with undefined', () => {
    const { result } = renderHook(() => useStateWithHistory<number>({ size: 2 }));
    expect(result.current.current).toBeUndefined();
    act(() => {
      result.current.setCurrent(1);
      result.current.setCurrent(2);
    });
    expect(result.current.current).toBe(2);
  })
})
