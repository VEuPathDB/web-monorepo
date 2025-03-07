import { useUITheme } from '@veupathdb/coreui/lib/components/theming';
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
import {
  useConfiguredAnalysisClient,
  useConfiguredSubsettingClient,
  useConfiguredDownloadClient,
  useConfiguredDataClient,
  useConfiguredComputeClient,
} from '../core/hooks/client';
import { AllAnalyses } from './AllAnalyses';
import { ImportAnalysis } from './ImportAnalysis';
import { LatestAnalysis } from './LatestAnalysis';
import { PublicAnalysesRoute } from './PublicAnalysesRoute';
import { StudyList } from './StudyList';
import { WorkspaceContainer } from './WorkspaceContainer';
import { AnalysisPanel } from './AnalysisPanel';
import { StandaloneStudyPage } from './StandaloneStudyPage';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';

const EDA_PROJECT_IDS = ['ClinEpiDB', 'MicrobiomeDB'];

type Props = {
  edaServiceUrl: string;
  exampleAnalysesAuthors?: number[];
  showUnreleasedData?: boolean;
  /**
   * The base of the URL from which to being sharing links.
   * This is passed down through several component layers. */
  sharingUrlPrefix: string;
  /**
   * A callback to open a login form.
   * This is also passed down through several component layers. */
  showLoginForm: () => void;
  /**
   * Should be the name of the one, singular app the eda should run,
   * or left undefined to use all apps associated with the project.
   * This is passed down through several component layers. */
  singleAppMode?: string;
  helpTabContents?: React.ReactNode;
};

/**
 * Router component for application.
 */
export function WorkspaceRouter({
  edaServiceUrl,
  exampleAnalysesAuthors,
  sharingUrlPrefix,
  showLoginForm,
  singleAppMode,
  showUnreleasedData = false,
  helpTabContents,
}: Props) {
  const coreUITheme = useUITheme();
  const coreUIPrimaryColor = coreUITheme?.palette.primary;
  const { path, url } = useRouteMatch();

  const subsettingClient = useConfiguredSubsettingClient(edaServiceUrl);
  const analysisClient = useConfiguredAnalysisClient(edaServiceUrl);
  const downloadClient = useConfiguredDownloadClient(edaServiceUrl);

  const projectId = useWdkService(
    async (wdkService) => (await wdkService.getConfig()).projectId
  );
  const isStudyExplorerWorkspace =
    projectId != null && !EDA_PROJECT_IDS.includes(projectId);

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
  }, [locationKeys, history, path]);

  return (
    <DocumentationContainer>
      <div
        css={{
          '& .wdk-SaveableTextEditor-Buttons .edit': {
            color:
              coreUIPrimaryColor &&
              coreUIPrimaryColor.hue[coreUIPrimaryColor.level] + ' !important',
          },
        }}
      >
        <Switch>
          <Route
            path={path}
            exact
            render={() => (
              <AllAnalyses
                analysisClient={analysisClient}
                subsettingClient={subsettingClient}
                exampleAnalysesAuthors={exampleAnalysesAuthors}
                showLoginForm={showLoginForm}
                synchronizeWithUrl
                updateDocumentTitle
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
              <StudyList baseUrl={url} subsettingClient={subsettingClient} />
            )}
          />
          <Route
            path={`${path}/public`}
            render={() => (
              <PublicAnalysesRoute
                analysisClient={analysisClient}
                subsettingClient={subsettingClient}
                exampleAnalysesAuthors={exampleAnalysesAuthors}
              />
            )}
          />
          <Route
            path={`${path}/:studyId`}
            exact
            render={(props: RouteComponentProps<{ studyId: string }>) => (
              <WorkspaceContainer
                {...props.match.params}
                edaServiceUrl={edaServiceUrl}
                isStudyExplorerWorkspace={isStudyExplorerWorkspace}
              >
                <StandaloneStudyPage
                  studyId={props.match.params.studyId}
                  showUnreleasedData={showUnreleasedData}
                  isStudyExplorerWorkspace={isStudyExplorerWorkspace}
                />
              </WorkspaceContainer>
            )}
          />
          <Route
            path={`${path}/:studyId/new`}
            render={(props: RouteComponentProps<{ studyId: string }>) => (
              <WorkspaceContainer
                {...props.match.params}
                edaServiceUrl={edaServiceUrl}
                isStudyExplorerWorkspace={isStudyExplorerWorkspace}
              >
                <AnalysisPanel
                  {...props.match.params}
                  sharingUrlPrefix={sharingUrlPrefix}
                  showLoginForm={showLoginForm}
                  hideSavedAnalysisButtons
                  downloadClient={downloadClient}
                  singleAppMode={singleAppMode}
                  showUnreleasedData={showUnreleasedData}
                  helpTabContents={helpTabContents}
                  isStudyExplorerWorkspace={isStudyExplorerWorkspace}
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
                edaServiceUrl={edaServiceUrl}
                isStudyExplorerWorkspace={isStudyExplorerWorkspace}
              >
                <AnalysisPanel
                  {...props.match.params}
                  sharingUrlPrefix={sharingUrlPrefix}
                  showLoginForm={showLoginForm}
                  downloadClient={downloadClient}
                  singleAppMode={singleAppMode}
                  showUnreleasedData={showUnreleasedData}
                  helpTabContents={helpTabContents}
                  isStudyExplorerWorkspace={isStudyExplorerWorkspace}
                />
              </WorkspaceContainer>
            )}
          />
        </Switch>
      </div>
    </DocumentationContainer>
  );
}
