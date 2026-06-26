import { useState } from 'react';

import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { vdiServiceUrl } from '../../config';

import { VdiService } from '../VdiService';
import { wrapWdkService } from './compatibility';

export function useVdiService(
  deps: any[] = [],
  vdiUrl: string = vdiServiceUrl,
): VdiService | undefined {
  const [value, setValue] = useState<VdiService>();

  useWdkService(
    async (wdk) => {
      const wrapped = wrapWdkService({ vdiServiceUrl: vdiUrl }, wdk);
      if (!wrapped)
        throw new Error('illegal state: could not wrap wdk service with vdi');

      setValue(wrapped.vdi);
    },
    [...deps, vdiUrl]
  );

  return value;
}
