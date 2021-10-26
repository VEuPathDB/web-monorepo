import { WdkService } from '@veupathdb/wdk-client/lib/Core';

import {
  BlastParamInternalValues,
  blastParamInternalValues,
} from './ServiceTypes';

export function wrapWdkService(
  wdkService: WdkService
): BlastCompatibleWdkService {
  return {
    ...wdkService,
    getBlastParamInternalValues: blastCompatibleWdkServiceWrappers.getBlastParamInternalValues(
      wdkService
    ),
  };
}

export const blastCompatibleWdkServiceWrappers = {
  getBlastParamInternalValues: (wdkService: WdkService) => (
    multiBlastSearchName: string
  ) =>
    wdkService.sendRequest(blastParamInternalValues, {
      useCache: true,
      method: 'get',
      path: `/blast-param-internal-values/${multiBlastSearchName}`,
    }),
};

export interface BlastCompatibleWdkService extends WdkService {
  getBlastParamInternalValues: (
    multiBlastSearchName: string
  ) => Promise<BlastParamInternalValues>;
}

export function isBlastCompatibleWdkService(
  wdkService: WdkService
): wdkService is BlastCompatibleWdkService {
  return Object.keys(blastCompatibleWdkServiceWrappers).every(
    (blastServiceKey) => blastServiceKey in wdkService
  );
}
