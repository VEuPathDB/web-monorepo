import { createContext, useCallback } from 'react';
import { useWdkServiceWithRefresh } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { preorderSeq } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import {
  getTargetType,
  getScopes,
  getNodeId,
} from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';
import { StudyMetadata, StudyRecordClass, StudyRecord } from '../types/study';
import { usePromise } from './promise';
import { SubsettingClient } from '../api/eda-api';

const STUDY_RECORD_CLASS_NAME = 'dataset';

interface StudyState {
  studyRecordClass: StudyRecordClass;
  studyRecord: StudyRecord;
  studyMetadata: StudyMetadata;
}

export const StudyContext = createContext<StudyState | undefined>(undefined);

export function useWdkStudyRecord(studyId: string) {
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
      const studyRecord = await wdkService.getRecord(
        STUDY_RECORD_CLASS_NAME,
        [{ name: 'dataset_id', value: studyId }],
        { attributes }
      );
      return {
        studyRecord,
        studyRecordClass,
      };
    },
    [studyId]
  );
}

export function useStudyMetadata(studyId: string, store: SubsettingClient) {
  return usePromise(
    useCallback(() => store.getStudyMetadata(studyId), [store, studyId])
  );
}
