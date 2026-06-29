import { useEffect, useState } from 'react';

import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { projectId, vdiServiceUrl } from '../../config';

import { VdiService } from '../VdiService';
import { wrapWdkService } from './compatibility';
import { VdiPluginConfig, VdiServiceMetadata } from '../Model';

export function useVdiService(): VdiService | undefined {
  const [value, setValue] = useState<VdiService>();

  useWdkService(
    async (wdk) => {
      if (value)
        return;

      const wrapped = wrapWdkService({ vdiServiceUrl }, wdk);
      if (!wrapped)
        throw new Error('illegal state: could not wrap wdk service with vdi');

      console.log("making a new VDI")

      setValue(wrapped.vdi);
    },
    [ value ]
  );

  return value;
}

export interface VdiMetadata {
  readonly plugins: VdiPluginConfig[];
  readonly serviceInfo: VdiServiceMetadata;
}

export function useVdiMetadata(): VdiMetadata | undefined {
  const [value, setValue] = useState<VdiMetadata>();

  const vdi = useVdiService();

  useEffect(() => {
    if (vdi && !value) {
      Promise.all([
        vdi.getPluginList(projectId),
        vdi.getServiceMetadata()
      ])
        .then(([plugins, serviceInfo])=> setValue({ plugins, serviceInfo }));
    }
  }, [ vdi, value ]);

  return value;
}
