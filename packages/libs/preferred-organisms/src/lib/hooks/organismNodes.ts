import { useMemo } from 'react';

import {
  makeOrganismSearchPredicate,
  makeRenderOrganismNode,
} from '../utils/organismNodes';

export function useRenderOrganismNode(
  referenceStrains: Set<string> | undefined,
  newOrganisms: Set<string> | undefined
) {
  return useMemo(
    () => makeRenderOrganismNode({ newOrganisms, referenceStrains }),
    [newOrganisms, referenceStrains]
  );
}

export function useOrganismSearchPredicate(referenceStrains?: Set<string>) {
  return useMemo(() => makeOrganismSearchPredicate(referenceStrains), [
    referenceStrains,
  ]);
}
