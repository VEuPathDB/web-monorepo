import { createContext, useContext, useMemo } from 'react';

import { bindApiRequestCreators } from '@veupathdb/web-common/lib/util/api';

import { apiRequests, createBlastRequestHandler } from './api';

const BlastServiceUrl = createContext('/blast');

export function useBlastApi() {
  const blastServiceUrl = useContext(BlastServiceUrl);

  return useMemo(
    () =>
      bindApiRequestCreators(
        apiRequests,
        createBlastRequestHandler(blastServiceUrl)
      ),
    [blastServiceUrl]
  );
}
