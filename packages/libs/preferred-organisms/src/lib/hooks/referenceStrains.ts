import { useContext, useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { memoize } from 'lodash';

import { WdkDepdendenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';

import { makeRenderNode, makeSearchPredicate } from '../utils/configTrees';
import { makeReferenceStrainsRecoilState } from '../utils/referenceStrains';

const memoizedReferenceStrainsRecoilStateMaker = memoize(
  makeReferenceStrainsRecoilState
);

export function useReferenceStrains() {
  const { referenceStrains } = useReferenceStrainsRecoilState();

  return useRecoilValue(referenceStrains);
}

export function useReferenceStrainsRecoilState() {
  const wdkDependencies = useContext(WdkDepdendenciesContext);

  return memoizedReferenceStrainsRecoilStateMaker(wdkDependencies);
}

export function useRenderOrganismNode(
  referenceStrains: Set<string>,
  shouldHighlightReferenceNodes: boolean
) {
  return useMemo(
    () => makeRenderNode(referenceStrains, shouldHighlightReferenceNodes),
    [referenceStrains, shouldHighlightReferenceNodes]
  );
}

export function useOrganismSearchPredicate(
  referenceStrains: Set<string>,
  shouldHighlightReferenceNodes: boolean
) {
  return useMemo(
    () => makeSearchPredicate(referenceStrains, shouldHighlightReferenceNodes),
    [referenceStrains, shouldHighlightReferenceNodes]
  );
}
