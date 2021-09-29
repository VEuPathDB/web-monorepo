import React from 'react';
import { useWdkStudyRecord, useStudyMetadata } from '../hooks/study';
import { AnalysisClient } from '../api/analysis-api';
import { SubsettingClient } from '../api/subsetting-api';
import { DataClient } from '../api/data-api';
import { WorkspaceContext } from '../context/WorkspaceContext';
import ErrorStatus from '@veupathdb/wdk-client/lib/Components/PageStatus/Error';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import { workspaceTheme } from './workspaceTheme';
import { Loading } from '@veupathdb/wdk-client/lib/Components';

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
  if (studyMetadata.error)
    return (
      <ErrorStatus>
        <h2>Unable to load study metadata</h2>
        <pre>{String(studyMetadata.error)}</pre>
      </ErrorStatus>
    );
  if (studyRecordState == null || studyMetadata.value == null)
    return <Loading />;
  return (
    <div className={className}>
      <WorkspaceContext.Provider
        value={{
          ...studyRecordState,
          studyMetadata: studyMetadata.value,
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
