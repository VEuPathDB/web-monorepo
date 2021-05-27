import React from 'react';
import { cx } from './Utils';
import { SessionSummary } from './SessionSummary';
import { EntityDiagram, Status, StudyEntity, useSession } from '../core';
import WorkspaceNavigation from '@veupathdb/wdk-client/lib/Components/Workspace/WorkspaceNavigation';
import {
  Redirect,
  Route,
  RouteComponentProps,
  useRouteMatch,
} from 'react-router';
import { ComputationRoute } from './ComputationRoute';
import { DefaultVariableRedirect } from './DefaultVariableRedirect';
import { Subsetting } from './Subsetting';
import { useEntityCounts } from '../core/hooks/entityCounts';
import { uniq } from 'lodash';

interface Props {
  sessionId: string;
}

export function SessionPanel(props: Props) {
  const { sessionId } = props;
  const sessionState = useSession(sessionId);
  const {
    status,
    session,
    setName,
    copySession,
    saveSession,
    deleteSession,
  } = sessionState;
  const { url: routeBase } = useRouteMatch();
  const totalCounts = useEntityCounts();
  const filteredCounts = useEntityCounts(sessionState.session?.filters);
  const filteredEntities = uniq(
    sessionState.session?.filters.map((f) => f.entityId)
  );
  if (status === Status.Error)
    return (
      <div>
        <h2>Error</h2>
        <p>Could not load the analysis session.</p>
      </div>
    );
  if (session == null) return null;
  return (
    <div className={cx('-Session')}>
      <WorkspaceNavigation
        heading={
          <>
            <SessionSummary
              session={session}
              setSessionName={setName}
              copySession={copySession}
              saveSession={saveSession}
              deleteSession={deleteSession}
            />
            <Route
              path={[`${routeBase}/variables/:entityId?`, `${routeBase}`]}
              render={(props: RouteComponentProps<{ entityId?: string }>) => (
                <div className="Entities">
                  <EntityDiagram
                    expanded
                    orientation="horizontal"
                    selectedEntity={props.match.params.entityId}
                    entityCounts={totalCounts.value}
                    filteredEntityCounts={filteredCounts.value}
                    filteredEntities={filteredEntities}
                  />
                </div>
              )}
            />
          </>
        }
        routeBase={routeBase}
        items={[
          {
            display: 'Browse and subset',
            route: '/variables',
            exact: false,
          },
          {
            display: 'Visualize',
            route: '/visualizations',
            exact: false,
          },
        ]}
      />
      <Route
        path={routeBase}
        exact
        render={() => <Redirect to={`${routeBase}/variables`} />}
      />
      <Route
        path={`${routeBase}/variables/:entityId?`}
        exact
        render={(props) => <DefaultVariableRedirect {...props.match.params} />}
      />
      <Route
        path={`${routeBase}/variables/:entityId/:variableId`}
        exact
        render={(
          props: RouteComponentProps<{ entityId: string; variableId: string }>
        ) => <Subsetting sessionState={sessionState} {...props.match.params} />}
      />
      <Route
        path={`${routeBase}/visualizations`}
        render={() => <ComputationRoute sessionState={sessionState} />}
      />
    </div>
  );
}
