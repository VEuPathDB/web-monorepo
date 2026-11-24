import { renderHook, act } from '@testing-library/react-hooks';
import { AnalysisState } from '../hooks/analysis';
import { Filter } from '../types/filter';
import { useGroupFilterAnalysisState } from './useGroupFilterAnalysisState';

const f1 = {
  type: 'stringSet',
  entityId: 'e',
  variableId: 'v',
  stringSet: ['a'],
} as Filter;
const f2 = { ...f1, stringSet: ['b'] } as Filter;

const base = {
  analysis: {
    displayName: 'x',
    descriptor: {
      subset: { descriptor: [f2], uiSettings: { other: {} } },
      computations: [],
      derivedVariables: [],
      starredVariables: [],
    },
  },
  setStarredVariables: jest.fn(),
  setFilters: jest.fn(),
  setVariableUISettings: jest.fn(),
} as unknown as AnalysisState;

const group = { filters: [f1], uiSettings: { k: { a: 1 } } };

describe('useGroupFilterAnalysisState', () => {
  test('adapter exposes the group filters as the subset', () => {
    const { result } = renderHook(() =>
      useGroupFilterAnalysisState(base, group, jest.fn())
    );
    const subset = result.current.analysis?.descriptor.subset;
    expect(subset?.descriptor).toEqual([f1]);
    expect(subset?.uiSettings).toEqual(group.uiSettings);
  });

  test('adapter setFilters with an updater function calls onChange with the result', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useGroupFilterAnalysisState(base, group, onChange)
    );
    act(() => result.current.setFilters((fs) => [...fs, f2]));
    expect(onChange).toHaveBeenCalledWith({
      filters: [f1, f2],
      uiSettings: group.uiSettings,
    });
    act(() => result.current.setVariableUISettings({ z: {} }));
    expect(onChange).toHaveBeenLastCalledWith({
      filters: [f1],
      uiSettings: { z: {} },
    });
    expect(base.setFilters).not.toHaveBeenCalled();
  });

  test('adapter passes other members through unchanged', () => {
    const { result } = renderHook(() =>
      useGroupFilterAnalysisState(base, group, jest.fn())
    );
    expect(result.current.setStarredVariables).toBe(base.setStarredVariables);
    expect(result.current.analysis?.descriptor.computations).toBe(
      base.analysis?.descriptor.computations
    );
  });
});
