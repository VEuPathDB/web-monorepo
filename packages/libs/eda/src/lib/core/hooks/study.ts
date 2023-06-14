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
import {
  AnswerJsonFormatConfig,
  RecordInstance,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';

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
import { usePermissions } from '@veupathdb/study-data-access/lib/data-restriction/permissionsHooks';
import { getStudyId } from '@veupathdb/study-data-access/lib/shared/studies';

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
            displayName: 'Fake Study',
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

const DEFAULT_STUDY_ATTRIBUTES = ['dataset_id'];
const DEFAULT_STUDY_TABLES: string[] = [];
const EMPTY_ARRAY: string[] = [];

export function useWdkStudyRecords(
  subsettingClient: SubsettingClient,
  attributes: AnswerJsonFormatConfig['attributes'] = EMPTY_ARRAY,
  tables: AnswerJsonFormatConfig['tables'] = EMPTY_ARRAY
): StudyRecord[] | undefined {
  const permissionsResponse = usePermissions();
  return useWdkService(
    async (wdkService) => {
      if (permissionsResponse.loading) return;
      const { permissions } = permissionsResponse;
      const studyIds = new Set(
        await subsettingClient
          .getStudies()
          .then((studies) => studies.map((s) => s.id))
      );
      const recordClass = await wdkService.findRecordClass('dataset');
      const finalAttributes = DEFAULT_STUDY_ATTRIBUTES.concat(
        attributes
      ).filter((attribute) => attribute in recordClass.attributesMap);
      const finalTables = DEFAULT_STUDY_TABLES.concat(tables).filter(
        (table) => table in recordClass.tablesMap
      );
      const answer = await wdkService.getAnswerJson(
        {
          searchName: 'Studies',
          searchConfig: {
            parameters: {},
          },
        },
        {
          attributes: finalAttributes,
          tables: finalTables,
          sorting: [
            {
              attributeName: 'display_name',
              direction: 'ASC',
            },
          ],
        }
      );
      return answer.records.filter((record) => {
        const datasetId = getStudyId(record);
        if (datasetId == null) {
          return false;
        }
        const studyId = permissions.perDataset[datasetId]?.studyId;
        return studyId && studyIds.has(studyId);
      });
    },
    [attributes, tables, permissionsResponse]
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
  variables: [],
};

export function isStubEntity(entity: StudyEntity) {
  return entity === STUB_ENTITY;
}

export function useStudyMetadata(datasetId: string, client: SubsettingClient) {
  const permissionsResponse = usePermissions();
  return useWdkServiceWithRefresh(
    async (wdkService) => {
      if (permissionsResponse.loading) return;
      const { permissions } = permissionsResponse;
      const recordClass = await wdkService.findRecordClass('dataset');
      const attributes = ['dataset_id', 'study_access'].filter(
        (attribute) => attribute in recordClass.attributesMap
      );
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
            {}
          );
          return {
            displayName: 'Fake Study',
            id: [{ name: 'dataset_id', value: datasetId }],
            recordClassName: STUDY_RECORD_CLASS_NAME,
            attributes: attrs,
            tables: {},
            tableErrors: [],
          } as RecordInstance;
        });
      const studyId =
        permissions.perDataset[studyRecord.attributes.dataset_id as string]
          ?.studyId;
      if (studyId == null) throw new Error('Not an eda study');
      try {
        return await client.getStudyMetadata(studyId);
      } catch (error) {
        console.error(error);
        return {
          id: studyId,
          rootEntity: STUB_ENTITY,
        };
      }
    },
    [datasetId, client, permissionsResponse]
  );
}
