import {
  Route,
  RouteComponentProps,
  Switch,
  useRouteMatch,
} from 'react-router';

import { EDAAnalysisListContainer, EDAWorkspaceContainer } from '../core';

import { AnalysisList } from './MapVeuAnalysisList';
import { MapVeuAnalysis } from './MapVeuAnalysis';

import { StudyList } from './StudyList';
import {
  useConfiguredSubsettingClient,
  useConfiguredDataClient,
  useConfiguredAnalysisClient,
  useConfiguredDownloadClient,
} from '../core/hooks/client';

export function MapVeuContainer() {
  const edaClient = useConfiguredSubsettingClient('/eda-subsetting-service');
  const dataClient = useConfiguredDataClient('/eda-data-service');
  const analysisClient = useConfiguredAnalysisClient('/eda-user-service');
  const downloadClient = useConfiguredDownloadClient('/eda-user-service');

  // This will get the matched path of the active parent route.
  // This is useful so we don't have to hardcode the path root.
  const { path } = useRouteMatch();
  return (
    <>
      <h1>MapVEu</h1>
      <Switch>
        <Route
          path={`${path}/:studyId/:analysisId`}
          render={(
            props: RouteComponentProps<{ studyId: string; analysisId: string }>
          ) => (
            <EDAWorkspaceContainer
              studyId={props.match.params.studyId}
              subsettingClient={edaClient}
              analysisClient={analysisClient}
              dataClient={dataClient}
              downloadClient={downloadClient}
            >
              <MapVeuAnalysis
                analysisId={props.match.params.analysisId}
                studyId={props.match.params.studyId}
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
            >
              <AnalysisList
                studyId={props.match.params.studyId}
                analysisStore={analysisClient}
              />
            </EDAAnalysisListContainer>
          )}
        />
        <Route path={path} component={StudyList} />
      </Switch>
    </>
  );
}
