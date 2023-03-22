import { useCallback, useMemo } from 'react';
import { Route, Switch, Redirect } from 'react-router';
import { Link, useRouteMatch } from 'react-router-dom';
import { AnalysisState, useDataClient } from '../core';
import { ComputationInstance } from '../core/components/computations/ComputationInstance';
import { plugins } from '../core/components/computations/plugins';
import { StartPage } from '../core/components/computations/StartPage';
import { PromiseResult } from '../core/components/Promise';
import { EntityCounts } from '../core/hooks/entityCounts';
import { PromiseHookState, usePromise } from '../core/hooks/promise';
import { GeoConfig } from '../core/types/geoConfig';
import { useNonNullableContext } from '@veupathdb/wdk-client/lib/Hooks/NonNullableContext';
import { WdkDependenciesContext } from '@veupathdb/wdk-client/lib/Hooks/WdkDependenciesEffect';
import { FilledButton } from '@veupathdb/coreui/dist/components/buttons';
import AddIcon from '@material-ui/icons/Add';
import { Computation } from '../core/types/visualization';

export interface Props {
  analysisState: AnalysisState;
  totalCounts: PromiseHookState<EntityCounts>;
  filteredCounts: PromiseHookState<EntityCounts>;
  geoConfigs: GeoConfig[];
  singleAppMode?: string;
}

type GroupedAppsArray = [string, Computation[]][];

/**
 * Handles delegating to a UI component based on the route.
 */
export function ComputationRoute(props: Props) {
  const { analysisState, singleAppMode } = props;
  const { url } = useRouteMatch();
  const dataClient = useDataClient();
  const { wdkService } = useNonNullableContext(WdkDependenciesContext);

  const promiseState = usePromise(
    useCallback(async () => {
      let { apps } = await dataClient.getApps();

      const { projectId } = await wdkService.getConfig();
      apps = apps.filter((app) => app.projects.includes(projectId));

      if (singleAppMode) {
        apps = apps.filter((app) => app.name === singleAppMode);
      }

      if (apps == null || !apps.length)
        throw new Error('Could not find any computation app.');

      return apps;
    }, [dataClient, wdkService, singleAppMode])
  );

  /*  
    Callback creates an object that will group apps by type, then returns an array 
    for each type as [appType, computation]. This allows me to map over each appType
    and its corresponding computations.
    Lots of room to improve this approach.
  */
  const appsGroupedByType: GroupedAppsArray = useMemo(() => {
    if (!analysisState.analysis?.descriptor.computations.length) return [];
    const groupingObject: any = {};
    for (const computation of analysisState.analysis?.descriptor.computations) {
      const key = computation.descriptor.type;
      if (!(key in groupingObject)) {
        groupingObject[key] = [computation];
      } else {
        groupingObject[key] = groupingObject[key].concat(computation);
      }
    }
    return Object.entries(groupingObject);
  }, [analysisState]);

  return (
    <PromiseResult state={promiseState}>
      {(apps) => {
        if (singleAppMode) {
          if (analysisState.analysis == null) return;

          const computationType =
            analysisState.analysis.descriptor.computations[0].descriptor.type;

          // Check to ensure analysisState didn't somehow get the wrong app
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
                      visualizationPlugins={plugin.visualizationPlugins}
                      isSingleAppMode={!!singleAppMode}
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
                  <div style={{ width: 'max-content' }}>
                    <Link to={`${url}/new`}>
                      <FilledButton
                        text="New visualization"
                        onPress={() => null}
                        textTransform="none"
                        themeRole="primary"
                        icon={AddIcon}
                        styleOverrides={{
                          container: { margin: '15px 0' },
                        }}
                      />
                    </Link>
                  </div>
                  {
                    /* 
                      Here we're mapping over the grouped apps such that the computation instances are
                      also grouped together within the appType
                    */
                    appsGroupedByType.map((appType) => {
                      const app = apps.find((app) => app.name === appType[0]);
                      const appName = (
                        <h4 style={{ paddingBottom: 0 }}>{app?.displayName}</h4>
                      );
                      const plugin = app && plugins[app.name];
                      return (
                        plugin && (
                          <>
                            {appName}
                            {appType[1].map((c) => {
                              return (
                                <ComputationInstance
                                  {...props}
                                  computationId={c.computationId}
                                  computationAppOverview={app}
                                  visualizationPlugins={
                                    plugin.visualizationPlugins
                                  }
                                  baseUrl={`${url}/${c.computationId}`}
                                  isSingleAppMode={!!singleAppMode}
                                />
                              );
                            })}
                          </>
                        )
                      );
                    })
                  }
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
                      visualizationPlugins={plugin.visualizationPlugins}
                      baseUrl={`${url}/${computation?.computationId}`}
                      isSingleAppMode={!!singleAppMode}
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
