import { createContext } from 'react';
import {
  useWdkService,
  useWdkServiceWithRefresh,
} from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { preorderSeq } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import {
  getTargetType,
  getScopes,
  getNodeId,
} from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';
import { AnswerJsonFormatConfig } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

// Definitions
import {
  StudyEntity,
  StudyMetadata,
  StudyRecordClass,
  StudyRecord,
} from '../types/study';

// Helpers and Utilities
import SubsettingClient from '../api/SubsettingClient';

// Hooks
import { useStudyRecord } from '..';
import { useStudyAccessApi } from '@veupathdb/study-data-access/lib/study-access/studyAccessHooks';
import { getWdkStudyRecords } from '../utils/study-records';
import { useDeepValue } from './immutability';
import { usePermissions } from '@veupathdb/study-data-access/lib/data-restriction/permissionsHooks';
import { FetchClientError } from '@veupathdb/http-utils';
import { useCachedPromise } from './cachedPromise';

const STUDY_RECORD_CLASS_NAME = 'dataset';

interface StudyState {
  studyRecordClass: StudyRecordClass;
  studyRecord: StudyRecord;
  studyMetadata: StudyMetadata;
}

export const StudyContext = createContext<StudyState | undefined>(undefined);

export interface HookValue {
  studyRecordClass: StudyRecordClass;
  studyRecord: StudyRecord;
}
export function useWdkStudyRecord(datasetId: string): HookValue | undefined {
  return useWdkServiceWithRefresh(
    async (wdkService) => {
      const studyRecordClass = await wdkService.findRecordClass(
        STUDY_RECORD_CLASS_NAME
      );
      const ontology = await wdkService.getOntology(
        (
          await wdkService.getConfig()
        ).categoriesOntologyName
      );
      const attributes = preorderSeq(ontology.tree)
        .filter(
          (node) =>
            getTargetType(node) === 'attribute' &&
            getScopes(node).includes('eda')
        )
        .map(getNodeId)
        .toArray()
        .concat([
          'dataset_id',
          'bulk_download_url',
          'request_needs_approval',
          'is_public',
          'study_access',
          'custom_download_tab',
        ])
        .filter((attribute) => attribute in studyRecordClass.attributesMap);
      const studyRecord = await wdkService
        .getRecord(
          STUDY_RECORD_CLASS_NAME,
          [{ name: 'dataset_id', value: datasetId }],
          { attributes }
        )
        .catch((error) => {
          console.warn(
            'Unable to load study dataset record. See error below. Using stub record.'
          );
          console.error(error);
          const attrs = attributes.reduce(
            (attrs, name) =>
              Object.assign(attrs, {
                [name]: '######',
              }),
            { dataset_id: datasetId }
          );
          return {
            displayName: 'unknown Dataset',
            id: [{ name: 'dataset_id', value: datasetId }],
            recordClassName: STUDY_RECORD_CLASS_NAME,
            attributes: attrs,
            tables: {},
            tableErrors: [],
          };
        });
      return {
        studyRecord,
        studyRecordClass,
      };
    },
    [datasetId]
  );
}

interface WdkStudyRecordsOptions {
  attributes?: AnswerJsonFormatConfig['attributes'];
  tables?: AnswerJsonFormatConfig['tables'];
  searchName?: string;
}

export function useWdkStudyRecords(
  subsettingClient: SubsettingClient,
  options?: WdkStudyRecordsOptions
): StudyRecord[] | undefined {
  const studyAccessApi = useStudyAccessApi();
  const stableOptions = useDeepValue(options);
  return useWdkService(
    (wdkService) =>
      getWdkStudyRecords(
        {
          studyAccessApi,
          subsettingClient,
          wdkService,
        },
        stableOptions
      ),
    [studyAccessApi, subsettingClient, stableOptions]
  );
}

/**
 * Get a list of all the releases for the current study.
 *
 * The information obtained from the WDK service isn't all that
 * user friendly so we massage the response a bit so that it is
 * easier to interact with.
 *
 * To simplify the use of this data elsewhere, a type definition
 * is included.
 *
 * */
export function useWdkStudyReleases(): Array<WdkStudyRelease> {
  const studyRecord = useStudyRecord();

  return (
    useWdkService((wdkService) => {
      return wdkService.getRecord(STUDY_RECORD_CLASS_NAME, studyRecord.id, {
        tables: ['DownloadVersion'],
      });
    })?.tables['DownloadVersion'].map(
      (release) => ({
        // DAVE/JAMIE: I was sure if I could tell TS that these values
        // would always be present.
        releaseNumber: release.build_number?.toString(),
        description: release.note?.toString(),
        date: release.release_date?.toString(),
      }),
      [studyRecord.id]
    ) ?? []
  );
}

export type WdkStudyRelease = {
  releaseNumber: string | undefined;
  description: string | undefined;
  date: string | undefined;
};

export const STUB_ENTITY: StudyEntity = {
  id: '__STUB__',
  idColumnName: 'stub',
  displayName: 'stub',
  description: 'This is a stub entity. It does not exist in the database.',
  isManyToOneWithParent: false,
  variables: [],
};

export function isStubEntity(entity: StudyEntity) {
  return entity === STUB_ENTITY;
}

export function useStudyMetadata(datasetId: string, client: SubsettingClient) {
  const permissionsResponse = usePermissions();
  // undefined while permissions are loading → disables the query (pending state)
  // '__not_found__' sentinel → enables the query so the task can throw a clear error
  const edaStudyId = permissionsResponse.loading
    ? undefined
    : permissionsResponse.permissions.perDataset[datasetId]?.studyId ??
      '__not_found__';

  return useCachedPromise(async () => {
    // The '__not_found__' sentinel is a non-null key so react-query doesn't
    // pause the query — it runs and throws a clear error instead of hanging.
    if (edaStudyId === '__not_found__' || edaStudyId == null) {
      throw new Error(
        `An EDA Study ID could not be found for the Dataset ${datasetId}.`
      );
    }
    try {
      return await client.getStudyMetadata(edaStudyId);
    } catch (error) {
      if (error instanceof FetchClientError) {
        console.error(error);
        return {
          id: edaStudyId,
          rootEntity: STUB_ENTITY,
        };
      }
      throw error;
    }
  }, [edaStudyId, client]);
}
