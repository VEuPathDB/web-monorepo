import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { ok } from '@veupathdb/wdk-client/lib/Utils/Json';
import { memoize } from 'lodash';

import { blastCompatibleWdkServiceWrappers } from '@veupathdb/multi-blast/lib/utils/wdkServiceIntegration';
import userCommentsService from './service/UserCommentsService'

export type GenomicsService = WdkService & {
  [K in keyof GenomicsServiceWrappers]: ReturnType<GenomicsServiceWrappers[K]>;
};

const getUserCommentsInstance = memoize(userCommentsService);

type GenomicsServiceWrappers = typeof genomicsServiceWrappers;

export const genomicsServiceWrappers = {
  ...blastCompatibleWdkServiceWrappers,
  getUserComment: (wdkService: WdkService) => getUserCommentsInstance(wdkService).getUserComment,
  getUserComments: (wdkService: WdkService) => getUserCommentsInstance(wdkService).getUserComments,
  getPubmedPreview: (wdkService: WdkService) => getUserCommentsInstance(wdkService).getPubmedPreview,
  getUserCommentCategories: (wdkService: WdkService) => getUserCommentsInstance(wdkService).getUserCommentCategories,
  postUserComment: (wdkService: WdkService) => getUserCommentsInstance(wdkService).postUserComment,
  deleteUserComment: (wdkService: WdkService) => getUserCommentsInstance(wdkService).deleteUserComment,
  deleteUserCommentAttachedFile: (wdkService: WdkService) => getUserCommentsInstance(wdkService).deleteUserCommentAttachedFile,
  postUserCommentAttachedFile: (wdkService: WdkService) => getUserCommentsInstance(wdkService).postUserCommentAttachedFile,
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
    getUserComment: genomicsServiceWrappers.getUserComment(wdkService),
    getUserComments: genomicsServiceWrappers.getUserComments(wdkService),
    getPubmedPreview: genomicsServiceWrappers.getPubmedPreview(wdkService),
    getUserCommentCategories: genomicsServiceWrappers.getUserCommentCategories(wdkService),
    postUserComment: genomicsServiceWrappers.postUserComment(wdkService),
    deleteUserComment: genomicsServiceWrappers.deleteUserComment(wdkService),
    deleteUserCommentAttachedFile: genomicsServiceWrappers.deleteUserCommentAttachedFile(wdkService),
    postUserCommentAttachedFile: genomicsServiceWrappers.postUserCommentAttachedFile(wdkService),
  };
}

export function isGenomicsService(wdkService: WdkService): wdkService is GenomicsService  {
  return Object.keys(genomicsServiceWrappers).every(
    genomicsServiceWrapperKey => genomicsServiceWrapperKey in wdkService
  );
}
