import ErrorStatus from '@veupathdb/wdk-client/lib/Components/PageStatus/Error';
import React from 'react';
import { SubsettingClient } from '../api/eda-api';
import { DataClient } from '../api/data-service';
import { SessionClient } from '../api/session-api';
import { WorkspaceContext } from '../context/WorkspaceContext';
import { useStudyMetadata, useWdkStudyRecord } from '../hooks/study';

export interface Props {
  studyId: string;
  sessionId: string;
  children: React.ReactChild | React.ReactChild[];
  className?: string;
  sessionClient: SessionClient;
  subsettingClient: SubsettingClient;
  dataClient: DataClient;
  makeVariableLink?: (entityId: string, variableId: string) => string;
}

export function EDAWorkspaceContainer(props: Props) {
  const {
    studyId,
    sessionClient,
    subsettingClient,
    dataClient,
    children,
    className = 'EDAWorkspace',
    makeVariableLink,
  } = props;
  const wdkStudyRecordState = useWdkStudyRecord(studyId);
  const { value: studyMetadata, error: studyMetadataError } = useStudyMetadata(
    studyId,
    subsettingClient
  );
  if (studyMetadataError)
    return (
      <ErrorStatus>
        <h2>Unable to load study metadata</h2>
        <pre>{String(studyMetadataError)}</pre>
      </ErrorStatus>
    );
  if (wdkStudyRecordState == null || studyMetadata == null) return null;
  return (
    <WorkspaceContext.Provider
      value={{
        ...wdkStudyRecordState,
        studyMetadata,
        sessionClient,
        subsettingClient,
        dataClient,
        makeVariableLink,
      }}
    >
      <div className={className}>{children}</div>
    </WorkspaceContext.Provider>
  );
}
