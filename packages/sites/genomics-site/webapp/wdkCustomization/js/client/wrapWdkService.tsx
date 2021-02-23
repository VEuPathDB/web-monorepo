import { BlastCompatibleWdkService, blastCompatibleWdkServiceWrappers } from '@veupathdb/multi-blast/lib/utils/wdkServiceIntegration';
import { WdkService } from '@veupathdb/wdk-client/lib/Core';

type ApiCommonWdkService = BlastCompatibleWdkService;

export function wrapWdkService(wdkService: WdkService): ApiCommonWdkService {
  return {
    ...wdkService,
    getBlastParamInternalValues: blastCompatibleWdkServiceWrappers.getBlastParamInternalValues(wdkService)
  };
}
