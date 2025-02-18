import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
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
  return AnalysisClient.getClient(baseUrl, wdkService);
}

export function useConfiguredDataClient(baseUrl: string) {
  const wdkService = useWdkServiceContext();
  return DataClient.getClient(baseUrl, wdkService);
}

export function useConfiguredSubsettingClient(baseUrl: string) {
  const wdkService = useWdkServiceContext();
  return SubsettingClient.getClient(baseUrl, wdkService);
}

export function useConfiguredDownloadClient(baseUrl: string) {
  const wdkService = useWdkServiceContext();
  return DownloadClient.getClient(baseUrl, wdkService);
}

export function useConfiguredComputeClient(baseUrl: string) {
  const wdkService = useWdkServiceContext();
  return ComputeClient.getClient(baseUrl, wdkService);
}
