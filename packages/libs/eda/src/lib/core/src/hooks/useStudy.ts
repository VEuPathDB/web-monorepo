import { createContext, useCallback } from 'react';
import { useWdkServiceWithRefresh } from 'wdk-client/Hooks/WdkServiceHook';
import { preorderSeq } from 'wdk-client/Utils/TreeUtils';
import { getTargetType, getScopes, getNodeId } from 'wdk-client/Utils/CategoryUtils';
import { useNonNullableContext } from './useNonNullableContext';
import { StudyMetadata, StudyRecordClass, StudyRecord } from '../types/study';
import { usePromise } from './usePromise';

const STUDY_RECORD_CLASS_NAME = 'dataset';

interface StudyState {
  studyRecordClass: StudyRecordClass;
  studyRecord: StudyRecord;
  studyMetadata: StudyMetadata;
}

export const StudyContext = createContext<StudyState | undefined>(undefined);

export function useStudy() {
  return useNonNullableContext(StudyContext);
}

export function useWdkStudyRecord(studyId: string) {
  return useWdkServiceWithRefresh(async wdkService => {
    const studyRecordClass = await wdkService.findRecordClass(STUDY_RECORD_CLASS_NAME);
    const ontology = await wdkService.getOntology((await wdkService.getConfig()).categoriesOntologyName);
    const attributes = preorderSeq(ontology.tree)
      .filter(node => getTargetType(node) === 'attribute' && getScopes(node).includes('eda'))
      .map(getNodeId)
      .toArray();
    const studyRecord = await wdkService.getRecord(
      STUDY_RECORD_CLASS_NAME,
      [ { name: 'dataset_id', value: studyId } ],
      { attributes }
    );
    return {
      studyRecord,
      studyRecordClass
    };
  }, [studyId]);
}

export interface StudyMetadataStore {
  getStudyMetadata(studyId: string): Promise<StudyMetadata>;
}

export function useStudyMetadata(studyId: string, store: StudyMetadataStore) {
  return usePromise(useCallback(() => store.getStudyMetadata(studyId), [ store, studyId]));
}
