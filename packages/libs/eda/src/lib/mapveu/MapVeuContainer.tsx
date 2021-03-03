import { EDASessionListContainer, EDAWorkspaceContainer } from '../core';
import { SubsettingClient } from '../core/api/subsetting-api';
import React from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  useRouteMatch,
} from 'react-router';
import { SessionList } from './MapVeuSessionList';
import { MapVeuSession } from './MapVeuSession';
import { mockSessionStore } from './Mocks';
import { DataClient } from '../core/api/data-api';
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
  return (
    <>
      <h1>MapVEu</h1>
      <Switch>
        <Route
          path={`${path}/:studyId/:sessionId`}
          render={(
            props: RouteComponentProps<{ studyId: string; sessionId: string }>
          ) => (
            <EDAWorkspaceContainer
              studyId={props.match.params.studyId}
              sessionId={props.match.params.sessionId}
              subsettingClient={edaClient}
              sessionClient={mockSessionStore}
              dataClient={dataClient}
            >
              <MapVeuSession sessionId={props.match.params.sessionId} />
            </EDAWorkspaceContainer>
          )}
        />
        <Route
          path={`${path}/:studyId`}
          render={(props: RouteComponentProps<{ studyId: string }>) => (
            <EDASessionListContainer
              studyId={props.match.params.studyId}
              sessionClient={mockSessionStore}
              subsettingClient={edaClient}
              dataClient={dataClient}
            >
              <SessionList
                studyId={props.match.params.studyId}
                sessionStore={mockSessionStore}
              />
            </EDASessionListContainer>
          )}
        />
        <Route path={path} component={StudyList} />
      </Switch>
    </>
  );
}
