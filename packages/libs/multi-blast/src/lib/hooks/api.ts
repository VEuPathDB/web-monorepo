import { createContext, useContext, useMemo } from 'react';

import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { bindApiRequestCreators } from '@veupathdb/web-common/lib/util/api';

import { IoBlastFormat } from '../utils/ServiceTypes';
import {
  apiRequests,
  createBlastRequestHandler,
  createJobContentDownloader,
} from '../utils/api';

const BlastServiceUrl = createContext('/multi-blast');

export function useBlastApi() {
  const blastServiceUrl = useContext(BlastServiceUrl);

  const user = useWdkService((wdkService) => wdkService.getCurrentUser(), []);

  return useMemo(
    () =>
      user &&
      bindApiRequestCreators(
        apiRequests,
        createBlastRequestHandler(blastServiceUrl, user)
      ),
    [user, blastServiceUrl]
  );
}

export function useDownloadReportCallback() {
  const blastServiceUrl = useContext(BlastServiceUrl);

  const user = useWdkService((wdkService) => wdkService.getCurrentUser(), []);

  const reportDownloader = useMemo(
    () => user && createJobContentDownloader(user),
    [user]
  );

  return useMemo(
    () =>
      reportDownloader &&
      ((jobId: string, format: IoBlastFormat) =>
        reportDownloader(
          `${blastServiceUrl}/jobs/${jobId}/report?format=${format}&zip=false`,
          `${jobId}-${format}-report`
        )),
    [blastServiceUrl, reportDownloader]
  );
}
