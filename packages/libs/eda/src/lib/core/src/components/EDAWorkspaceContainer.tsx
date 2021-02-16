import ErrorStatus from '@veupathdb/wdk-client/lib/Components/PageStatus/Error';
import React from 'react';
import { EdaClient } from '../api/eda-api';
import { useSessionState, SessionContext, SessionStore } from '../hooks/useSession';
import { EdaClientContext } from '../hooks/useEdaApi';
import { useWdkStudyRecord, useStudyMetadata, StudyContext } from '../hooks/useStudy';

export interface Props {
  studyId: string;
  sessionId: string;
  children: React.ReactChild | React.ReactChild[];
  className?: string;
  sessionStore: SessionStore;
  edaClient: EdaClient;
}

export function EDAWorkspaceContainer(props: Props) {
  const { sessionId, studyId, sessionStore, edaClient, children, className = 'EDAWorkspace' } = props;
  const sessionState = useSessionState(sessionId, sessionStore);
  const wdkStudyRecordState = useWdkStudyRecord(studyId);
  const { value: studyMetadata, error: studyMetadataError } = useStudyMetadata(studyId, edaClient);
  if (studyMetadataError) return <ErrorStatus><h2>Unable to load study metadata</h2><pre>{String(studyMetadataError)}</pre></ErrorStatus>
  if (sessionState == null || wdkStudyRecordState == null || studyMetadata == null) return null;
  return (
    <SessionContext.Provider value={sessionState}>
      <EdaClientContext.Provider value={edaClient}>
        <StudyContext.Provider value={{...wdkStudyRecordState, studyMetadata }}>
          <div className={className}>
            {children}
          </div>
        </StudyContext.Provider>
      </EdaClientContext.Provider> 
    </SessionContext.Provider>
  );
}
