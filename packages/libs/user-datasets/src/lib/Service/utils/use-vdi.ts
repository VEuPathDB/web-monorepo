import { useState } from 'react';

import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { vdiServiceUrl } from '../../config';

import { VdiService } from '../VdiService';
import { wrapWdkService } from './compatibility';

export function useVdiService<T>(
  fn: (vdi: VdiService) => Promise<T>,
  vdiUrl: string = vdiServiceUrl
): T | undefined {
  const [value, setValue] = useState<T>();

  useWdkService(
    async (wdk) => {
      const wrapped = wrapWdkService({ vdiServiceUrl: vdiUrl }, wdk);
      if (!wrapped)
        throw new Error('illegal state: could not wrap wdk service with vdi');

      setValue(await fn(wrapped.vdi));
    },
    [vdiUrl]
  );

  return value;
}
