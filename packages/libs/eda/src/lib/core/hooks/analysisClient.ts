import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDepdendenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { mockAnalysisStore } from '../../workspace/Mocks';

import { AnalysisClient } from '../api/analysis-api';

export function useConfiguredAnalysisClient(userServiceUrl: string) {
  /* FIXME Uncomment this when the backend is updated with the correct data table settings format
  const { wdkService } = useNonNullableContext(WdkDepdendenciesContext);

  return AnalysisClient.getClient(userServiceUrl, wdkService);
  */
  return mockAnalysisStore;
}
