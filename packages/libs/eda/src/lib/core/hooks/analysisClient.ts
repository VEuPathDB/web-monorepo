import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDepdendenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';

import { AnalysisClient } from '../api/analysis-api';

export function useConfiguredAnalysisClient(userServiceUrl: string) {
  const { wdkService } = useNonNullableContext(WdkDepdendenciesContext);
  return AnalysisClient.getClient(userServiceUrl, wdkService);
}
