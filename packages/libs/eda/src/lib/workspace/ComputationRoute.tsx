import React, { useCallback } from 'react';
import { Route, Switch } from 'react-router';
import { useRouteMatch } from 'react-router-dom';
import { AnalysisState, useDataClient } from '../core';
import { AlphaDivComputation } from '../core/components/computations/implementations/alphaDiv';
import { StartPage } from '../core/components/computations/StartPage';
import { PromiseResult } from '../core/components/Promise';
import { EntityCounts } from '../core/hooks/entityCounts';
import { PromiseHookState, usePromise } from '../core/hooks/promise';
import { ComputationPlugin } from '../core/components/computations/Types';
import { ZeroConfigWithButton } from '../core/components/computations/ZeroConfiguration';
import { ComputationInstance } from '../core/components/computations/ComputationInstance';

export interface Props {
  analysisState: AnalysisState;
  totalCounts: PromiseHookState<EntityCounts>;
  filteredCounts: PromiseHookState<EntityCounts>;
}

const components: Record<string, ComputationPlugin> = {
  pass: {
    configurationComponent: ZeroConfigWithButton,
  },
  alphadiv: {
    configurationComponent: AlphaDivComputation,
  },
};

/**
 * Handles delegating to a UI component based on the route.
 */
export function ComputationRoute(props: Props) {
  const { url } = useRouteMatch();
  const dataClient = useDataClient();
  const promiseState = usePromise(
    useCallback(() => dataClient.getApps(), [dataClient])
  );

  return (
    <PromiseResult state={promiseState}>
      {({ apps }) => (
        <Switch>
          <Route exact path={url}>
            <StartPage baseUrl={url} apps={apps} {...props} />
          </Route>
          {apps.map((app) => {
            const plugin = components[app.name];
            if (plugin == null)
              return (
                <Route exact path={`${url}/new/${app.name}`}>
                  <div>App not yet implemented</div>
                </Route>
              );
            return (
              <Route exact path={`${url}/new/${app.name}`}>
                <plugin.configurationComponent
                  {...props}
                  computationAppOverview={app}
                />
              </Route>
            );
          })}
          <Route
            path={`${url}/:id`}
            render={(routeProps) => {
              const computation = props.analysisState.analysis?.descriptor.computations.find(
                (c) => c.computationId === routeProps.match.params.id
              );
              const app = apps.find(
                (app) => app.name === computation?.descriptor.type
              );
              if (app == null) return <div>Cannot find app!</div>;
              return (
                <ComputationInstance
                  {...props}
                  computationId={routeProps.match.params.id}
                  computationAppOverview={app}
                />
              );
            }}
          />
        </Switch>
      )}
    </PromiseResult>
  );
}
