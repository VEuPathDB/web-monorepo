import React from 'react';
import { useAnalysisState, AnalysisContext, AnalysisStore } from '../hooks/useAnalysis';
import { useWdkStudyRecord, useStudyMetadata, StudyContext, StudyMetadataStore } from '../hooks/useStudy';

export interface Props {
  studyId: string;
  analysisId: string;
  children: React.ReactChild | React.ReactChild[];
  className?: string;
  analysisStore: AnalysisStore;
  studyMetadataStore: StudyMetadataStore;
}

export function EDAWorkspaceContainer(props: Props) {
  const { analysisId, studyId, analysisStore, studyMetadataStore, children, className = 'EDAWorkspace' } = props;
  const analysisState = useAnalysisState(analysisId, analysisStore);
  const wdkStudyRecordState = useWdkStudyRecord(studyId);
  const { value: studyMetadata } = useStudyMetadata(studyId, studyMetadataStore);
  if (analysisState == null || wdkStudyRecordState == null || studyMetadata == null) return null;
  return (
    <AnalysisContext.Provider value={analysisState}>
      <StudyContext.Provider value={{...wdkStudyRecordState, studyMetadata }}>
        <div className={className}>
          {children}
        </div>
      </StudyContext.Provider>
    </AnalysisContext.Provider>
  );
}
