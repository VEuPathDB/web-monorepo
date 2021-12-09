import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { makeOrganismMetadataRecoilState } from '../utils/organismMetadata';

export function useOrganismMetadata() {
  const { organismMetadata } = useOrganismMetadataRecoilState();

  return useRecoilValue(organismMetadata);
}

export function useOrganismMetadataRecoilState() {
  const wdkDependencies = useContext(WdkDependenciesContext);

  return makeOrganismMetadataRecoilState(wdkDependencies);
}
