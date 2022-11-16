import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useMemo } from 'react';
import { AnalysisClient } from '../api/AnalysisClient';
import { ComputeClient } from '../api/ComputeClient';
import DataClient from '../api/DataClient';
import { DownloadClient } from '../api/DownloadClient';
import SubsettingClient from '../api/SubsettingClient';

function useWdkServiceContext() {
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);
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

export function useConfiguredDownloadClient(baseUrl: string) {
  const wdkService = useWdkServiceContext();
  return useMemo(() => new DownloadClient({ baseUrl }, wdkService), [
    baseUrl,
    wdkService,
  ]);
}

export function useConfiguredComputeClient(baseUrl: string) {
  const wdkService = useWdkServiceContext();
  return useMemo(() => new ComputeClient({ baseUrl }, wdkService), [
    baseUrl,
    wdkService,
  ]);
}
