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
import { EDAAnalysisList } from './EDAAnalysisList';
import { ImportAnalysis } from './ImportAnalysis';
import { LatestAnalysis } from './LatestAnalysis';
import { PublicAnalysesRoute } from './PublicAnalysesRoute';
import { StudyList } from './StudyList';
import { WorkspaceContainer } from './WorkspaceContainer';

const theme = createTheme(workspaceTheme);

type Props = {
  subsettingServiceUrl: string;
  dataServiceUrl: string;
  userServiceUrl: string;
  exampleAnalysesAuthor?: number;
};

/**
 * Router component for application.
 */
export function WorkspaceRouter({
  subsettingServiceUrl,
  dataServiceUrl,
  userServiceUrl,
  exampleAnalysesAuthor,
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
              <EDAAnalysisList
                {...props.match.params}
                subsettingServiceUrl={subsettingServiceUrl}
                dataServiceUrl={dataServiceUrl}
                userServiceUrl={userServiceUrl}
              />
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
              />
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
            path={`${path}/:studyId/:analysisId/import`}
            render={(
              props: RouteComponentProps<{
                studyId: string;
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
              />
            )}
          />
        </Switch>
      </DocumentationContainer>
    </ThemeProvider>
  );
}
