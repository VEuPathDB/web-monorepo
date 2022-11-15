import React from 'react';

import { Loading } from '@veupathdb/wdk-client/lib/Components';

import { useWdkStudyRecord, useStudyMetadata } from '../hooks/study';
import { AnalysisClient } from '../api/AnalysisClient';
import SubsettingClient from '../api/SubsettingClient';
import DataClient from '../api/DataClient';
import { WorkspaceContext } from '../context/WorkspaceContext';
import { DownloadClient } from '../api/DownloadClient';

interface Props {
  studyId: string;
  children: React.ReactChild | React.ReactChild[];
  className?: string;
  analysisClient: AnalysisClient;
  subsettingClient: SubsettingClient;
  dataClient: DataClient;
  downloadClient: DownloadClient;
}

export function EDAAnalysisListContainer(props: Props) {
  const {
    studyId,
    subsettingClient,
    dataClient,
    analysisClient,
    downloadClient,
    className = 'EDAWorkspace',
    children,
  } = props;
  const studyRecordState = useWdkStudyRecord(studyId);
  const studyMetadata = useStudyMetadata(studyId, subsettingClient);
  if (studyRecordState == null || studyMetadata == null) return <Loading />;
  return (
    <div className={className}>
      <WorkspaceContext.Provider
        value={{
          ...studyRecordState,
          studyMetadata,
          analysisClient,
          subsettingClient,
          dataClient,
          downloadClient,
        }}
      >
        {children}
      </WorkspaceContext.Provider>
    </div>
  );
}
