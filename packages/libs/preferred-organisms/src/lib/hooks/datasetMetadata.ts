import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { WdkDepdendenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { makeDatasetMetadataRecoilState } from '../utils/datasetMetadata';

export function useDatasetMetadata() {
  const { datasetMetadata } = useDatasetMetadataRecoilState();

  return useRecoilValue(datasetMetadata);
}

export function useDatasetMetadataRecoilState() {
  const wdkDependencies = useContext(WdkDepdendenciesContext);

  return makeDatasetMetadataRecoilState(wdkDependencies);
}
