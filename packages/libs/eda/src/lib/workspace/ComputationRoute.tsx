import React, { useCallback } from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { useRouteMatch } from 'react-router-dom';
import { AnalysisState, useDataClient } from '../core';
import { PassThroughComputation } from '../core/components/computations/PassThroughComputation';
import { PromiseResult } from '../core/components/Promise';
import { usePromise } from '../core/hooks/promise';

export interface Props {
  analysisState: AnalysisState;
}

export function ComputationRoute(props: Props) {
  const { analysisState } = props;
  const { url } = useRouteMatch();
  const dataClient = useDataClient();
  const promiseState = usePromise(
    useCallback(async () => {
      const { apps } = await dataClient.getApps();
      const app = apps.find((app) => app.name === 'pass');
      if (app == null)
        throw new Error('Could not find default computation app.');
      return app;
    }, [dataClient])
  );

  // TODO Get configured apps from context.
  // For now, just use passthrough app.
  return (
    <PromiseResult state={promiseState}>
      {(computationAppOverview) => (
        <Switch>
          <Route exact path={url}>
            <Redirect to={`${url}/pass-through`} />
          </Route>
          <Route path={`${url}/pass-through`}>
            <PassThroughComputation
              analysisState={analysisState}
              computationAppOverview={computationAppOverview}
            />
          </Route>
        </Switch>
      )}
    </PromiseResult>
  );
}
