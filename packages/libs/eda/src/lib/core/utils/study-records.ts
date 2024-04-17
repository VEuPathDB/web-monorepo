// utils for getting study records

import { cachedPermissionCheck } from '@veupathdb/study-data-access/lib/data-restriction/permissionsHooks';
import { getStudyId } from '@veupathdb/study-data-access/lib/shared/studies';
import { StudyAccessApi } from '@veupathdb/study-data-access/lib/study-access/api';
import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { AnswerJsonFormatConfig } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { SubsettingClient } from '../api';
import { StudyRecord } from '../types/study';

interface WdkStudyRecordsDeps {
  wdkService: WdkService;
  subsettingClient: SubsettingClient;
  studyAccessApi: StudyAccessApi;
}

interface WdkStudyRecordsOptions {
  attributes?: AnswerJsonFormatConfig['attributes'];
  tables?: AnswerJsonFormatConfig['tables'];
  searchName?: string;
}

const DEFAULT_STUDY_ATTRIBUTES = ['dataset_id', 'build_number_introduced'];
const DEFAULT_STUDY_TABLES: string[] = [];
const EMPTY_ARRAY: string[] = [];

export async function getWdkStudyRecords(
  deps: WdkStudyRecordsDeps,
  options?: WdkStudyRecordsOptions
): Promise<StudyRecord[]> {
  const { wdkService, subsettingClient, studyAccessApi } = deps;
  const attributes = options?.attributes ?? EMPTY_ARRAY;
  const tables = options?.tables ?? EMPTY_ARRAY;
  const searchName = options?.searchName ?? 'Studies';

  const [permissions, recordClass] = await Promise.all([
    cachedPermissionCheck(await wdkService.getCurrentUser(), studyAccessApi),
    wdkService.findRecordClass('dataset'),
  ]);
  const finalAttributes = DEFAULT_STUDY_ATTRIBUTES.concat(attributes).filter(
    (attribute) => attribute in recordClass.attributesMap
  );
  const finalTables = DEFAULT_STUDY_TABLES.concat(tables).filter(
    (table) => table in recordClass.tablesMap
  );
  const [edaStudies, answer] = await Promise.all([
    subsettingClient.getStudies(),
    wdkService.getAnswerJson(
      {
        searchName,
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
    ),
  ]);
  const studyIds = new Set(edaStudies.map((s) => s.id));
  return answer.records.filter((record) => {
    const datasetId = getStudyId(record);
    if (datasetId == null) {
      return false;
    }
    const studyId = permissions.perDataset[datasetId]?.studyId;
    return studyId && studyIds.has(studyId);
  });
}
