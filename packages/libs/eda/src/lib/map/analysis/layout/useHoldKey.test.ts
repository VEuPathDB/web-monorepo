import { act, renderHook } from '@testing-library/react-hooks';
import { useHoldKey } from './useHoldKey';

function press(type: 'keydown' | 'keyup', key: string, init = {}) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent(type, { key, ...init }));
  });
}

describe('useHoldKey', () => {
  it('is true only while the key is held', () => {
    const { result } = renderHook(() => useHoldKey('h'));
    expect(result.current).toBe(false);
    press('keydown', 'h');
    expect(result.current).toBe(true);
    press('keydown', 'h', { repeat: true });
    expect(result.current).toBe(true);
    press('keyup', 'h');
    expect(result.current).toBe(false);
  });

  it('accepts either case (e.g. with Shift or Caps Lock)', () => {
    const { result } = renderHook(() => useHoldKey('h'));
    press('keydown', 'H');
    expect(result.current).toBe(true);
    press('keyup', 'H');
    expect(result.current).toBe(false);
  });

  it('ignores other keys and Ctrl/Cmd/Alt combinations', () => {
    const { result } = renderHook(() => useHoldKey('h'));
    press('keydown', 'g');
    press('keydown', 'h', { ctrlKey: true });
    press('keydown', 'h', { metaKey: true });
    press('keydown', 'h', { altKey: true });
    expect(result.current).toBe(false);
  });

  it('ignores typing in form fields', () => {
    const { result } = renderHook(() => useHoldKey('h'));
    const input = document.createElement('input');
    document.body.appendChild(input);
    act(() => {
      input.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'h', bubbles: true })
      );
    });
    expect(result.current).toBe(false);
    input.remove();
  });

  it('cannot get stuck: releases when the window loses focus', () => {
    const { result } = renderHook(() => useHoldKey('h'));
    press('keydown', 'h');
    expect(result.current).toBe(true);
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    expect(result.current).toBe(false);
  });

  it('cannot get stuck: releases when the tab is hidden', () => {
    const { result } = renderHook(() => useHoldKey('h'));
    press('keydown', 'h');
    const visibility = jest
      .spyOn(document, 'visibilityState', 'get')
      .mockReturnValue('hidden');
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current).toBe(false);
    visibility.mockRestore();
  });
});
