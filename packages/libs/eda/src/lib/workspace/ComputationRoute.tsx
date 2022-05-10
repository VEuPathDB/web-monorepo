import { useCallback } from 'react';
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
// alphadiv abundance
import { ComputationConfiguration } from '../core/types/visualization';

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

          const computationType =
            analysisState.analysis.descriptor.computations[0].descriptor.type;

          // Check to ensure ananlysisState didn't somehow get the wrong app
          if (computationType !== singleAppMode) {
            throw new Error('Incompatible app type supplied.');
          }

          // Note: the pass app's id will be 'pass-through' for backwards compatability
          const singleAppComputationId =
            analysisState.analysis.descriptor.computations[0].computationId;

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
              <Route exact path={`${url}`}>
                <div>
                  <div>
                    <Link to={`${url}/new`}>
                      {' '}
                      <h2>+ New module</h2>
                    </Link>
                  </div>
                  <br></br>
                  <h2>Saved modules and vizs</h2>
                  <hr></hr>
                  {analysisState.analysis?.descriptor.computations.map((c) => {
                    const app = apps.find(
                      (app) => app.name === c.descriptor.type
                    );
                    const plugin = app && plugins[app.name];
                    return (
                      plugin && (
                        <ComputationInstance
                          {...props}
                          computationId={c.computationId}
                          computationAppOverview={app}
                          visualizationTypes={plugin.visualizationTypes}
                          baseUrl={`${url}/${c.computationId}`}
                        />
                      )
                    );
                  })}
                </div>
              </Route>
              <Route exact path={`${url}/new`}>
                <StartPage
                  baseUrl={`${url}`}
                  apps={apps}
                  plugins={plugins}
                  {...props}
                />
              </Route>
              {apps.map((app) => {
                const plugin = plugins[app.name];
                const addComputation = (
                  name: string,
                  configuration: ComputationConfiguration
                ) => {
                  if (analysisState.analysis == null) return;
                  const computations =
                    analysisState.analysis.descriptor.computations;
                  const computation = createComputation(
                    app.name,
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
                      baseUrl={`${url}/${computation?.computationId}`}
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
