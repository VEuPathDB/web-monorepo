import {
  ServiceCallback,
  useWdkService,
} from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import {
  assertIsVdiCompatibleWdkService,
  VdiCompatibleWdkService,
} from '../Service';

export function useWdkServiceWithVdi<T>(
  callback: ServiceCallback<VdiCompatibleWdkService, T>,
  deps: unknown[]
) {
  return useWdkService((wdkService) => {
    assertIsVdiCompatibleWdkService(wdkService);
    return callback(wdkService);
  }, deps);
}
