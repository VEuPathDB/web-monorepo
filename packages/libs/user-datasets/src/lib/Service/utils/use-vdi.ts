import { useEffect, useState } from 'react';

import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { projectId, vdiServiceUrl } from '../../config';

import { VdiService } from '../../vdi/VdiService';
import { wrapWdkService } from '../../vdi/utils/wdk-wrapping';
import { VdiPluginConfig, VdiServiceMetadata } from '../Model';

export function useVdiService(): VdiService | undefined {
  const [value, setValue] = useState<VdiService>();

  useWdkService(
    async (wdk) => {
      if (value) return;

      const wrapped = wrapWdkService({ vdiServiceUrl }, wdk);
      if (!wrapped)
        throw new Error('illegal state: could not wrap wdk service with vdi');

      setValue(wrapped.vdi);
    },
    [value]
  );

  return value;
}

export interface VdiMetadata {
  readonly plugins: VdiPluginConfig[];
  readonly serviceInfo: VdiServiceMetadata;
}
