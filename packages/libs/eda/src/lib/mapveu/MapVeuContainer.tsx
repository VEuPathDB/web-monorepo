import React from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  useRouteMatch,
} from 'react-router';

import { EDAAnalysisListContainer, EDAWorkspaceContainer } from '../core';
import { DataClient } from '../core/api/data-api';
import { SubsettingClient } from '../core/api/subsetting-api';
import { useConfiguredAnalysisClient } from '../core/hooks/analysisClient';

import { AnalysisList } from './MapVeuAnalysisList';
import { MapVeuAnalysis } from './MapVeuAnalysis';
import { StudyList } from './StudyList';

const edaClient = new (class extends SubsettingClient {
  getStudyMetadata() {
    // Temporarily hardcode a study id. We don't yet have a way to
    // discover the id used by the subsetting service, from the WDK
    // study record.
    return super.getStudyMetadata('SCORECX01-1');
  }
})({ baseUrl: '/eda-subsetting-service' });

const dataClient = new DataClient({ baseUrl: '/eda-data-service' });

export function MapVeuContainer() {
  // This will get the matched path of the active parent route.
  // This is useful so we don't have to hardcode the path root.
  const { path } = useRouteMatch();
  const analysisClient = useConfiguredAnalysisClient('/eda-user-service');
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
            >
              <MapVeuAnalysis analysisId={props.match.params.analysisId} />
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
