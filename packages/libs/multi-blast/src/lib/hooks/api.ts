import { createContext, useCallback, useContext, useMemo } from 'react';

import { bindApiRequestCreators } from '@veupathdb/web-common/lib/util/api';

import {
  apiRequests,
  createBlastRequestHandler,
  createQueryDownloader,
} from '../utils/api';

const BlastServiceUrl = createContext('/multi-blast');

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

export function useDownloadJobQueryCallback(jobId: string) {
  const blastServiceUrl = useContext(BlastServiceUrl);

  const queryDownloader = useMemo(
    () => createQueryDownloader(blastServiceUrl),
    [blastServiceUrl]
  );

  return useCallback(() => {
    queryDownloader(jobId);
  }, [queryDownloader, jobId]);
}
