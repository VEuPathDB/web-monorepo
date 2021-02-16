import React from 'react';
import { cx } from './Utils';
import { SessionSummary } from './SessionSummary';
import { useSession, useStudy } from '@veupathdb/eda-workspace-core';
import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import { Redirect, Route } from 'react-router';
import { Variables } from './Variables';

export function EDASession() {
  const {
    history,
    setName,
    copySession,
    saveSession,
    deleteSession,
  } = useSession();
  const { studyRecord } = useStudy();
  if (history.current == null) return null;
  const routeBase = `/eda/${studyRecord.id.map((p) => p.value).join('/')}/${
    history.current.id
  }`;
  return (
    <div className={cx('-Session')}>
      <WorkspaceNavigation
        heading={
          <SessionSummary
            session={history.current}
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
      <Route path={`${routeBase}/variables`} component={Variables} />
      <Route
        path={`${routeBase}/visualizations`}
        component={() => <h3>TODO</h3>}
      />
    </div>
  );
}
