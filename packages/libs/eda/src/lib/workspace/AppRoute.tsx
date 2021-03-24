import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { useRouteMatch } from 'react-router-dom';
import { PassThroughApp } from '../core/components/apps/PassThroughApp';

export interface Props {
  sessionId: string;
}

export function AppRoute(props: Props) {
  const { sessionId } = props;
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
          <PassThroughApp sessionId={sessionId} />
        </Route>
      </Switch>
    </>
  );
}
