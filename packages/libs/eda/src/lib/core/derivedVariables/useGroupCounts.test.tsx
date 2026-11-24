import { renderHook } from '@testing-library/react-hooks';
import { ReactNode } from 'react';
import {
  WorkspaceContext,
  WorkspaceContextValue,
} from '../context/WorkspaceContext';
import { Filter } from '../types/filter';
import { useGroupCounts } from './useGroupCounts';
import { FilterDefinedGroupsSpec } from './types';

const filter = {
  type: 'stringSet',
  entityId: 'e',
  variableId: 'v',
  stringSet: ['a'],
} as Filter;

function makeSpec(
  groups: FilterDefinedGroupsSpec['config']['groups']
): FilterDefinedGroupsSpec {
  return {
    entityId: 'e',
    variableId: 'dv1',
    functionName: 'filterDefinedGroups',
    displayName: 'G',
    config: { groups },
  };
}

function setup() {
  const getEntityCount = jest
    .fn()
    .mockImplementation((_s, _e, filters) =>
      Promise.resolve({ count: filters.length === 0 ? 10 : 7 })
    );
  const getBarplot = jest.fn().mockResolvedValue({
    barplot: {
      config: { variables: [] },
      data: [{ label: ['A', 'B'], value: [3, 2] }],
    },
  });
  const value = {
    studyMetadata: { id: 'study' },
    subsettingClient: { getEntityCount },
    dataClient: { getBarplot },
  } as unknown as WorkspaceContextValue;
  const wrapper = ({ children }: { children?: ReactNode }) => (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
  return { getEntityCount, getBarplot, wrapper };
}

describe('useGroupCounts', () => {
  test('requests a raw count per group and one final barplot with filters []', async () => {
    const { getEntityCount, getBarplot, wrapper } = setup();
    const spec = makeSpec([
      { label: 'A', filters: [filter] },
      { label: 'B', filters: [filter] },
    ]);
    const { result, waitFor } = renderHook(() => useGroupCounts(spec), {
      wrapper,
    });
    expect(result.current.pending).toBe(true);
    await waitFor(() => result.current.pending === false, { timeout: 3000 });
    expect(getEntityCount).toHaveBeenCalledTimes(3);
    expect(getEntityCount).toHaveBeenCalledWith('study', 'e', []);
    expect(getEntityCount).toHaveBeenCalledWith('study', 'e', [filter]);
    expect(getBarplot).toHaveBeenCalledTimes(1);
    const [app, params] = getBarplot.mock.calls[0];
    expect(app).toBe('pass');
    expect(params.filters).toEqual([]);
    expect(params.derivedVariables).toEqual([spec]);
    expect(params.config).toMatchObject({
      valueSpec: 'count',
      showMissingness: 'TRUE',
      xAxisVariable: { entityId: 'e', variableId: 'dv1' },
    });
    expect(result.current.raw).toEqual([7, 7]);
    expect(result.current.final).toEqual({ A: 3, B: 2, '': 5 });
  });

  test('skips the barplot for an invalid spec and the count for an empty group', async () => {
    const { getEntityCount, getBarplot, wrapper } = setup();
    const spec = makeSpec([
      { label: 'A', filters: [filter] },
      { label: 'B', filters: [] },
    ]);
    const { result, waitFor } = renderHook(() => useGroupCounts(spec), {
      wrapper,
    });
    await waitFor(() => result.current.pending === false, { timeout: 3000 });
    expect(getEntityCount).toHaveBeenCalledTimes(2);
    expect(getBarplot).not.toHaveBeenCalled();
    expect(result.current.raw).toEqual([7, 0]);
    expect(result.current.final).toBeUndefined();
  });

  test('omits the empty-key level when every record is matched', async () => {
    const { getBarplot, wrapper } = setup();
    getBarplot.mockResolvedValue({
      barplot: {
        config: { variables: [] },
        data: [{ label: ['A', 'B'], value: [6, 4] }],
      },
    });
    const spec = makeSpec([
      { label: 'A', filters: [filter] },
      { label: 'B', filters: [filter] },
    ]);
    const { result, waitFor } = renderHook(() => useGroupCounts(spec), {
      wrapper,
    });
    await waitFor(() => result.current.pending === false, { timeout: 3000 });
    expect(result.current.final).toEqual({ A: 6, B: 4 });
  });
});
