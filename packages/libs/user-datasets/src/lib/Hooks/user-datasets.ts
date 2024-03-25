import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useMemo } from 'react';
import { UserDatasetApi } from '../Service/api';

function useWdkServiceContext() {
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);
  return wdkService;
}

export function useConfiguredVdiClient(baseUrl: string) {
  const wdkService = useWdkServiceContext();
  return useMemo(
    () => new UserDatasetApi({ baseUrl }, wdkService),
    [baseUrl, wdkService]
  );
}
