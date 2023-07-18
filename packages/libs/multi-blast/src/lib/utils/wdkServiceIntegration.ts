import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import {
  Unpack,
  objectOf,
  record,
  string,
} from '@veupathdb/wdk-client/lib/Utils/Json';

const blastParamInternalValues = objectOf(
  record({
    organismValues: objectOf(string),
    dbTypeInternal: string,
  })
);

type BlastParamInternalValues = Unpack<typeof blastParamInternalValues>;

export function wrapWdkService(
  wdkService: WdkService
): BlastCompatibleWdkService {
  return {
    ...wdkService,
    getBlastParamInternalValues:
      blastCompatibleWdkServiceWrappers.getBlastParamInternalValues(wdkService),
  };
}

export const blastCompatibleWdkServiceWrappers = {
  getBlastParamInternalValues:
    (wdkService: WdkService) => (multiBlastSearchName: string) =>
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
