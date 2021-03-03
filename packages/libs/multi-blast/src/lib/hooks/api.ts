import { createContext, useContext, useMemo } from 'react';

import { useDispatch } from 'react-redux';

import { notifyUnhandledError } from '@veupathdb/wdk-client/lib/Actions/UnhandledErrorActions';
import { WdkDepdendenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import { IoBlastFormat } from '../utils/ServiceTypes';
import {
  apiRequests,
  bindBlastApiRequestCreators,
  createBlastRequestHandler,
  createJobContentDownloader,
} from '../utils/api';
import { isBlastCompatibleWdkService } from '../utils/wdkServiceIntegration';

const BlastServiceUrl = createContext('/multi-blast');

export function useBlastApi() {
  const blastServiceUrl = useContext(BlastServiceUrl);
  const reportError = useReportError();

  const user = useWdkService((wdkService) => wdkService.getCurrentUser(), []);

  return useMemo(() => {
    if (user == null) {
      return undefined;
    }

    const successHandler = createBlastRequestHandler(blastServiceUrl, user);

    return bindBlastApiRequestCreators(
      apiRequests,
      successHandler,
      reportError
    );
  }, [blastServiceUrl, reportError, user]);
}

function useReportError() {
  const wdkDependencies = useContext(WdkDepdendenciesContext);
  const dispatch = useDispatch();

  return useMemo(() => {
    if (wdkDependencies == null) {
      throw new Error(
        'To report errors, WdkDependendenciesContext must be configured.'
      );
    }

    if (!isBlastCompatibleWdkService(wdkDependencies.wdkService)) {
      throw new Error(
        'To report errors, the webapp must be configured with a BLAST-compatible WdkService.'
      );
    }

    return function reportError(error: any) {
      wdkDependencies.wdkService.submitErrorIfNot500(
        error instanceof Error ? error : new Error(error)
      );

      dispatch(notifyUnhandledError(error));
    };
  }, [dispatch, wdkDependencies]);
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
      ((jobId: string, format: IoBlastFormat, zip: boolean) =>
        reportDownloader(
          `${blastServiceUrl}/jobs/${jobId}/report?format=${format}&zip=${zip}`,
          zip ? `${jobId}-${format}-report.zip` : `${jobId}-${format}-report`
        )),
    [blastServiceUrl, reportDownloader]
  );
}
