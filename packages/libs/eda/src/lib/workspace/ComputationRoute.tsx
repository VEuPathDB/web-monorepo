import { Tooltip } from '@material-ui/core';
import React, { useCallback } from 'react';
import { ComponentType } from 'react-redux/node_modules/@types/react';
import { Route, Switch } from 'react-router';
import { Link, useRouteMatch } from 'react-router-dom';
import { AnalysisState, useDataClient } from '../core';
import { AlphaDivComputation } from '../core/components/computations/AlphaDivComputation';
import { PassThroughComputation } from '../core/components/computations/PassThroughComputation';
import { PromiseResult } from '../core/components/Promise';
import { EntityCounts } from '../core/hooks/entityCounts';
import { PromiseHookState, usePromise } from '../core/hooks/promise';
import { ComputationAppOverview } from '../core/types/visualization';

export interface Props {
  analysisState: AnalysisState;
  totalCounts: PromiseHookState<EntityCounts>;
  filteredCounts: PromiseHookState<EntityCounts>;
}

interface ComputationProps extends Props {
  computationAppOverview: ComputationAppOverview;
}

const components: Record<string, ComponentType<ComputationProps>> = {
  pass: PassThroughComputation,
  alphadiv: AlphaDivComputation,
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
            <div>
              <h4>Please choose a computation app</h4>
              <ul>
                {apps.map((app) => (
                  <li key={app.name}>
                    <Tooltip title={app.description ?? ''}>
                      <Link to={`${url}/${app.name}`}>{app.displayName}</Link>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </div>
          </Route>
          {apps.map((app) => {
            const ComputationComponent = components[app.name];
            if (ComputationComponent == null) return null;
            return (
              <Route path={`${url}/${app.name}`}>
                <ComputationComponent {...props} computationAppOverview={app} />
              </Route>
            );
          })}
          <Route>
            <div>App not yet implemented</div>
          </Route>
        </Switch>
      )}
    </PromiseResult>
  );
}
