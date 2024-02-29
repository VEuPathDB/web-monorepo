import { createContext, useContext } from 'react';

import { Dispatch } from 'redux';
import { useDispatch } from 'react-redux';

import { once } from 'lodash';

import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';

import {
  BlastCompatibleWdkService,
  isBlastCompatibleWdkService,
} from '../utils/wdkServiceIntegration';
import { BlastAPIClient } from '../utils/api/BlastAPIClient';

export const BlastServiceUrl = createContext('/multi-blast');

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

  return BlastAPIClient.create(
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
