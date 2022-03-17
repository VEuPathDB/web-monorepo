import React, { useCallback } from 'react';
import { Route, Switch, useHistory, Redirect } from 'react-router';
import { Link, useRouteMatch } from 'react-router-dom';
import { AnalysisState, useDataClient } from '../core';
import { ComputationInstance } from '../core/components/computations/ComputationInstance';
import { plugins } from '../core/components/computations/plugins';
import { StartPage } from '../core/components/computations/StartPage';
import { createComputation } from '../core/components/computations/Utils';
import { PromiseResult } from '../core/components/Promise';
import { EntityCounts } from '../core/hooks/entityCounts';
import { PromiseHookState, usePromise } from '../core/hooks/promise';
import { GeoConfig } from '../core/types/geoConfig';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';

export interface Props {
  analysisState: AnalysisState;
  totalCounts: PromiseHookState<EntityCounts>;
  filteredCounts: PromiseHookState<EntityCounts>;
  geoConfigs: GeoConfig[];
  singleAppMode?: string;
}

/**
 * Handles delegating to a UI component based on the route.
 */
export function ComputationRoute(props: Props) {
  const { analysisState, singleAppMode } = props;
  const { url } = useRouteMatch();
  const history = useHistory();
  const dataClient = useDataClient();
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);

  const promiseState = usePromise(
    useCallback(async () => {
      let { apps } = await dataClient.getApps();

      const { projectId } = await wdkService.getConfig();
      apps = apps.filter((app) => app.projects?.includes(projectId));

      if (singleAppMode) {
        apps = apps.filter((app) => app.name === singleAppMode);
      }

      if (apps == null || !apps.length)
        throw new Error('Could not find any computation app.');

      return apps;
    }, [dataClient, wdkService, singleAppMode])
  );

  return (
    <PromiseResult state={promiseState}>
      {(apps) => {
        if (singleAppMode) {
          if (analysisState.analysis == null) return;

          const computations = analysisState.analysis.descriptor.computations;

          // The pass app's id should be 'pass-through' for backwards compatability
          const singleAppComputationId =
            singleAppMode === 'pass' ? 'pass-through' : singleAppMode;

          let computation = props.analysisState.analysis?.descriptor.computations.find(
            (c) => c.computationId === singleAppComputationId
          );

          // If we don't yet have a computation instance, we need to make one
          if (computation == null) {
            computation = createComputation(
              apps[0],
              singleAppMode,
              null,
              computations,
              singleAppComputationId
            );
            analysisState.setComputations([computation]);
          }

          return (
            <Switch>
              <Route exact path={url}>
                <Redirect to={`${url}/${singleAppComputationId}`} />
              </Route>
              <Route
                path={`${url}/${singleAppComputationId}`}
                render={() => {
                  const plugin = apps[0] && plugins[apps[0].name];
                  if (apps[0] == null || plugin == null)
                    return <div>Cannot find app!</div>;
                  return (
                    <ComputationInstance
                      {...props}
                      computationId={singleAppComputationId}
                      computationAppOverview={apps[0]}
                      visualizationTypes={plugin.visualizationTypes}
                    />
                  );
                }}
              />
            </Switch>
          );
        } else {
          return (
            <Switch>
              <Route exact path={url}>
                <StartPage baseUrl={url} apps={apps} {...props} />
                <div>
                  <h2>Saved apps</h2>
                  <ul>
                    {analysisState.analysis?.descriptor.computations.map(
                      (c) => (
                        <li>
                          <Link to={`${url}/${c.computationId}`}>
                            {c.displayName ?? 'No name'} &mdash;{' '}
                            {c.descriptor.type}
                          </Link>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </Route>
              {apps.map((app) => {
                const plugin = plugins[app.name];
                const addComputation = (
                  name: string,
                  configuration: unknown
                ) => {
                  if (analysisState.analysis == null) return;
                  const computations =
                    analysisState.analysis.descriptor.computations;
                  const computation = createComputation(
                    app,
                    name,
                    configuration,
                    computations
                  );
                  analysisState.setComputations([computation, ...computations]);
                  history.push(`${url}/${computation.computationId}`);
                };

                return (
                  <Route exact path={`${url}/new/${app.name}`}>
                    {plugin ? (
                      <plugin.configurationComponent
                        {...props}
                        computationAppOverview={app}
                        addNewComputation={addComputation}
                      />
                    ) : (
                      <div>App not yet implemented</div>
                    )}
                  </Route>
                );
              })}
              <Route
                path={`${url}/:id`}
                render={(routeProps) => {
                  // These are routes for the computation instances already saved
                  const computation = props.analysisState.analysis?.descriptor.computations.find(
                    (c) => c.computationId === routeProps.match.params.id
                  );
                  const app = apps.find(
                    (app) => app.name === computation?.descriptor.type
                  );
                  const plugin = app && plugins[app.name];
                  if (app == null || plugin == null)
                    return <div>Cannot find app!</div>;
                  return (
                    <ComputationInstance
                      {...props}
                      computationId={routeProps.match.params.id}
                      computationAppOverview={app}
                      visualizationTypes={plugin.visualizationTypes}
                    />
                  );
                }}
              />
            </Switch>
          );
        }
      }}
    </PromiseResult>
  );
}
