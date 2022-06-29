import { useRouteMatch } from 'react-router-dom';
import { useHistory } from 'react-router';
import { ComputationAppOverview } from '../../types/visualization';
import { ComputationPlugin } from './Types';
import { orderBy, isEqual } from 'lodash';
import { H5, H6 } from '@veupathdb/coreui';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import '../visualizations/Visualizations.scss';
import { Tooltip } from '@material-ui/core';
import { AnalysisState } from '../../../core';
import { createComputation } from '../../../core/components/computations/Utils';
import { v4 as uuid } from 'uuid';
import { useStudyMetadata } from '../../';
import PlaceholderIcon from '../visualizations/PlaceholderIcon';

interface Props {
  analysisState: AnalysisState;
  baseUrl: string;
  apps: ComputationAppOverview[];
  plugins: Record<string, ComputationPlugin>;
}

export function StartPage(props: Props) {
  const { analysisState, apps, plugins } = props;
  const cx = makeClassNameHelper('VisualizationsContainer');
  const studyMetadata = useStudyMetadata();
  const history = useHistory();
  const { url } = useRouteMatch();

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
                  display: 'grid',
                  gridTemplateColumns: 'auto 4fr',
                  padding: '1em',
                  margin: '1em 0',
                }}
                key={app.name}
              >
                <div style={{ width: '300px', margin: '0 8em' }}>
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
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    rowGap: '2em',
                  }}
                >
                  {app.visualizations?.map((vizType, index) => {
                    const plugin = plugins[app.name];
                    const disabled =
                      !plugin || !plugin.visualizationTypes[vizType.name];
                    const VizSelector =
                      plugin && plugin.visualizationTypes[vizType.name]
                        ? plugin.visualizationTypes[vizType.name]
                            .selectorComponent
                        : undefined;

                    return (
                      <div
                        className={cx('-PickerEntry', disabled && 'disabled')}
                        key={`vizType${index}`}
                        style={{
                          margin: '0 3em',
                        }}
                      >
                        <Tooltip title={<>{vizType.description}</>}>
                          <button
                            style={{
                              cursor: disabled ? 'not-allowed' : 'cursor',
                            }}
                            disabled={disabled}
                            onClick={async () => {
                              if (analysisState.analysis == null) return;
                              const computations =
                                analysisState.analysis.descriptor.computations;
                              const defaultComputationSpec =
                                plugin &&
                                plugin.createDefaultComputationSpec != null
                                  ? plugin.createDefaultComputationSpec(
                                      studyMetadata.rootEntity
                                    )
                                  : {
                                      configuration: undefined,
                                      displayName: '',
                                    };
                              /*
                                The first instance of a configurable app will be derived by a default configuration.
                                Here we're checking if a computation with a defaultConfig already exists.
                              */
                              const existingComputation = computations.find(
                                (c) =>
                                  isEqual(
                                    c.descriptor.configuration,
                                    'configuration' in defaultComputationSpec
                                      ? defaultComputationSpec.configuration
                                      : {}
                                  ) && app.name === c.descriptor.type
                              );
                              const visualizationId = uuid();
                              const newVisualization = {
                                visualizationId,
                                displayName: 'Unnamed visualization',
                                descriptor: {
                                  type: vizType.name!,
                                  configuration: plugin.visualizationTypes[
                                    vizType.name
                                  ].createDefaultConfig(),
                                },
                              };
                              if (!existingComputation) {
                                const computation = createComputation(
                                  app.name,
                                  defaultComputationSpec.configuration,
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
                            {VizSelector ? (
                              <VizSelector {...app} />
                            ) : (
                              <PlaceholderIcon name={vizType.name} />
                            )}
                          </button>
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
              </div>
            )
          )}
        </div>
      </div>
    )
  );
}
