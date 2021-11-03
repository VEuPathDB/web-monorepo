import { createContext, useCallback, useMemo } from 'react';
import {
  useWdkService,
  useWdkServiceWithRefresh,
} from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import {
  preorder,
  preorderSeq,
} from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import {
  getTargetType,
  getScopes,
  getNodeId,
} from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';
import { AnswerJsonFormatConfig } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

import {
  StudyEntity,
  StudyMetadata,
  StudyRecordClass,
  StudyRecord,
  Variable,
} from '../types/study';
import SubsettingClient from '../api/SubsettingClient';
import { VariableDescriptor } from '../types/variable';
import { findEntityAndVariable } from '../utils/study-metadata';

const STUDY_RECORD_CLASS_NAME = 'dataset';

interface StudyState {
  studyRecordClass: StudyRecordClass;
  studyRecord: StudyRecord;
  studyMetadata: StudyMetadata;
}

export const StudyContext = createContext<StudyState | undefined>(undefined);

interface HookValue {
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
        (await wdkService.getConfig()).categoriesOntologyName
      );
      const attributes = preorderSeq(ontology.tree)
        .filter(
          (node) =>
            getTargetType(node) === 'attribute' &&
            getScopes(node).includes('eda')
        )
        .map(getNodeId)
        .toArray()
        .concat(['bulk_download_url']);
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

const DEFAULT_STUDY_ATTRIBUTES = ['dataset_id', 'eda_study_id'];
const DEFAULT_STUDY_TABLES: string[] = [];

export function useWdkStudyRecords(
  attributes: AnswerJsonFormatConfig['attributes'] = DEFAULT_STUDY_ATTRIBUTES,
  tables: AnswerJsonFormatConfig['tables'] = DEFAULT_STUDY_TABLES
): StudyRecord[] | undefined {
  return useWdkService(
    (wdkService) =>
      wdkService.getAnswerJson(
        {
          searchName: 'Studies',
          searchConfig: {
            parameters: {},
          },
        },
        {
          attributes,
          tables,
        }
      ),
    [attributes, tables]
  )?.records;
}

export function useStudyMetadata(datasetId: string, store: SubsettingClient) {
  return useWdkServiceWithRefresh(
    async (wdkService) => {
      const studyRecord = await wdkService.getRecord(
        STUDY_RECORD_CLASS_NAME,
        [{ name: 'dataset_id', value: datasetId }],
        { attributes: ['dataset_id', 'eda_study_id'] }
      );
      const studies = await store.getStudies();
      const study = studies.find(
        (s) => s.id === studyRecord.attributes.eda_study_id
      );
      if (study == null)
        throw new Error(
          'Could not find study with associated dataset id `' + datasetId + '`.'
        );
      return store.getStudyMetadata(study.id);
    },
    [datasetId, store]
  );
}

export function useFindEntityAndVariable(entities: StudyEntity[]) {
  return useCallback(
    (variable?: VariableDescriptor) => {
      const entAndVar = findEntityAndVariable(entities, variable);
      if (entAndVar == null || entAndVar.variable.type === 'category') return;
      return entAndVar as {
        entity: StudyEntity;
        variable: Variable;
      };
    },
    [entities]
  );
}

export function useStudyEntities(rootEntity: StudyEntity) {
  return useMemo(
    () =>
      Array.from(
        preorder(rootEntity, (e) => e.children?.slice().reverse() ?? [])
      ),
    [rootEntity]
  );
}
