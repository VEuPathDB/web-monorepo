import { useRouteMatch } from 'react-router-dom';
import { useHistory } from 'react-router';
import { ComputationAppOverview } from '../../types/visualization';
import { ComputationPlugin } from './Types';
import { orderBy, isEqual } from 'lodash';
import { H5, H6 } from '@veupathdb/coreui';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import '../visualizations/Visualizations.scss';
import { Tooltip } from '@material-ui/core';
import { useDefaultPluginConfiguration } from './getAppsDefaultConfigs';
import { AnalysisState } from '../../../core';
import { createComputation } from '../../../core/components/computations/Utils';
import { v4 as uuid } from 'uuid';

interface Props {
  analysisState: AnalysisState;
  baseUrl: string;
  apps: ComputationAppOverview[];
  plugins: Record<string, ComputationPlugin>;
}

export function StartPage(props: Props) {
  const { analysisState, apps, plugins } = props;
  const cx = makeClassNameHelper('VisualizationsContainer');
  const defaultConfigs = useDefaultPluginConfiguration(apps);
  const history = useHistory();
  const { url } = useRouteMatch();

  // Used temporarily to render a disabled scatterplot for betadiv
  const helperPlugin = plugins['alphadiv'];

  return (
    apps &&
    plugins && (
      <div>
        <H5
          text={'Select a visualization'}
          additionalStyles={{ marginTop: 15, marginBottom: 5 }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* orderBy renders available apps ahead of those in development */}
          {orderBy(apps, [(app) => (plugins[app.name] ? 1 : 0)], ['desc']).map(
            (app) => (
              <div
                style={{
                  display: 'flex',
                  padding: '1em',
                  margin: '1em 0',
                }}
                key={app.name}
              >
                <div style={{ width: '25em', margin: '0 8em' }}>
                  <H6
                    text={app.displayName}
                    additionalStyles={{ margin: 0, marginBottom: 5 }}
                  />
                  <span
                    style={{
                      fontWeight: '300',
                      marginTop: '0.5em',
                    }}
                  >
                    {app.description}
                  </span>
                </div>
                {app.visualizations?.map((vizType, index) => {
                  const disabled = plugins[app.name] === undefined;
                  const VizSelector = plugins[app.name]
                    ? plugins[app.name].visualizationTypes[vizType.name]
                        .selectorComponent
                    : helperPlugin.visualizationTypes['scatterplot']
                        .selectorComponent;
                  return (
                    <div
                      className={cx('-PickerEntry', disabled && 'disabled')}
                      key={`${app.name}-vizType-${index}`}
                      style={{
                        margin: '0 3em',
                      }}
                    >
                      <Tooltip title={<>{vizType.description}</>}>
                        {/* 
                          The span element removes the following MUI error: 
                          "Material-UI: You are providing a disabled `button` child to the Tooltip component." 
                        */}
                        <span>
                          <button
                            disabled={disabled}
                            style={{
                              cursor: disabled ? 'not-allowed' : 'pointer',
                            }}
                            onClick={async () => {
                              if (analysisState.analysis == null) return;
                              const computations =
                                analysisState.analysis.descriptor.computations;
                              const defaultConfig = defaultConfigs.find(
                                (config) => config?.name === app.name
                              );
                              /*
                                The first instance of a configurable app will be derived by a default configuration.
                                Here we're checking if a computation with a defaultConfig already exists.
                              */
                              const existingComputation = computations.find(
                                (c) =>
                                  isEqual(
                                    c.descriptor.configuration,
                                    defaultConfig?.configuration
                                  ) && app.name === c.descriptor.type
                              );
                              const visualizationId = uuid();
                              const newVisualization = {
                                visualizationId,
                                displayName: 'Unnamed visualization',
                                descriptor: {
                                  type: vizType.name!,
                                  configuration: plugins[
                                    app.name
                                  ].visualizationTypes[
                                    vizType.name
                                  ].createDefaultConfig(),
                                },
                              };
                              if (!existingComputation) {
                                const computation = createComputation(
                                  app.name,
                                  //@ts-ignore
                                  defaultConfig
                                    ? defaultConfig.displayName
                                    : '',
                                  //@ts-ignore
                                  defaultConfig
                                    ? defaultConfig.configuration
                                    : null,
                                  computations,
                                  [newVisualization]
                                );
                                const newAnalysisId = await analysisState.setComputations(
                                  [computation, ...computations]
                                );
                                const urlBase = newAnalysisId
                                  ? url.replace('new', newAnalysisId)
                                  : url;
                                history.push(
                                  urlBase.replace(
                                    'new',
                                    `${computation.computationId}/${visualizationId}`
                                  )
                                );
                              } else {
                                const updatedComputation = {
                                  ...existingComputation,
                                  visualizations: existingComputation.visualizations.concat(
                                    newVisualization
                                  ),
                                };
                                analysisState.setComputations([
                                  updatedComputation,
                                  ...computations.filter(
                                    (c) =>
                                      c.computationId !==
                                      updatedComputation.computationId
                                  ),
                                ]);
                                const urlBase = url.replace(
                                  'new',
                                  existingComputation.computationId
                                );
                                history.push(`${urlBase}/${visualizationId}`);
                              }
                            }}
                          >
                            <VizSelector {...app} />
                          </button>
                        </span>
                      </Tooltip>
                      <div className={cx('-PickerEntryName')}>
                        <div>
                          {vizType.displayName
                            ?.split(/(, )/g)
                            .map((str) => (str === ', ' ? <br /> : str))}
                        </div>
                        {disabled && <i>(Coming soon!)</i>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    )
  );
}
