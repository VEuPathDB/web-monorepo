import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { WdkDepdendenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';

import { makeReferenceStrainsRecoilState } from '../utils/referenceStrains';

export function useReferenceStrains() {
  const { referenceStrains } = useReferenceStrainsRecoilState();

  return useRecoilValue(referenceStrains);
}

export function useReferenceStrainsRecoilState() {
  const wdkDependencies = useContext(WdkDepdendenciesContext);

  return makeReferenceStrainsRecoilState(wdkDependencies);
}
