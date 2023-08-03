import { createContext, useContext, useMemo } from 'react';

import { Dispatch } from 'redux';
import { useDispatch } from 'react-redux';

import { once } from 'lodash';

import { notifyUnhandledError } from '@veupathdb/wdk-client/lib/Actions/UnhandledErrorActions';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

import { IoBlastFormat } from '../utils/ServiceTypes';
import { BlastApi, createJobContentDownloader } from '../utils/api';
import {
  BlastCompatibleWdkService,
  isBlastCompatibleWdkService,
} from '../utils/wdkServiceIntegration';

const BlastServiceUrl = createContext('/multi-blast');

export function useBlastApi() {
  const blastServiceUrl = useContext(BlastServiceUrl);
  const wdkDependencies = useNonNullableContext(WdkDependenciesContext);
  const dispatch = useDispatch();

  if (!isBlastCompatibleWdkService(wdkDependencies.wdkService)) {
    throw new Error(
      'To use MultiBLAST, the webapp must be configured with a BLAST-compatible WdkService.'
    );
  }

  const reportError = makeErrorReporter(wdkDependencies.wdkService, dispatch);

  return BlastApi.getBlastClient(
    blastServiceUrl,
    wdkDependencies.wdkService,
    reportError
  );
}

const makeErrorReporter = once(function (
  wdkService: BlastCompatibleWdkService,
  dispatch: Dispatch
) {
  return function (error: any) {
    wdkService.submitErrorIfNot500(
      error instanceof Error ? error : new Error(error)
    );

    // Errors from this API are technically not unhandled,
    // since all responses get tagged, forcing the consumer
    // to deal with them.
    // dispatch(notifyUnhandledError(error));
  };
});

export function useDownloadReportCallback(jobId: string) {
  const blastServiceUrl = useContext(BlastServiceUrl);

  const user = useWdkService((wdkService) => wdkService.getCurrentUser(), []);

  const blastApi = useBlastApi();

  return useMemo(() => {
    const reportDownloader =
      user &&
      blastApi &&
      createJobContentDownloader(user, blastApi, blastServiceUrl, jobId);

    return (
      reportDownloader &&
      ((jobId: string, format: IoBlastFormat, zip: boolean) =>
        reportDownloader(format, zip, `${jobId}-${format}-report`))
    );
  }, [user, blastApi, blastServiceUrl, jobId]);
}
