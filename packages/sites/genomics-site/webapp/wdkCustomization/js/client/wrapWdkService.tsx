import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { ok } from '@veupathdb/wdk-client/lib/Utils/Json';

import { blastCompatibleWdkServiceWrappers } from '@veupathdb/multi-blast/lib/utils/wdkServiceIntegration';

export type GenomicsService = WdkService & {
  [K in keyof GenomicsServiceWrappers]: ReturnType<GenomicsServiceWrappers[K]>;
};

type GenomicsServiceWrappers = typeof genomicsServiceWrappers;

export const genomicsServiceWrappers = {
  ...blastCompatibleWdkServiceWrappers,
  incrementOrganismCount: (wdkService: WdkService) => function(
    organismBearingEntity:
      string | { recordClassUrlSegment: string, primaryKeyValues: string[] }
  ): Promise<void> {
    const queryParams = new URLSearchParams();

    if (typeof organismBearingEntity === 'string') {
      queryParams.append('organism', organismBearingEntity)
    } else {
      queryParams.append('recordType', organismBearingEntity.recordClassUrlSegment);
      queryParams.append('primaryKey', organismBearingEntity.primaryKeyValues.join(','));
    }

    return wdkService.sendRequest(
      ok,
      {
        method: 'get',
        path: `/system/metrics/organism?${queryParams}`
      }
    );
  }
};

export function wrapWdkService(wdkService: WdkService): GenomicsService {
  return {
    ...wdkService,
    getBlastParamInternalValues: genomicsServiceWrappers.getBlastParamInternalValues(wdkService),
    incrementOrganismCount: genomicsServiceWrappers.incrementOrganismCount(wdkService),
  };
}

export function isGenomicsService(wdkService: WdkService): wdkService is GenomicsService  {
  return Object.keys(genomicsServiceWrappers).every(
    genomicsServiceWrapperKey => genomicsServiceWrapperKey in wdkService
  );
}
