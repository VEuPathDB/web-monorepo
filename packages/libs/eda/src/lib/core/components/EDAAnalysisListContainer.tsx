import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';

import { Loading } from '@veupathdb/wdk-client/lib/Components';

import { useWdkStudyRecord, useStudyMetadata } from '../hooks/study';
import { AnalysisClient } from '../api/analysis-api';
import SubsettingClient from '../api/SubsettingClient';
import DataClient from '../api/DataClient';
import { WorkspaceContext } from '../context/WorkspaceContext';
import { workspaceTheme } from './workspaceTheme';

const theme = createMuiTheme(workspaceTheme);
interface Props {
  studyId: string;
  children: React.ReactChild | React.ReactChild[];
  className?: string;
  analysisClient: AnalysisClient;
  subsettingClient: SubsettingClient;
  dataClient: DataClient;
}

export function EDAAnalysisListContainer(props: Props) {
  const {
    studyId,
    subsettingClient,
    dataClient,
    analysisClient,
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
        }}
      >
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </WorkspaceContext.Provider>
    </div>
  );
}
