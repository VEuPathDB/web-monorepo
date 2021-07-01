import { createContext, useCallback } from 'react';
import { useWdkServiceWithRefresh } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { preorderSeq } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import {
  getTargetType,
  getScopes,
  getNodeId,
} from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';
import {
  StudyEntity,
  StudyMetadata,
  StudyRecordClass,
  StudyRecord,
} from '../types/study';
import { usePromise } from './promise';
import { SubsettingClient } from '../api/subsetting-api';
import { Variable } from '../types/variable';
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
        .toArray();
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

export function useStudyMetadata(datasetId: string, store: SubsettingClient) {
  return usePromise(
    useCallback(async () => {
      const studies = await store.getStudies();
      const study = studies.find((s) => s.datasetId === datasetId);
      if (study == null)
        throw new Error(
          'Could not find study with associated dataset id `' + datasetId + '`.'
        );
      return store.getStudyMetadata(study.id);
    }, [datasetId, store])
  );
}

export function useFindEntityAndVariable(entities: StudyEntity[]) {
  return useCallback(
    (variable?: Variable) => findEntityAndVariable(entities, variable),
    [entities]
  );
}
