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
  enum State {
    None,
    Loading,
    Loaded,
  }

  const [state, setState] = useState(State.None);
  const [value, setValue] = useState<VdiMetadata>();

  const vdi = useVdiService();

  useEffect(
    () => {
      const load = async (vdi: VdiService) => {
        setValue({
          plugins: await vdi.getPluginList(projectId),
          serviceInfo: await vdi.getServiceMetadata(),
        });

        setState(State.Loaded);
      };

      if (vdi && !value && state === State.None) {
        setState(State.Loading);

        load(vdi)
          .catch(e => {
            console.error("failed to load vdi metadata", e);
            setState(State.None)
          });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ !!vdi, value, state ],
  );

  return value;
}
