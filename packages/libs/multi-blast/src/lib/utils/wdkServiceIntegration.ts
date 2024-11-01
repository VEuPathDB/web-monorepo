import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import {
  Unpack,
  objectOf,
  record,
  string,
} from '@veupathdb/wdk-client/lib/Utils/Json';
import { omit } from 'lodash';
import { BLAST_QUERY_SEQUENCE_PARAM_NAME } from './params';

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
    getRefreshedDependentParams(
      questionUrlSegment,
      paramName,
      paramValue,
      paramValues
    ) {
      if (questionUrlSegment.endsWith('MultiBlast')) {
        paramValues = {
          ...paramValues,
          [BLAST_QUERY_SEQUENCE_PARAM_NAME]: '',
        };
      }
      return wdkService.getRefreshedDependentParams(
        questionUrlSegment,
        paramName,
        paramValue,
        paramValues
      );
    },
    getQuestionGivenParameters(questionUrlSegment, paramValues) {
      if (questionUrlSegment.endsWith('MultiBlast')) {
        paramValues = {
          ...paramValues,
          [BLAST_QUERY_SEQUENCE_PARAM_NAME]: '',
        };
      }
      return wdkService.getQuestionGivenParameters(
        questionUrlSegment,
        paramValues
      );
    },
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
