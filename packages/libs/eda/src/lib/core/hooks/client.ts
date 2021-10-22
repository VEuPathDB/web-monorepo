import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDepdendenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useMemo } from 'react';
import { AnalysisClient } from '../api/analysis-api';
import { DataClient } from '../api/data-api';
import { SubsettingClient } from '../api/subsetting-api';

function useWdkServiceContext() {
  const { wdkService } = useNonNullableContext(WdkDepdendenciesContext);
  return wdkService;
}

export function useConfiguredAnalysisClient(baseUrl: string) {
  const wdkService = useWdkServiceContext();
  return useMemo(() => new AnalysisClient({ baseUrl }, wdkService), [
    baseUrl,
    wdkService,
  ]);
}

export function useConfiguredDataClient(baseUrl: string) {
  const wdkService = useWdkServiceContext();
  return useMemo(() => new DataClient({ baseUrl }, wdkService), [
    baseUrl,
    wdkService,
  ]);
}

export function useConfiguredSubsettingClient(baseUrl: string) {
  const wdkService = useWdkServiceContext();
  return useMemo(() => new SubsettingClient({ baseUrl }, wdkService), [
    baseUrl,
    wdkService,
  ]);
}
