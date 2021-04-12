import React, { useCallback } from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { useRouteMatch } from 'react-router-dom';
import { SessionState, useDataClient } from '../core';
import { PassThroughComputation } from '../core/components/computations/PassThroughComputation';
import { usePromise } from '../core/hooks/promise';

export interface Props {
  sessionState: SessionState;
}

export function ComputationRoute(props: Props) {
  const { sessionState } = props;
  const { url } = useRouteMatch();
  const dataClient = useDataClient();
  const computations = usePromise(
    useCallback(() => dataClient.getApps(), [dataClient])
  );
  const computationAppOverview = computations.value?.apps.find(
    (app) => app.name === 'pass'
  );
  if (computationAppOverview == null) return null;

  // TODO Get configured apps from context.
  // For now, just use passthrough app.
  return (
    <>
      <Switch>
        <Route exact path={url}>
          <Redirect to={`${url}/pass-through`} />
        </Route>
        <Route path={`${url}/pass-through`}>
          <PassThroughComputation
            sessionState={sessionState}
            computationAppOverview={computationAppOverview}
          />
        </Route>
      </Switch>
    </>
  );
}
