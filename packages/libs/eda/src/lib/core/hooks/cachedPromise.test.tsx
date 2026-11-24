import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { useCachedPromise } from './cachedPromise';
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
