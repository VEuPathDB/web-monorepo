import { renderHook } from '@testing-library/react-hooks';
import { useLatestDefined } from './useLatestDefined';

describe('useLatestDefined', () => {
  it('keeps the last defined value while the current one is undefined', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number | undefined }) => useLatestDefined(value),
      { initialProps: { value: undefined } as { value: number | undefined } }
    );
    expect(result.current).toBeUndefined();
    rerender({ value: 1234 });
    expect(result.current).toBe(1234);
    rerender({ value: undefined });
    expect(result.current).toBe(1234);
    rerender({ value: 7 });
    expect(result.current).toBe(7);
  });
});
