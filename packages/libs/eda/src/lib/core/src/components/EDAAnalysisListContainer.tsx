import React from 'react';
import { AnalysisStore, AnalysisListContext } from '../hooks/useAnalysis';
import { StudyMetadataStore, useWdkStudyRecord, useStudyMetadata, StudyContext } from '../hooks/useStudy';
import { usePromise } from '../hooks/usePromise';
import { LoadError } from 'wdk-client/Components';

interface Props {
  studyId: string;
  children: React.ReactChild | React.ReactChild[];
  className?: string;
  analysisStore: AnalysisStore;
  studyMetadataStore: StudyMetadataStore;
}

export function EDAAnalysisListContainer(props: Props) {
  const { studyId, studyMetadataStore, analysisStore, className = 'EDAWorkspace', children } = props;
  const studyRecordState = useWdkStudyRecord(studyId);
  const studyMetadata = useStudyMetadata(studyId, studyMetadataStore);
  const analysisList = usePromise(async () => {
    const list = await analysisStore.getAnalyses();
    return list.filter(a => a.studyId == studyId);
  }, [analysisStore]);
  if (studyMetadata.error || analysisList.error) return <LoadError/>
  if (studyRecordState == null || studyMetadata.value == null || analysisList.value == null) return null;
  return (
    <div className={className}>
      <StudyContext.Provider value={{ ...studyRecordState, studyMetadata: studyMetadata.value }}>
        <AnalysisListContext.Provider value={analysisList.value}>
          {children}
        </AnalysisListContext.Provider>
      </StudyContext.Provider>
    </div>
  )
}