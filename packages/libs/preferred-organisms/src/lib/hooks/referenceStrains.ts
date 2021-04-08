import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { memoize } from 'lodash';

import { WdkDepdendenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';

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
