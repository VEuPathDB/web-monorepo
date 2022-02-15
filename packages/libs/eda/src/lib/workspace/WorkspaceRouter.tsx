import { createTheme, ThemeProvider } from '@material-ui/core';
import React from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  useRouteMatch,
  Redirect,
} from 'react-router';
import { Documentation } from '../core/components/docs/Documentation';
import { DocumentationContainer } from '../core/components/docs/DocumentationContainer';
import { workspaceTheme } from '../core/components/workspaceTheme';

import {
  useConfiguredAnalysisClient,
  useConfiguredSubsettingClient,
} from '../core/hooks/client';
import { AllAnalyses } from './AllAnalyses';
import { ImportAnalysis } from './ImportAnalysis';
import { LatestAnalysis } from './LatestAnalysis';
import { PublicAnalysesRoute } from './PublicAnalysesRoute';
import { StudyList } from './StudyList';
import { WorkspaceContainer } from './WorkspaceContainer';
import { AnalysisPanel } from './AnalysisPanel';
import { RecordController } from '@veupathdb/wdk-client/lib/Controllers';
import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';

const theme = createTheme(workspaceTheme);

type Props = {
  subsettingServiceUrl: string;
  dataServiceUrl: string;
  userServiceUrl: string;
  exampleAnalysesAuthor?: number;
  /**
   * The base of the URL from which to being sharing links.
   * This is passed down through several component layers. */
  sharingUrlPrefix: string;
  /**
   * A callback to open a login form.
   * This is also passed down through several component layers. */
  showLoginForm: () => void;
};

/**
 * Router component for application.
 */
export function WorkspaceRouter({
  subsettingServiceUrl,
  dataServiceUrl,
  userServiceUrl,
  exampleAnalysesAuthor,
  sharingUrlPrefix,
  showLoginForm,
}: Props) {
  const { path, url } = useRouteMatch();
  const subsettingClient = useConfiguredSubsettingClient(subsettingServiceUrl);
  const analysisClient = useConfiguredAnalysisClient(userServiceUrl);

  return (
    <ThemeProvider theme={theme}>
      <DocumentationContainer>
        <Switch>
          <Route
            path={path}
            exact
            render={() => (
              <AllAnalyses
                analysisClient={analysisClient}
                subsettingClient={subsettingClient}
                exampleAnalysesAuthor={exampleAnalysesAuthor}
                showLoginForm={showLoginForm}
              />
            )}
          />
          {/* replacing/redirecting double slashes url with single slash one */}
          <Route
            exact
            strict
            path="(.*//+.*)"
            render={({ location }) => (
              <Redirect to={location.pathname.replace(/\/\/+/g, '/')} />
            )}
          />
          <Route
            path={`${path}/documentation/:name`}
            exact
            render={(props: RouteComponentProps<{ name: string }>) => (
              <Documentation documentName={props.match.params.name} />
            )}
          />
          <Route
            path={`${path}/studies`}
            exact
            render={() => (
              <StudyList
                baseUrl={url}
                subsettingServiceUrl={subsettingServiceUrl}
              />
            )}
          />
          <Route
            path={`${path}/public`}
            render={() => (
              <PublicAnalysesRoute
                analysisClient={analysisClient}
                exampleAnalysesAuthor={exampleAnalysesAuthor}
              />
            )}
          />
          <Route
            path={`${path}/:studyId`}
            exact
            render={(props: RouteComponentProps<{ studyId: string }>) => (
              <WorkspaceContainer
                {...props.match.params}
                subsettingServiceUrl={subsettingServiceUrl}
                dataServiceUrl={dataServiceUrl}
                userServiceUrl={userServiceUrl}
              >
                <EDAWorkspaceHeading />
                <RecordController
                  recordClass="dataset"
                  primaryKey={props.match.params.studyId}
                />
              </WorkspaceContainer>
            )}
          />
          <Route
            path={`${path}/:studyId/new`}
            render={(props: RouteComponentProps<{ studyId: string }>) => (
              <WorkspaceContainer
                {...props.match.params}
                subsettingServiceUrl={subsettingServiceUrl}
                dataServiceUrl={dataServiceUrl}
                userServiceUrl={userServiceUrl}
              >
                <AnalysisPanel
                  {...props.match.params}
                  sharingUrlPrefix={sharingUrlPrefix}
                  showLoginForm={showLoginForm}
                  hideSavedAnalysisButtons
                />
              </WorkspaceContainer>
            )}
          />
          <Route
            path={`${path}/:studyId/~latest`}
            render={(props: RouteComponentProps<{ studyId: string }>) => (
              <LatestAnalysis
                {...props.match.params}
                replaceRegexp={/~latest/}
                analysisClient={analysisClient}
              />
            )}
          />
          <Route
            exact
            path={`${path}/:analysisId/import`}
            render={(
              props: RouteComponentProps<{
                analysisId: string;
              }>
            ) => {
              return (
                <ImportAnalysis
                  {...props.match.params}
                  analysisClient={analysisClient}
                />
              );
            }}
          />
          <Route
            exact
            path={`${path}/:studyId/:analysisId/import`}
            render={(
              props: RouteComponentProps<{
                analysisId: string;
                studyId: string;
              }>
            ) => (
              <Redirect
                to={`${path}/${props.match.params.analysisId}/import`}
              />
            )}
          />
          <Route
            path={`${path}/:studyId/:analysisId`}
            render={(
              props: RouteComponentProps<{
                studyId: string;
                analysisId: string;
              }>
            ) => (
              <WorkspaceContainer
                {...props.match.params}
                subsettingServiceUrl={subsettingServiceUrl}
                dataServiceUrl={dataServiceUrl}
                userServiceUrl={userServiceUrl}
              >
                <AnalysisPanel
                  {...props.match.params}
                  sharingUrlPrefix={sharingUrlPrefix}
                  showLoginForm={showLoginForm}
                />
              </WorkspaceContainer>
            )}
          />
        </Switch>
      </DocumentationContainer>
    </ThemeProvider>
  );
}
