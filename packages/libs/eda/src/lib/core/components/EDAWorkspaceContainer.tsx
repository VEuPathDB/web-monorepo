import React, { ReactNode, useMemo } from 'react';

import { Loading } from '@veupathdb/wdk-client/lib/Components';

import { StudyMetadata } from '..';
import SubsettingClient from '../api/SubsettingClient';
import DataClient from '../api/DataClient';
import { AnalysisClient } from '../api/analysis-api';
import {
  MakeVariableLink,
  WorkspaceContext,
} from '../context/WorkspaceContext';
import {
  HookValue as WdkStudyRecord,
  useStudyMetadata,
  useWdkStudyRecord,
} from '../hooks/study';

export interface Props {
  studyId: string;
  children: ReactNode;
  className?: string;
  analysisClient: AnalysisClient;
  subsettingClient: SubsettingClient;
  dataClient: DataClient;
  initializeMakeVariableLink?: (
    studyMetadata: StudyMetadata
  ) => MakeVariableLink;
}

/** Just a data container... but note that it also provides a material ui theme... */
export function EDAWorkspaceContainer(props: Props) {
  const { studyId, subsettingClient } = props;

  const wdkStudyRecordState = useWdkStudyRecord(studyId);
  const studyMetadata = useStudyMetadata(studyId, subsettingClient);
  if (wdkStudyRecordState == null || studyMetadata == null) return <Loading />;
  return (
    <EDAWorkspaceContainerWithLoadedData
      {...props}
      wdkStudyRecord={wdkStudyRecordState}
      studyMetadata={studyMetadata}
    />
  );
}

export interface LoadedDataProps extends Props {
  wdkStudyRecord: WdkStudyRecord;
  studyMetadata: StudyMetadata;
}

function EDAWorkspaceContainerWithLoadedData({
  children,
  className = 'EDAWorkspace',
  analysisClient,
  subsettingClient,
  dataClient,
  initializeMakeVariableLink,
  wdkStudyRecord,
  studyMetadata,
}: LoadedDataProps) {
  const makeVariableLink = useMemo(
    () =>
      initializeMakeVariableLink && initializeMakeVariableLink(studyMetadata),
    [initializeMakeVariableLink, studyMetadata]
  );

  return (
    <WorkspaceContext.Provider
      value={{
        ...wdkStudyRecord,
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
