import React, { ComponentType, useState, useCallback, useMemo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { EdaNotebookLandingPage } from './EdaNotebookLandingPage';
import { EdaNotebookAnalysis } from './EdaNotebookAnalysis';
import {
  EDAWorkspaceContainer,
  useConfiguredAnalysisClient,
  useConfiguredComputeClient,
  useConfiguredDataClient,
  useConfiguredDownloadClient,
  useConfiguredSubsettingClient,
  makeNewAnalysis,
} from '../core';
import { DocumentationContainer } from '../core/components/docs/DocumentationContainer';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../core/api/queryClient';
import { Analysis, NewAnalysis } from '../core/types/analysis';
import { useAnalysisState } from '../core';

interface Props {
  edaServiceUrl: string;
  datasetId?: string;
  analysisId?: string;
}

export default function NotebookRoute(props: Props) {
  const { edaServiceUrl } = props;
  const match = useRouteMatch();
  const analysisClient = useConfiguredAnalysisClient(edaServiceUrl);
  const subsettingClient = useConfiguredSubsettingClient(edaServiceUrl);
  const downloadClient = useConfiguredDownloadClient(edaServiceUrl);
  const dataClient = useConfiguredDataClient(edaServiceUrl);
  const computeClient = useConfiguredComputeClient(edaServiceUrl);

  // dummy state management (will be handled by WDK in genomics-site)
  // should this be here?
  // if it's only used for the barebones dev site, maybe yes?

  const fakeStudyId = 'DS_82dc5abc7f';
  const initialAnalysis = useMemo(() => {
    return makeNewAnalysis(fakeStudyId);
  }, []);

  const [analysis, setAnalysis] =
    useState<Analysis | NewAnalysis | undefined>(initialAnalysis);

  return (
    <DocumentationContainer>
      <QueryClientProvider client={queryClient}>
        <Switch>
          <Route
            exact
            path={match.path}
            render={() => (
              <EdaNotebookLandingPage edaServiceUrl={edaServiceUrl} />
            )}
          />
          <Route
            path={`${match.path}/:datasetId/:analysisId`}
            render={(props) => (
              <EDAWorkspaceContainer
                studyId={props.match.params.datasetId}
                analysisClient={analysisClient}
                subsettingClient={subsettingClient}
                downloadClient={downloadClient}
                dataClient={dataClient}
                computeClient={computeClient}
              >
                <EdaNotebookAnalysis
                  analysis={analysis}
                  studyId={props.match.params.datasetId}
                  onAnalysisChange={setAnalysis}
                />
              </EDAWorkspaceContainer>
            )}
          />
        </Switch>
      </QueryClientProvider>
    </DocumentationContainer>
  );
}
