import React from 'react';
import { useWdkStudyRecord, useStudyMetadata } from '../hooks/study';
import { LoadError } from '@veupathdb/wdk-client/lib/Components';
import { SessionClient } from '../api/session-api';
import { SubsettingClient } from '../api/eda-api';
import { WorkspaceContext } from '../context/WorkspaceContext';

interface Props {
  studyId: string;
  children: React.ReactChild | React.ReactChild[];
  className?: string;
  sessionClient: SessionClient;
  subsettingClient: SubsettingClient;
}

export function EDASessionListContainer(props: Props) {
  const { studyId, subsettingClient, sessionClient, className = 'EDAWorkspace', children } = props;
  const studyRecordState = useWdkStudyRecord(studyId);
  const studyMetadata = useStudyMetadata(studyId, subsettingClient);
  if (studyMetadata.error) return <LoadError/>
  if (studyRecordState == null || studyMetadata.value == null) return null;
  return (
    <div className={className}>
      <WorkspaceContext.Provider value={{
        ...studyRecordState,
        studyMetadata: studyMetadata.value,
        sessionClient,
        subsettingClient
      }}>
        {children}
      </WorkspaceContext.Provider>
    </div>
  )
}
