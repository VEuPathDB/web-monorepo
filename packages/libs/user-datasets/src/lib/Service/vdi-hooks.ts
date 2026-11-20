import { useVdiService } from './utils/use-vdi';
import { useEffect, useState } from 'react';
import { VdiServiceMetadata } from './Model';
import { Possible } from '../Utils';

export const useVdiMetadata = (): Possible<VdiServiceMetadata> => {
  const [metadata, setMetadata] = useState<VdiServiceMetadata>();
  const vdi = useVdiService();

  useEffect(
    () => {
      vdi?.getServiceMetadata()?.then(setMetadata);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vdi != null],
  );

  return metadata;
}
