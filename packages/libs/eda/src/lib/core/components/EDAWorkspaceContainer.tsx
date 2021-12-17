import React from 'react';

import SubsettingClient from '../api/SubsettingClient';
import DataClient from '../api/DataClient';
import { AnalysisClient } from '../api/analysis-api';
import {
  MakeVariableLink,
  WorkspaceContext,
} from '../context/WorkspaceContext';
import { useStudyMetadata, useWdkStudyRecord } from '../hooks/study';
import { Loading } from '@veupathdb/wdk-client/lib/Components';

export interface Props {
  studyId: string;
  children: React.ReactChild | React.ReactChild[];
  className?: string;
  analysisClient: AnalysisClient;
  subsettingClient: SubsettingClient;
  dataClient: DataClient;
  makeVariableLink?: MakeVariableLink;
}

/** Just a data container... but note that it also provides a material ui theme... */
export function EDAWorkspaceContainer({
  studyId,
  children,
  className = 'EDAWorkspace',
  analysisClient,
  subsettingClient,
  dataClient,
  makeVariableLink,
}: Props) {
  const wdkStudyRecordState = useWdkStudyRecord(studyId);
  const studyMetadata = useStudyMetadata(studyId, subsettingClient);
  if (wdkStudyRecordState == null || studyMetadata == null) return <Loading />;
  return (
    <WorkspaceContext.Provider
      value={{
        ...wdkStudyRecordState,
        studyMetadata,
        analysisClient,
        subsettingClient,
        dataClient,
        makeVariableLink,
      }}
    >
      <div className={className}>{children}</div>
    </WorkspaceContext.Provider>
  );
}
