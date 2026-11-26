import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  WorkspaceContext,
  WorkspaceContextValue,
} from '../context/WorkspaceContext';
import { Filter } from '../types/filter';
import { StudyEntity } from '../types/study';
import { toStoredSpec } from './recoding';
import { useGroupCounts } from './useGroupCounts';
import { FilterDefinedGroupsSpec } from './types';

// study.ts drags in wdk-client (and jquery) for helpers unused here.
jest.mock('../hooks/study', () => ({
  isStubEntity: () => false,
  STUB_ENTITY: { id: 'stub' },
}));

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

const rootEntity = {
  id: 'e',
  idColumnName: 'e_id',
  displayName: 'E',
  description: '',
  isManyToOneWithParent: false,
  variables: [
    {
      id: 'v',
      providerLabel: 'v',
      displayName: 'V',
      type: 'string',
      dataShape: 'categorical',
      isMultiValued: false,
      vocabulary: ['a', 'b'],
    },
  ],
} as unknown as StudyEntity;

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
    studyMetadata: { id: 'study', rootEntity },
    subsettingClient: { getEntityCount },
    dataClient: { getBarplot },
  } as unknown as WorkspaceContextValue;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children?: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <WorkspaceContext.Provider value={value}>
        {children}
      </WorkspaceContext.Provider>
    </QueryClientProvider>
  );
  return { getEntityCount, getBarplot, wrapper };
}

describe('useGroupCounts', () => {
  test('requests a raw count per group and one final barplot with filters []', async () => {
    const { getEntityCount, getBarplot, wrapper } = setup();
    // Distinct filters: identical ones would share one cached request.
    const filterB = { ...filter, stringSet: ['b'] } as Filter;
    const spec = makeSpec([
      { label: 'A', filters: [filter] },
      { label: 'B', filters: [filterB] },
    ]);
    const { result, waitFor } = renderHook(() => useGroupCounts(spec), {
      wrapper,
    });
    expect(result.current.pending).toBe(true);
    await waitFor(() => result.current.pending === false, { timeout: 3000 });
    expect(getEntityCount).toHaveBeenCalledTimes(3);
    expect(getEntityCount).toHaveBeenCalledWith('study', 'e', []);
    expect(getEntityCount).toHaveBeenCalledWith('study', 'e', [filter]);
    expect(getEntityCount).toHaveBeenCalledWith('study', 'e', [filterB]);
    expect(getBarplot).toHaveBeenCalledTimes(1);
    const [app, params] = getBarplot.mock.calls[0];
    expect(app).toBe('pass');
    expect(params.filters).toEqual([]);
    expect(params.derivedVariables).toEqual([toStoredSpec(spec, [rootEntity])]);
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

  test('sends the recoder form in the barplot request when eligible', async () => {
    const { getBarplot, wrapper } = setup();
    const spec = makeSpec([
      { label: 'A', filters: [filter] },
      { label: 'B', filters: [{ ...filter, stringSet: ['b'] } as Filter] },
    ]);
    const { result, waitFor } = renderHook(() => useGroupCounts(spec), {
      wrapper,
    });
    await waitFor(() => result.current.pending === false, { timeout: 3000 });
    const stored = toStoredSpec(spec, [rootEntity]);
    expect(stored.functionName).toBe('categoricalRecoding');
    expect(getBarplot.mock.calls[0][1].derivedVariables).toEqual([stored]);
  });

  test("changing one group's filters re-requests only that group's count", async () => {
    const { getEntityCount, getBarplot, wrapper } = setup();
    const filterB = { ...filter, stringSet: ['b'] } as Filter;
    const filterC = { ...filter, stringSet: ['a', 'b'] } as Filter;
    const specFor = (second: Filter) =>
      makeSpec([
        { label: 'A', filters: [filter] },
        { label: 'B', filters: [second] },
      ]);
    let spec = specFor(filterB);
    const { result, rerender, waitFor } = renderHook(
      () => useGroupCounts(spec),
      { wrapper }
    );
    await waitFor(() => result.current.pending === false, { timeout: 3000 });
    getEntityCount.mockClear();
    getBarplot.mockClear();
    spec = specFor(filterC);
    rerender();
    await waitFor(
      () =>
        getBarplot.mock.calls.length > 0 && result.current.pending === false,
      { timeout: 3000 }
    );
    expect(getEntityCount).toHaveBeenCalledTimes(1);
    expect(getEntityCount).toHaveBeenCalledWith('study', 'e', [filterC]);
  });

  test('renaming the variable does not re-request counts or the barplot', async () => {
    const { getEntityCount, getBarplot, wrapper } = setup();
    const groups = [
      { label: 'A', filters: [filter] },
      { label: 'B', filters: [filter] },
    ];
    let spec = makeSpec(groups);
    const { result, rerender, waitFor } = renderHook(
      () => useGroupCounts(spec),
      { wrapper }
    );
    await waitFor(() => result.current.pending === false, { timeout: 3000 });
    getEntityCount.mockClear();
    getBarplot.mockClear();
    spec = { ...makeSpec(groups), displayName: 'Renamed' };
    rerender();
    await waitFor(() => result.current.pending === false, { timeout: 3000 });
    expect(result.current.final).toEqual({ A: 3, B: 2, '': 5 });
    expect(getEntityCount).not.toHaveBeenCalled();
    expect(getBarplot).not.toHaveBeenCalled();
  });

  test('requests the barplot without waiting for the raw counts', async () => {
    const { getEntityCount, getBarplot, wrapper } = setup();
    getEntityCount.mockImplementation(() => new Promise(() => {}));
    const spec = makeSpec([
      { label: 'A', filters: [filter] },
      { label: 'B', filters: [filter] },
    ]);
    const { result, waitFor } = renderHook(() => useGroupCounts(spec), {
      wrapper,
    });
    await waitFor(() => getBarplot.mock.calls.length > 0, { timeout: 3000 });
    expect(result.current.pending).toBe(true);
  });

  test('reports an error when the barplot fails', async () => {
    const { getBarplot, wrapper } = setup();
    const failure = new Error('boom');
    getBarplot.mockRejectedValue(failure);
    const spec = makeSpec([
      { label: 'A', filters: [filter] },
      { label: 'B', filters: [filter] },
    ]);
    const { result, waitFor } = renderHook(() => useGroupCounts(spec), {
      wrapper,
    });
    await waitFor(() => result.current.pending === false, { timeout: 3000 });
    expect(result.current.error).toBe(failure);
    expect(result.current.final).toBeUndefined();
  });
});
