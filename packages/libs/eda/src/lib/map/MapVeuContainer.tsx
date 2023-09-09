import {
  Route,
  RouteComponentProps,
  Switch,
  useRouteMatch,
  useHistory,
} from 'react-router';

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
import { SiteInformationProps } from '.';
import { StudyList } from './StudyList';
import { PublicAnalysesRoute } from '../workspace/PublicAnalysesRoute';
import { ImportAnalysis } from '../workspace/ImportAnalysis';

interface Props {
  edaServiceUrl: string;
  singleAppMode?: string;
  siteInformationProps: SiteInformationProps;
  sharingUrl: string;
}

export function MapVeuContainer(mapVeuContainerProps: Props) {
  const { singleAppMode, siteInformationProps, edaServiceUrl, sharingUrl } =
    mapVeuContainerProps;
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

  // This will get the matched path of the active parent route.
  // This is useful so we don't have to hardcode the path root.
  const { path } = useRouteMatch();
  return (
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
              analysisId={routeProps.match.params.analysisId}
              siteInformationProps={siteInformationProps}
              studyId={routeProps.match.params.studyId}
              sharingUrl={sharingUrl}
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
  );
}
