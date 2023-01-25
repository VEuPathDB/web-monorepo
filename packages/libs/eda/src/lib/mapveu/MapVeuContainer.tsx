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
  useConfiguredComputeClient,
} from '../core/hooks/client';

import './MapVEu.scss';

export function MapVeuContainer() {
  const edaClient = useConfiguredSubsettingClient('/eda-subsetting-service');
  const dataClient = useConfiguredDataClient('/eda-data-service');
  const computeClient = useConfiguredComputeClient('/eda-data-service');
  const analysisClient = useConfiguredAnalysisClient('/eda-user-service');
  const downloadClient = useConfiguredDownloadClient('/eda-user-service');

  // This will get the matched path of the active parent route.
  // This is useful so we don't have to hardcode the path root.
  const { path } = useRouteMatch();
  return (
    <>
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
              computeClient={computeClient}
              className="MapVEu"
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
              computeClient={computeClient}
              className="MapVEu"
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
