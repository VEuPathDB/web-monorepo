import { useState, useMemo } from 'react';
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
  useAnalysisState,
} from '../core';
import { DocumentationContainer } from '../core/components/docs/DocumentationContainer';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../core/api/queryClient';
import { Analysis, NewAnalysis } from '../core/types/analysis';

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

  // TEMPORARY: Use either of these study ids for testing. Ensure
  // the backend matches the study.
  const fakeStudyId = 'DS_82dc5abc7f'; // Lee Gambian plasmo
  // const fakeStudyId = 'DS_1102462e80'; // Bangladesh mbio

  const initialAnalysis = useMemo(() => {
    return makeNewAnalysis(fakeStudyId);
  }, []);

  const [analysis, setAnalysis] = useState<Analysis | NewAnalysis | undefined>(
    initialAnalysis
  );

  const analysisState = useAnalysisState(analysis, setAnalysis);

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
                  analysisState={analysisState}
                  notebookType="differentialExpressionNotebook"
                  // TODO: Determine if this standalone dev route is still
                  // needed now that WDK integration is in place. It may
                  // have only been useful during early development.
                  wdkState={{
                    queryName: '',
                    parameters: [],
                    paramValues: {},
                    updateParamValue: () => {},
                  }}
                />
              </EDAWorkspaceContainer>
            )}
          />
        </Switch>
      </QueryClientProvider>
    </DocumentationContainer>
  );
}
