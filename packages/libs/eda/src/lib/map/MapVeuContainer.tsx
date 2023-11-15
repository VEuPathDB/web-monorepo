import {
  Route,
  RouteComponentProps,
  Switch,
  useRouteMatch,
  useHistory,
} from 'react-router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { EDAAnalysisListContainer, EDAWorkspaceContainer } from '../core';

import { AnalysisList } from './MapVeuAnalysisList';
import { MapAnalysis } from './analysis/MapAnalysis';

import { AllAnalyses } from '../workspace/AllAnalyses';
import {
  useConfiguredSubsettingClient,
  useConfiguredDataClient,
  useConfiguredAnalysisClient,
  useConfiguredDownloadClient,
  useConfiguredComputeClient,
} from '../core/hooks/client';

import './MapVEu.scss';
import { SiteInformationProps } from './analysis/Types';
import { StudyList } from './StudyList';
import { PublicAnalysesRoute } from '../workspace/PublicAnalysesRoute';
import { ImportAnalysis } from '../workspace/ImportAnalysis';

interface Props {
  edaServiceUrl: string;
  singleAppMode?: string;
  siteInformationProps: SiteInformationProps;
  sharingUrl: string;
  showLinkToEda?: boolean;
}

export function MapVeuContainer(mapVeuContainerProps: Props) {
  const {
    singleAppMode,
    siteInformationProps,
    edaServiceUrl,
    sharingUrl,
    showLinkToEda,
  } = mapVeuContainerProps;
  const edaClient = useConfiguredSubsettingClient(edaServiceUrl);
  const dataClient = useConfiguredDataClient(edaServiceUrl);
  const computeClient = useConfiguredComputeClient(edaServiceUrl);
  const analysisClient = useConfiguredAnalysisClient(edaServiceUrl);
  const downloadClient = useConfiguredDownloadClient(edaServiceUrl);

  const history = useHistory();
  function showLoginForm() {
    const currentUrl = window.location.href;
    const loginUrl = `${siteInformationProps.loginUrl}?destination=${currentUrl}`;
    history.push(loginUrl);
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // This is similar behavior to our custom usePromise hook.
        // It can be overridden on an individual basis, if needed.
        keepPreviousData: true,
        // We presume data will not go stale during the lifecycle of an application.
        staleTime: Infinity,
      },
    },
  });

  // This will get the matched path of the active parent route.
  // This is useful so we don't have to hardcode the path root.
  const { path } = useRouteMatch();
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route
          path={path}
          exact
          render={() => (
            <AllAnalyses
              analysisClient={analysisClient}
              subsettingClient={edaClient}
              showLoginForm={showLoginForm}
            />
          )}
        />
        <Route
          path={`${path}/studies`}
          exact
          render={() => <StudyList subsettingClient={edaClient} />}
        />
        <Route
          path={`${path}/public`}
          render={() => (
            <PublicAnalysesRoute
              analysisClient={analysisClient}
              subsettingClient={edaClient}
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
          path={[`${path}/:studyId/new`, `${path}/:studyId/:analysisId`]}
          render={(
            routeProps: RouteComponentProps<{
              analysisId?: string;
              studyId: string;
            }>
          ) => (
            <EDAWorkspaceContainer
              studyId={routeProps.match.params.studyId}
              subsettingClient={edaClient}
              analysisClient={analysisClient}
              dataClient={dataClient}
              downloadClient={downloadClient}
              computeClient={computeClient}
              className="MapVEu"
            >
              <MapAnalysis
                singleAppMode={singleAppMode}
                analysisId={routeProps.match.params.analysisId}
                siteInformationProps={siteInformationProps}
                studyId={routeProps.match.params.studyId}
                sharingUrl={sharingUrl}
                showLinkToEda={showLinkToEda}
              />
            </EDAWorkspaceContainer>
          )}
        />
        <Route
          path={`${path}/:studyId`}
          render={(props: RouteComponentProps<{ studyId: string }>) => (
            <EDAAnalysisListContainer
              studyId={props.match.params.studyId}
              analysisClient={analysisClient}
              subsettingClient={edaClient}
              dataClient={dataClient}
              downloadClient={downloadClient}
              computeClient={computeClient}
              className="MapVEu"
            >
              <AnalysisList
                studyId={props.match.params.studyId}
                analysisStore={analysisClient}
                singleAppMode={singleAppMode}
              />
            </EDAAnalysisListContainer>
          )}
        />
      </Switch>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
