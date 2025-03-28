import React, { ComponentType } from 'react';
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
} from '../core';
import { DocumentationContainer } from '../core/components/docs/DocumentationContainer';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../core/api/queryClient';
import { updateParamValues } from '@veupathdb/wdk-client/lib/Actions/StepAnalysis/StepAnalysisActionCreators';

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
  // const onParamValueChangeTest = (value) => {
  //   updateParamValues({
  //     ...paramValues,
  //     [paramSpec.name]: value,
  //   });
  // }

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
                  analysisId={props.match.params.analysisId}
                  studyId={props.match.params.datasetId}
                />
              </EDAWorkspaceContainer>
            )}
          />
        </Switch>
      </QueryClientProvider>
    </DocumentationContainer>
  );
}
