import React from 'react';

import { Loading } from '@veupathdb/wdk-client/lib/Components';

import { useWdkStudyRecord, useStudyMetadata } from '../hooks/study';
import { AnalysisClient } from '../api/AnalysisClient';
import SubsettingClient from '../api/SubsettingClient';
import DataClient from '../api/DataClient';
import {
  WorkspaceContext,
  WorkspaceContextValue,
} from '../context/WorkspaceContext';
import { DownloadClient } from '../api/DownloadClient';
import { ComputeClient } from '../api/ComputeClient';
import { useDeepValue } from '../hooks/immutability';

interface Props {
  studyId: string;
  children: React.ReactChild | React.ReactChild[];
  className?: string;
  analysisClient: AnalysisClient;
  subsettingClient: SubsettingClient;
  dataClient: DataClient;
  downloadClient: DownloadClient;
  computeClient: ComputeClient;
}

export function EDAAnalysisListContainer(props: Props) {
  const {
    studyId,
    subsettingClient,
    dataClient,
    analysisClient,
    downloadClient,
    computeClient,
    className = 'EDAWorkspace',
    children,
  } = props;
  const studyRecordState = useWdkStudyRecord(studyId);
  const studyMetadata = useStudyMetadata(studyId, subsettingClient);
  const contextValue = useDeepValue({
    ...studyRecordState,
    studyMetadata: studyMetadata.value,
    analysisClient,
    subsettingClient,
    dataClient,
    downloadClient,
    computeClient,
  });

  if (
    contextValue.studyRecord == null ||
    contextValue.studyRecordClass == null ||
    contextValue.studyMetadata == null
  )
    return <Loading />;

  return (
    <div className={className}>
      <WorkspaceContext.Provider value={contextValue as WorkspaceContextValue}>
        {children}
      </WorkspaceContext.Provider>
    </div>
  );
}
