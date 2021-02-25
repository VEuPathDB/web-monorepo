import React from 'react';
import { cx } from './Utils';
import { SessionSummary } from './SessionSummary';
import { useSession, useStudyRecord } from '@veupathdb/eda-workspace-core';
import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import { Redirect, Route, RouteComponentProps } from 'react-router';
import { VariablesRoute } from './Variables';

interface Props {
  sessionId: string;
}

export function EDASession(props: Props) {
  const { sessionId } = props;
  const {
    session,
    setName,
    copySession,
    saveSession,
    deleteSession,
  } = useSession(sessionId);
  const studyRecord = useStudyRecord();
  if (session == null) return null;
  const routeBase = `/eda/${studyRecord.id.map((p) => p.value).join('/')}/${
    session.id
  }`;
  return (
    <div className={cx('-Session')}>
      <WorkspaceNavigation
        heading={
          <SessionSummary
            session={session}
            setSessionName={setName}
            copySession={copySession}
            saveSession={saveSession}
            deleteSession={deleteSession}
          />
        }
        routeBase={routeBase}
        items={[
          {
            display: 'Browse and subset',
            route: '/variables',
          },
          {
            display: 'Visualize',
            route: '/visualizations',
          },
        ]}
      />
      <Route
        path={routeBase}
        exact
        render={() => <Redirect to={`${routeBase}/variables`} />}
      />
      <Route
        path={`${routeBase}/variables/:entityId?/:variableId?`}
        render={(
          props: RouteComponentProps<{ entityId?: string; variableId?: string }>
        ) => <VariablesRoute sessionId={session.id} {...props.match.params} />}
      />
      <Route
        path={`${routeBase}/visualizations`}
        component={() => <h3>TODO</h3>}
      />
    </div>
  );
}
