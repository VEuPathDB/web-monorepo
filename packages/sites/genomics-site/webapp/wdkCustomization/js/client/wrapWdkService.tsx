import { flowRight, identity, memoize, partial } from 'lodash';

import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { ok } from '@veupathdb/wdk-client/lib/Utils/Json';

import {
  datasetImportUrl,
  endpoint,
  useUserDatasetsWorkspace,
} from '@veupathdb/web-common/lib/config';

import { wrapWdkService as addMultiBlastService } from '@veupathdb/multi-blast/lib/utils/wdkServiceIntegration';
import { wrapWdkService as addUserDatasetsServices } from '@veupathdb/user-datasets/lib/Service';
import userCommentsService from './service/UserCommentsService';

export type GenomicsService = WdkService &
  {
    [K in keyof GenomicsServiceWrappers]: ReturnType<
      GenomicsServiceWrappers[K]
    >;
  };

const getUserCommentsInstance = memoize(userCommentsService);

type GenomicsServiceWrappers = typeof genomicsServiceWrappers;

export const genomicsServiceWrappers = {
  getUserComment: (wdkService: WdkService) =>
    getUserCommentsInstance(wdkService).getUserComment,
  getUserComments: (wdkService: WdkService) =>
    getUserCommentsInstance(wdkService).getUserComments,
  getPubmedPreview: (wdkService: WdkService) =>
    getUserCommentsInstance(wdkService).getPubmedPreview,
  getUserCommentCategories: (wdkService: WdkService) =>
    getUserCommentsInstance(wdkService).getUserCommentCategories,
  postUserComment: (wdkService: WdkService) =>
    getUserCommentsInstance(wdkService).postUserComment,
  deleteUserComment: (wdkService: WdkService) =>
    getUserCommentsInstance(wdkService).deleteUserComment,
  deleteUserCommentAttachedFile: (wdkService: WdkService) =>
    getUserCommentsInstance(wdkService).deleteUserCommentAttachedFile,
  postUserCommentAttachedFile: (wdkService: WdkService) =>
    getUserCommentsInstance(wdkService).postUserCommentAttachedFile,
  incrementOrganismCount: (wdkService: WdkService) =>
    function (
      organismBearingEntity:
        | string
        | { recordClassUrlSegment: string; primaryKeyValues: string[] }
    ): Promise<void> {
      const queryParams = new URLSearchParams();

      if (typeof organismBearingEntity === 'string') {
        queryParams.append('organism', organismBearingEntity);
      } else {
        queryParams.append(
          'recordType',
          organismBearingEntity.recordClassUrlSegment
        );
        queryParams.append(
          'primaryKey',
          organismBearingEntity.primaryKeyValues.join(',')
        );
      }

      return wdkService.sendRequest(ok, {
        method: 'get',
        path: `/system/metrics/organism?${queryParams}`,
      });
    },
};

export const wrapWdkService = flowRight(
  useUserDatasetsWorkspace
    ? partial(addUserDatasetsServices, {
        datasetImportUrl,
        fullWdkServiceUrl: `${window.location.origin}${endpoint}`,
      })
    : identity,
  addMultiBlastService,
  (wdkService: WdkService): WdkService => ({
    ...wdkService,
    // Hardcode isBeta. This method is used by search pages
    // and the search tree in the site header menu.
    getQuestions: memoize(async () => {
      const questions = await wdkService.getQuestions();
      return questions.map((q) => ({
        ...q,
        isBeta: q.urlSegment.endsWith('ByLongReadEvidence'),
      }));
    }),
  }),
  function addGenomicsServices(wdkService: WdkService): GenomicsService {
    return {
      ...wdkService,
      incrementOrganismCount:
        genomicsServiceWrappers.incrementOrganismCount(wdkService),
      getUserComment: genomicsServiceWrappers.getUserComment(wdkService),
      getUserComments: genomicsServiceWrappers.getUserComments(wdkService),
      getPubmedPreview: genomicsServiceWrappers.getPubmedPreview(wdkService),
      getUserCommentCategories:
        genomicsServiceWrappers.getUserCommentCategories(wdkService),
      postUserComment: genomicsServiceWrappers.postUserComment(wdkService),
      deleteUserComment: genomicsServiceWrappers.deleteUserComment(wdkService),
      deleteUserCommentAttachedFile:
        genomicsServiceWrappers.deleteUserCommentAttachedFile(wdkService),
      postUserCommentAttachedFile:
        genomicsServiceWrappers.postUserCommentAttachedFile(wdkService),
    };
  }
);

export function isGenomicsService(
  wdkService: WdkService
): wdkService is GenomicsService {
  return Object.keys(genomicsServiceWrappers).every(
    (genomicsServiceWrapperKey) => genomicsServiceWrapperKey in wdkService
  );
}
