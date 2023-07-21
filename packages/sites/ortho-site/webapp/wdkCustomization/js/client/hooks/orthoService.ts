import {
  ServiceCallback,
  useWdkService,
} from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import { OrthoService, isOrthoService } from 'ortho-client/services';

type OrthoServiceCallback<T> = ServiceCallback<OrthoService, T>;

export function useOrthoService<T>(
  callback: OrthoServiceCallback<T>,
  deps?: any[]
): T | undefined {
  return useWdkService((wdkService) => {
    if (!isOrthoService(wdkService)) {
      throw new Error("Non-Ortho service passed to 'useOrthoService'");
    }

    return callback(wdkService);
  }, deps);
}
