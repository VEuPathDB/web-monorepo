import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { useCachedPromise, useCachedPromises } from './cachedPromise';
import { PromiseHookState } from './promise';
import { ReactNode } from 'react';
import { DerivedVariableSpecsContext } from '../derivedVariables/DerivedVariableSpecsContext';
import { DerivedVariableSpec } from '../types/analysis';

const mkSpec = (variableId: string, label = 'a'): DerivedVariableSpec => ({
  entityId: 'e',
  variableId,
  functionName: 'filterDefinedGroups',
  displayName: variableId,
  config: { label },
});

async function cacheKey(specs: DerivedVariableSpec[], queryKey: [unknown]) {
  const queryClient = new QueryClient();
  let value: number | undefined;
  function Probe() {
    value = useCachedPromise(() => Promise.resolve(1), queryKey).value;
    return null;
  }
  render(
    <QueryClientProvider client={queryClient}>
      <DerivedVariableSpecsContext.Provider value={specs}>
        <Probe />
      </DerivedVariableSpecsContext.Provider>
    </QueryClientProvider>
  );
  await waitFor(() => expect(value).toBe(1));
  return queryClient.getQueryCache().getAll()[0].queryKey;
}

const ref = { entityId: 'e', variableId: 'A' };

describe('useCachedPromise with derived variable specs', () => {
  test('key changes when a referenced spec changes', async () => {
    const k1 = await cacheKey([mkSpec('A', 'one')], [{ overlay: ref }]);
    const k2 = await cacheKey([mkSpec('A', 'two')], [{ overlay: ref }]);
    expect(k1).not.toEqual(k2);
  });

  test('key is unchanged for an unreferenced spec, and has no extra part', async () => {
    const k1 = await cacheKey([mkSpec('B', 'one')], [{ overlay: ref }]);
    const k2 = await cacheKey([mkSpec('B', 'two')], [{ overlay: ref }]);
    const k0 = await cacheKey([], [{ overlay: ref }]);
    expect(k1).toEqual(k2);
    expect(k1).toEqual(k0);
    expect(k0).toEqual(['useCachedPromise', { overlay: ref }]);
  });
});

describe('useCachedPromises', () => {
  const newClient = () =>
    new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapperFor =
    (client: QueryClient) =>
    ({ children }: { children?: ReactNode }) =>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>;

  test('useCachedPromises returns one state per entry, in order', async () => {
    let states: PromiseHookState<string>[] = [];
    function Probe() {
      states = useCachedPromises([
        { task: () => Promise.resolve('x'), queryKey: ['k', 1] },
        { task: () => Promise.resolve('y'), queryKey: ['k', 2] },
      ]);
      return null;
    }
    render(<Probe />, { wrapper: wrapperFor(newClient()) });
    await waitFor(() => expect(states.map((s) => s.value)).toEqual(['x', 'y']));
    expect(states.map((s) => s.pending)).toEqual([false, false]);
  });

  test('useCachedPromises disables only the entry with a null key part', async () => {
    const skipped = jest.fn().mockResolvedValue('no');
    let states: PromiseHookState<string>[] = [];
    function Probe() {
      states = useCachedPromises([
        { task: skipped, queryKey: ['k', null] },
        { task: () => Promise.resolve('y'), queryKey: ['k', 2] },
      ]);
      return null;
    }
    render(<Probe />, { wrapper: wrapperFor(newClient()) });
    await waitFor(() => expect(states[1].value).toBe('y'));
    expect(states[0]).toEqual({
      value: undefined,
      pending: false,
      error: null,
    });
    expect(skipped).not.toHaveBeenCalled();
  });

  test('useCachedPromises shares cache with useCachedPromise for the same key', async () => {
    const task = jest.fn().mockResolvedValue(5);
    let plural: PromiseHookState<number>[] = [];
    let singular: PromiseHookState<number> | undefined;
    function Probe() {
      plural = useCachedPromises([{ task, queryKey: ['shared'] }]);
      singular = useCachedPromise(task, ['shared']);
      return null;
    }
    render(<Probe />, { wrapper: wrapperFor(newClient()) });
    await waitFor(() => expect(plural[0].value).toBe(5));
    await waitFor(() => expect(singular?.value).toBe(5));
    expect(task).toHaveBeenCalledTimes(1);
  });
});
