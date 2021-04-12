import { useMemo } from 'react';

import {
  makeOrganismSearchPredicate,
  makeRenderOrganismNode,
} from '../utils/organismNodes';

export function useRenderOrganismNode(
  referenceStrains?: Set<string>,
  newOrganisms?: Set<string>
) {
  return useMemo(
    () => makeRenderOrganismNode({ newOrganisms, referenceStrains }),
    [newOrganisms, referenceStrains]
  );
}

export function useOrganismSearchPredicate(
  referenceStrains?: Set<string>,
  newOrganisms?: Set<string>
) {
  return useMemo(
    () => makeOrganismSearchPredicate(referenceStrains, newOrganisms),
    [referenceStrains, newOrganisms]
  );
}
