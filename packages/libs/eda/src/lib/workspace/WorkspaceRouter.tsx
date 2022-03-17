import { createTheme, ThemeProvider } from '@material-ui/core';
import React, { useEffect, useRef, useState } from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  useRouteMatch,
  Redirect,
  useHistory,
} from 'react-router';
import { Documentation } from '../core/components/docs/Documentation';
import { DocumentationContainer } from '../core/components/docs/DocumentationContainer';
import { workspaceTheme } from '../core/components/workspaceTheme';

import {
  useConfiguredAnalysisClient,
  useConfiguredSubsettingClient,
  useConfiguredDownloadClient,
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
  downloadServiceUrl: string;
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
  downloadServiceUrl,
  exampleAnalysesAuthor,
  sharingUrlPrefix,
  showLoginForm,
}: Props) {
  const { path, url } = useRouteMatch();

  const subsettingClient = useConfiguredSubsettingClient(subsettingServiceUrl);
  const analysisClient = useConfiguredAnalysisClient(userServiceUrl);
  const downloadClient = useConfiguredDownloadClient(downloadServiceUrl);

  // The following useEffect handles when the user presses the back button and
  // is inadvertently moved back to a new analysis URL from their saved analysis URL
  const history = useHistory();
  // Used to determine whether a POP action was the back or forward button
  // (it can be either)
  const [locationKeys, setLocationKeys] = useState<string[]>([]);
  // A full history stack
  const pathnamesRef = useRef([history.location.pathname]);
  // Tracks the current position in the history stack
  const pathnamesCursorRef = useRef(0);

  useEffect(() => {
    return history.listen((location) => {
      if (location.key === undefined) return;

      if (history.action === 'PUSH') {
        setLocationKeys([location.key]);
        pathnamesRef.current = pathnamesRef.current
          .slice(0, pathnamesCursorRef.current + 1)
          .concat(location.pathname);
        pathnamesCursorRef.current++;
      } else if (history.action === 'POP') {
        // The user has navigated using either the forward or back button

        // Sanity check
        if (!(locationKeys.length > 0)) return;

        if (locationKeys[1] === location.key) {
          // This is a forward button press (probably)
          setLocationKeys(([_, ...keys]) => keys);

          // Sanity check
          if (!(pathnamesCursorRef.current + 1 < pathnamesRef.current.length))
            return;

          pathnamesCursorRef.current++;
        } else {
          // This is a back button press (probably)
          setLocationKeys((keys) => [location.key!, ...keys]);

          // Sanity check
          if (!(pathnamesCursorRef.current > 0)) return;

          pathnamesCursorRef.current--;

          const lastPathname =
            pathnamesRef.current[pathnamesCursorRef.current + 1];
          const newAnalysisRegex = new RegExp(path + '/.*/new/.*');
          const savedAnalysisRegex = new RegExp(
            path + '/[^/]*/(?!new/)([^/]*)/.*'
          );
          const savedAnalysisMatch = lastPathname.match(savedAnalysisRegex);

          if (savedAnalysisMatch && newAnalysisRegex.test(location.pathname)) {
            // The user pressed the back buton and has been moved from a
            // saved analysis back to a new analysis. Replace the current
            // URL with the equivalent URL in the saved analysis.
            const savedAnalysisId = savedAnalysisMatch[1];
            const newPathname = location.pathname.replace(
              'new',
              savedAnalysisId
            );
            pathnamesRef.current[pathnamesCursorRef.current] = newPathname;
            history.replace(newPathname);
          }
        }
      } else if (history.action === 'REPLACE') {
        pathnamesRef.current[pathnamesCursorRef.current] = location.pathname;
      }
    });
  }, [locationKeys, history]);

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
                downloadServiceUrl={downloadServiceUrl}
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
                downloadServiceUrl={downloadServiceUrl}
              >
                <AnalysisPanel
                  {...props.match.params}
                  sharingUrlPrefix={sharingUrlPrefix}
                  showLoginForm={showLoginForm}
                  hideSavedAnalysisButtons
                  downloadClient={downloadClient}
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
                downloadServiceUrl={downloadServiceUrl}
              >
                <AnalysisPanel
                  {...props.match.params}
                  sharingUrlPrefix={sharingUrlPrefix}
                  showLoginForm={showLoginForm}
                  downloadClient={downloadClient}
                />
              </WorkspaceContainer>
            )}
          />
        </Switch>
      </DocumentationContainer>
    </ThemeProvider>
  );
}
