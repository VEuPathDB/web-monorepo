import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { useRouteMatch } from 'react-router-dom';
import { PassThroughApp } from '../core/components/apps/PassThroughApp';

export function VisualizationsRoute() {
  const { url } = useRouteMatch();

  // TODO Get configured apps from context.
  // For now, just use passthrough app.
  return (
    <>
      <Switch>
        <Route
          exact
          path={url}
          render={() => <Redirect to={`${url}/pass-through`} />}
        />
        <Route path={`${url}/pass-through`} component={PassThroughApp} />
      </Switch>
    </>
  );
}
