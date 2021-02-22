import {
  ServiceCallback,
  useWdkService,
} from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import {
  BlastCompatibleWdkService,
  isBlastCompatibleWdkService,
} from '../utils/wdkServiceIntegration';

type BlastCompatibleWdkServiceCallback<T> = ServiceCallback<
  BlastCompatibleWdkService,
  T
>;

export function useBlastCompatibleWdkService<T>(
  callback: BlastCompatibleWdkServiceCallback<T>,
  deps?: any[]
): T | undefined {
  return useWdkService((wdkService) => {
    if (!isBlastCompatibleWdkService(wdkService)) {
      throw new Error(
        "BLAST-incompatible service passed to 'useBlastCompatibleWdkService'"
      );
    }

    return callback(wdkService);
  }, deps);
}
