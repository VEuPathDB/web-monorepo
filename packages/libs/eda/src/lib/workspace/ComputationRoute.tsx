import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { useRouteMatch } from 'react-router-dom';
import { SessionState } from '../core';
import { PassThroughComputation } from '../core/components/computations/PassThroughComputation';

export interface Props {
  sessionState: SessionState;
}

export function ComputationRoute(props: Props) {
  const { sessionState } = props;
  const { url } = useRouteMatch();

  // TODO Get configured apps from context.
  // For now, just use passthrough app.
  return (
    <>
      <Switch>
        <Route exact path={url}>
          <Redirect to={`${url}/pass-through`} />
        </Route>
        <Route path={`${url}/pass-through`}>
          <PassThroughComputation sessionState={sessionState} />
        </Route>
      </Switch>
    </>
  );
}
