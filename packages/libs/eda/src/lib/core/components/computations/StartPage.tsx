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
import { useVizIconColors } from '../visualizations/implementations/selectorIcons/types';

interface Props {
  analysisState: AnalysisState;
  apps: ComputationAppOverview[];
  plugins: Partial<Record<string, ComputationPlugin>>;
  onVisualizationCreated: (
    visualizationId: string,
    computationId: string
  ) => void;
  showHeading?: boolean;
  tightLayout?: boolean; // the implementation of this is open to improvement!
  applicationContext?: string;
}

export function StartPage(props: Props) {
  const {
    analysisState,
    apps,
    plugins,
    onVisualizationCreated,
    showHeading = true,
    tightLayout = false,
    applicationContext = null,
  } = props;
  const cx = makeClassNameHelper('VisualizationsContainer');
  const studyMetadata = useStudyMetadata();
  const colors = useVizIconColors();

  return (
    apps &&
    plugins && (
      <div>
        {showHeading && (
          <H5
            text={'Select a visualization'}
            additionalStyles={{ marginTop: 15, marginBottom: 5 }}
          />
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* orderBy renders available apps ahead of those in development */}
          {apps
            .filter((app) => plugins[app.name] != null)
            .map((app) => {
              const isAppDisabled =
                plugins[app.name]?.isEnabledInPicker &&
                //@ts-ignore
                !plugins[app.name]?.isEnabledInPicker({ studyMetadata });
              return (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: tightLayout ? 'auto' : 'auto 4fr',
                    padding: tightLayout ? '0em' : '1em',
                    margin: '1em 0',
                  }}
                  className={cx('-AppPicker', isAppDisabled && 'disabled')}
                  key={app.name}
                >
                  <div
                    style={
                      tightLayout
                        ? { width: '100%' }
                        : { width: '300px', margin: '0 8em' }
                    }
                  >
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
                      {isAppDisabled && (
                        <span
                          style={{
                            fontWeight: '500',
                          }}
                        >
                          <br />
                          <br />
                          <br />
                          Not available for this study. <br />
                          {plugins[app.name]?.studyRequirements}
                        </span>
                      )}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      rowGap: '2em',
                    }}
                  >
                    {app.visualizations.map((viz, index) => {
                      const plugin = plugins[app.name];
                      const vizPlugin =
                        plugin && plugin.visualizationPlugins[viz.name];
                      const disabled =
                        !plugin ||
                        !vizPlugin ||
                        (vizPlugin?.isEnabledInPicker != null &&
                          //@ts-ignore
                          vizPlugin?.isEnabledInPicker({}) === false) ||
                        isAppDisabled;
                      return (
                        <div
                          className={cx('-PickerEntry', disabled && 'disabled')}
                          key={`vizType${index}`}
                          style={{
                            margin: tightLayout ? '1em 1em' : '0 3em',
                          }}
                        >
                          <Tooltip title={<>{viz.description}</>}>
                            <button
                              style={{
                                cursor: disabled ? 'not-allowed' : 'cursor',
                              }}
                              disabled={disabled}
                              onClick={async () => {
                                if (
                                  analysisState.analysis == null ||
                                  plugin == null ||
                                  vizPlugin == null
                                )
                                  return;
                                const computations =
                                  analysisState.analysis.descriptor
                                    .computations;
                                const defaultComputationConfig =
                                  plugin.createDefaultConfiguration(
                                    studyMetadata.rootEntity
                                  );
                                /*
                                  The first instance of a configurable app will be derived by a default configuration.
                                  Here we're checking if a computation with a defaultConfig already exists.
                                */
                                const existingComputation = computations.find(
                                  (c) =>
                                    isEqual(
                                      c.descriptor.configuration,
                                      defaultComputationConfig
                                    ) && app.name === c.descriptor.type
                                );
                                const visualizationId = uuid();
                                const newVisualization = {
                                  visualizationId,
                                  displayName: 'Unnamed visualization',
                                  descriptor: {
                                    type: viz.name!,
                                    configuration:
                                      vizPlugin.createDefaultConfig(),
                                    ...(applicationContext != null
                                      ? { applicationContext }
                                      : {}),
                                  },
                                };
                                if (!existingComputation) {
                                  const computation = createComputation(
                                    app.name,
                                    defaultComputationConfig,
                                    computations,
                                    [newVisualization]
                                  );
                                  analysisState.setComputations([
                                    computation,
                                    ...computations,
                                  ]);
                                  onVisualizationCreated(
                                    visualizationId,
                                    computation.computationId
                                  );
                                  /*
            history.push(
                                    Path.resolve(
                                      history.location.pathname,
                                      '..',
                                      computation.computationId,
                                      visualizationId
                                    )
                                    );
            */
                                } else {
                                  const updatedComputation = {
                                    ...existingComputation,
                                    visualizations:
                                      existingComputation.visualizations.concat(
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
                                  onVisualizationCreated(
                                    visualizationId,
                                    existingComputation.computationId
                                  );
                                  /*
          history.push(
                                    Path.resolve(
                                      history.location.pathname,
                                      '..',
                                      existingComputation.computationId,
                                      visualizationId
                                    )
                                  );
          */
                                }
                              }}
                            >
                              {vizPlugin ? (
                                <vizPlugin.selectorIcon {...colors} />
                              ) : (
                                <PlaceholderIcon name={viz.name} />
                              )}
                            </button>
                          </Tooltip>
                          <div className={cx('-PickerEntryName')}>
                            <div>
                              {viz.displayName
                                ?.split(/(, )/g)
                                .map((str) => (str === ', ' ? <br /> : str))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    )
  );
}
