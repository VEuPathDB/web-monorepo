import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import {
  Route,
  Switch,
  useHistory,
  useRouteMatch,
  RouteComponentProps,
} from 'react-router-dom';
import Path from 'path';
import { v4 as uuid } from 'uuid';
import { orderBy } from 'lodash';
import {
  Link,
  Loading,
  SaveableTextEditor,
} from '@veupathdb/wdk-client/lib/Components';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Filter } from '../../types/filter';
import { VariableDescriptor } from '../../types/variable';
import {
  Computation,
  Visualization,
  VisualizationOverview,
} from '../../types/visualization';
import { Grid } from '../Grid';

import './Visualizations.scss';
import { ContentError } from '@veupathdb/wdk-client/lib/Components/PageStatus/ContentError';
import Banner from '@veupathdb/coreui/dist/components/banners/Banner';
import { useUITheme } from '@veupathdb/coreui/dist/components/theming';
import { useLocalBackedState } from '@veupathdb/wdk-client/lib/Hooks/LocalBackedState';
import PlaceholderIcon from './PlaceholderIcon';
import { Tooltip } from '@material-ui/core';
import { isEqual, groupBy } from 'lodash';
import { EntityCounts } from '../../hooks/entityCounts';
import { useStudyRecord } from '../../hooks/workspace';
import { PromiseHookState } from '../../hooks/promise';
import { GeoConfig } from '../../types/geoConfig';
import { FilledButton } from '@veupathdb/coreui/dist/components/buttons';
import AddIcon from '@material-ui/icons/Add';
import { plugins } from '../computations/plugins';
import { AnalysisState } from '../../hooks/analysis';
import { ComputationAppOverview } from '../../types/visualization';
import { VisualizationPlugin } from './VisualizationPlugin';
import { Modal, H6, Paragraph, H5 } from '@veupathdb/coreui';
import { useVizIconColors } from './implementations/selectorIcons/types';
import { RunComputeButton, StatusIcon } from '../computations/RunComputeButton';
import { JobStatus } from '../computations/ComputeJobStatusHook';
import { ComputationStepContainer } from '../computations/ComputationStepContainer';

const cx = makeClassNameHelper('VisualizationsContainer');

interface Props {
  analysisState: AnalysisState;
  computationAppOverview: ComputationAppOverview;
  computation: Computation;
  updateVisualizations: (
    visualizations:
      | Visualization[]
      | ((visualizations: Visualization[]) => Visualization[])
  ) => void;
  visualizationPlugins: Partial<Record<string, VisualizationPlugin>>;
  visualizationsOverview: VisualizationOverview[];
  filters: Filter[];
  starredVariables: VariableDescriptor[];
  toggleStarredVariable: (targetVariable: VariableDescriptor) => void;
  totalCounts: PromiseHookState<EntityCounts>;
  filteredCounts: PromiseHookState<EntityCounts>;
  geoConfigs: GeoConfig[];
  baseUrl?: string;
  isSingleAppMode: boolean;
  disableThumbnailCreation?: boolean;
  computeJobStatus?: JobStatus;
  createComputeJob?: () => void;
}

/**
 * Responsible for rendering the following:
 * - list of existing visualizations, scoped to the given computation
 * - dialog for selecting a new visualization
 * - displaying a configured visualization in "fullscreen" mode
 * @param props Props
 */
export function VisualizationsContainer(props: Props) {
  const { baseUrl } = { ...props };
  const { url } = useRouteMatch();

  const currentStudyRecordId = useStudyRecord().id[0].value;
  const studiesForPerformanceWarning = [
    'DS_a885240fc4',
    'DS_5c41b87221',
    'DS_81ef25b6ac',
  ];
  const SHOULD_SHOW_WARNING_KEY = `shouldShowWarning-${currentStudyRecordId}`;
  const [shouldShowWarning, setShouldShowWarning] =
    useLocalBackedState<boolean>(
      true,
      SHOULD_SHOW_WARNING_KEY,
      (boolean) => String(boolean),
      (string) => string !== 'false'
    );

  const handleCloseWarning = () => {
    setShouldShowWarning(false);
  };

  return (
    <div className={cx()}>
      {studiesForPerformanceWarning.includes(currentStudyRecordId) &&
      shouldShowWarning ? (
        <Banner
          banner={{
            type: 'warning',
            message:
              'Visualizations might take up to a minute to load because this study has a large amount of data.',
            pinned: false,
            intense: false,
          }}
          onClose={handleCloseWarning}
        ></Banner>
      ) : null}
      <Switch>
        <Route exact path={url}>
          <ConfiguredVisualizations {...props} />
        </Route>
        <Route exact path={`${baseUrl || url}/new`}>
          <NewVisualizationPicker {...props} />
        </Route>
        <Route
          path={`${baseUrl || url}/:id`}
          render={(routeProps: RouteComponentProps<{ id: string }>) => (
            <FullScreenVisualization
              id={routeProps.match.params.id}
              {...props}
            />
          )}
        />
      </Switch>
    </div>
  );
}

function ConfiguredVisualizations(props: Props) {
  const {
    analysisState,
    computation,
    computationAppOverview,
    updateVisualizations,
    visualizationsOverview,
    baseUrl,
    isSingleAppMode,
    computeJobStatus,
  } = props;
  const { url } = useRouteMatch();
  const plugin = computation && plugins[computation.descriptor.type];
  const isComputationConfigurationValid =
    computation &&
    !!plugin.isConfigurationValid(computation.descriptor.configuration);

  return (
    <>
      {isSingleAppMode ? (
        <Link
          to={{
            pathname: `${baseUrl || url}/new`,
            state: { scrollToTop: false },
          }}
          style={{
            display: 'block',
            width: 'fit-content',
          }}
        >
          <FilledButton
            text="New visualization"
            onPress={() => null}
            textTransform="none"
            themeRole="primary"
            icon={AddIcon}
            styleOverrides={{
              container: { marginTop: 15 },
            }}
          />
        </Link>
      ) : null}
      <Grid>
        {computation.visualizations
          .map((viz) => {
            const meta = visualizationsOverview.find(
              (v) => v.name === viz.descriptor.type
            );
            return (
              <div key={viz.visualizationId}>
                <div className={cx('-ConfiguredVisualization')}>
                  <div className={cx('-ConfiguredVisualizationActions')}>
                    <div>
                      <Tooltip title="Delete visualization">
                        <button
                          type="button"
                          className="link"
                          onClick={() => {
                            updateVisualizations((visualizations) =>
                              visualizations.filter(
                                (v) => v.visualizationId !== viz.visualizationId
                              )
                            );
                            /* 
                              Here we're deleting the computation in the event we delete
                              the computation's last remaining visualization.
                            */
                            if (
                              !isSingleAppMode &&
                              computation.visualizations.length === 1
                            ) {
                              deleteComputationWithNoVisualizations(
                                analysisState,
                                computation.computationId
                              );
                            }
                          }}
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </Tooltip>
                    </div>
                    <div>
                      <Tooltip title="Copy visualization">
                        <button
                          type="button"
                          className="link"
                          onClick={() =>
                            updateVisualizations((visualizations) =>
                              visualizations.concat({
                                ...viz,
                                displayName: `Copy of ${
                                  viz.displayName ?? 'visualization'
                                }`,
                                visualizationId: uuid(),
                              })
                            )
                          }
                        >
                          <i className="fa fa-clone"></i>
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                  {/* add the Link of thumbnail box here to avoid click conflict with icons */}
                  <>
                    <Link
                      to={{
                        pathname: `${baseUrl || url}/${viz.visualizationId}`,
                        state: { scrollToTop: false },
                      }}
                    >
                      <ConfiguredVisualizationGrayOut
                        filters={props.filters}
                        currentPlotFilters={viz.descriptor.currentPlotFilters}
                        hasCompute={
                          props.computationAppOverview.computeName != null
                        }
                        computeJobStatus={computeJobStatus}
                        isComputationConfigurationValid={
                          isComputationConfigurationValid
                        }
                      >
                        {/* make gray-out box on top of thumbnail */}
                        {viz.descriptor.thumbnail ? (
                          <img
                            alt={viz.displayName}
                            src={viz.descriptor.thumbnail}
                          />
                        ) : (
                          <div
                            className={cx('-ConfiguredVisualizationNoPreview')}
                          >
                            Preview unavailable
                          </div>
                        )}
                      </ConfiguredVisualizationGrayOut>
                    </Link>
                  </>
                </div>
                <div className={cx('-ConfiguredVisualizationTitle')}>
                  {viz.displayName ?? 'Unnamed visualization'}
                  &nbsp;
                  {computationAppOverview.computeName && computeJobStatus && (
                    <StatusIcon status={computeJobStatus} />
                  )}
                </div>
                <div className={cx('-ConfiguredVisualizationSubtitle')}>
                  {meta?.displayName}
                </div>
              </div>
            );
          })
          .reverse()}
      </Grid>
    </>
  );
}

type NewVisualizationPickerPropKeys =
  | 'visualizationPlugins'
  | 'visualizationsOverview'
  | 'updateVisualizations'
  | 'computation'
  | 'geoConfigs';

interface NewVisualizationPickerProps
  extends Pick<Props, NewVisualizationPickerPropKeys> {
  onVisualizationCreated?: (
    VisualizationId: string,
    computationId: string
  ) => void;
  includeHeader?: boolean;
}

export function NewVisualizationPickerGrouped(
  props: NewVisualizationPickerProps
) {
  const {
    visualizationPlugins,
    visualizationsOverview,
    updateVisualizations,
    computation,
    geoConfigs,
    onVisualizationCreated = function (visualizationId, computationId) {
      history.replace(`../${computationId}/${visualizationId}`);
    },
    includeHeader,
  } = props;
  const colors = useVizIconColors();
  const history = useHistory();
  const { computationId } = computation;
  return (
    <>
      {includeHeader && (
        <H5
          additionalStyles={{
            margin: '5px 0 5px 0',
          }}
        >
          Select a visualization
        </H5>
      )}
      {groupVisualizations(visualizationsOverview).map((vizGroup) => (
        <div className={cx('-GroupedPickerContainer')} key={vizGroup.groupName}>
          <div className={cx('-GroupedPickerEntryHeadline')}>
            <H6
              additionalStyles={{
                margin: 0,
              }}
            >
              {vizGroup.groupName}
            </H6>
            <Paragraph styleOverrides={{ margin: '5px 0' }}>
              {vizGroup.groupDescription}
            </Paragraph>
          </div>
          <div className={cx('-GroupedPickerEntryList')}>
            {vizGroup.groupVisualizationsList.map((vizOverview) => {
              const vizPlugin = visualizationPlugins[vizOverview.name!];
              const disabled =
                vizPlugin == null ||
                (vizPlugin.isEnabledInPicker != null &&
                  vizPlugin.isEnabledInPicker({ geoConfigs }) === false);
              return (
                <div
                  className={cx(
                    '-PickerEntry',
                    disabled && 'disabled',
                    'marginRight'
                  )}
                  key={`vizType${vizOverview.name}`}
                >
                  <Tooltip title={<>{vizOverview.description}</>}>
                    <button
                      style={{
                        cursor: disabled ? 'not-allowed' : 'cursor',
                      }}
                      type="button"
                      disabled={disabled}
                      onClick={async () => {
                        const visualizationId = uuid();
                        updateVisualizations((visualizations) =>
                          visualizations.concat({
                            visualizationId,
                            displayName: 'Unnamed visualization',
                            descriptor: {
                              type: vizOverview.name!,
                              configuration: vizPlugin?.createDefaultConfig(),
                            },
                          })
                        );
                        onVisualizationCreated(visualizationId, computationId);
                      }}
                    >
                      {vizPlugin ? (
                        <vizPlugin.selectorIcon {...colors} />
                      ) : (
                        <PlaceholderIcon name={vizOverview.name} />
                      )}
                    </button>
                  </Tooltip>
                  <div className={cx('-PickerEntryName')}>
                    <div>
                      {vizOverview.displayName
                        ?.split(/(, )/g)
                        .map((str) => (str === ', ' ? <br /> : str))}
                    </div>
                    {vizPlugin == null && <i>(Coming soon!)</i>}
                    {vizPlugin != null && disabled && (
                      <i>(Not applicable to this study)</i>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

export function NewVisualizationPicker(props: NewVisualizationPickerProps) {
  const {
    visualizationPlugins,
    visualizationsOverview,
    updateVisualizations,
    computation,
    geoConfigs,
    onVisualizationCreated = function (visualizationId, computationId) {
      history.replace(`../${computationId}/${visualizationId}`);
    },
    includeHeader = true,
  } = props;
  const colors = useVizIconColors();
  const history = useHistory();
  const { computationId } = computation;

  return (
    <div className={cx('-PickerContainer')}>
      {includeHeader && (
        <>
          <div className={cx('-PickerActions')}>
            <Link replace to={`../${computationId}`}>
              <i className="fa fa-close"></i>
            </Link>
          </div>
          <h3>Select a visualization</h3>
        </>
      )}
      <Grid>
        {/* orderBy ensures that available visualizations render ahead of those in development */}
        {orderBy(
          visualizationsOverview,
          [(viz) => (viz.name && visualizationPlugins[viz.name] ? 1 : 0)],
          ['desc']
        ).map((vizOverview, index) => {
          const vizPlugin = visualizationPlugins[vizOverview.name!];
          const disabled =
            vizPlugin == null ||
            (vizPlugin.isEnabledInPicker != null &&
              vizPlugin.isEnabledInPicker({ geoConfigs }) === false);
          // we could in future pass other study metadata, variable constraints, etc to isEnabledInPicker()
          return (
            <div
              className={cx('-PickerEntry', disabled && 'disabled')}
              key={`vizType${index}`}
            >
              {/* add viz description tooltip for viz picker */}
              <Tooltip title={<>{vizOverview.description}</>}>
                <span>
                  <button
                    style={{
                      cursor: disabled ? 'not-allowed' : 'cursor',
                    }}
                    type="button"
                    disabled={disabled}
                    onClick={async () => {
                      const visualizationId = uuid();
                      updateVisualizations((visualizations) =>
                        visualizations.concat({
                          visualizationId,
                          displayName: 'Unnamed visualization',
                          descriptor: {
                            type: vizOverview.name!,
                            configuration: vizPlugin?.createDefaultConfig(),
                          },
                        })
                      );
                      onVisualizationCreated(visualizationId, computationId);
                    }}
                  >
                    {vizPlugin ? (
                      <vizPlugin.selectorIcon {...colors} />
                    ) : (
                      <PlaceholderIcon name={vizOverview.name} />
                    )}
                  </button>
                </span>
              </Tooltip>
              <div className={cx('-PickerEntryName')}>
                <div>
                  {vizOverview.displayName
                    ?.split(/(, )/g)
                    .map((str) => (str === ', ' ? <br /> : str))}
                </div>
                {vizPlugin == null && <i>(Coming soon!)</i>}
                {vizPlugin != null && disabled && (
                  <i>(Not applicable to this study)</i>
                )}
              </div>
            </div>
          );
        })}
      </Grid>
    </div>
  );
}

interface NewVisualizationPickerModalProps extends NewVisualizationPickerProps {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
}

export function NewVisualizationPickerModal(
  props: NewVisualizationPickerModalProps
) {
  const { visible, onVisibleChange, ...pickerProps } = props;
  return (
    <Modal
      includeCloseButton
      toggleVisible={onVisibleChange}
      visible={visible}
      title="Select a visualization"
      themeRole="primary"
    >
      <div style={{ fontSize: '80%' }}>
        <NewVisualizationPicker {...pickerProps} includeHeader={false} />
      </div>
    </Modal>
  );
}

type FullScreenVisualizationPropKeys =
  | 'analysisState'
  | 'computationAppOverview'
  | 'visualizationPlugins'
  | 'visualizationsOverview'
  | 'updateVisualizations'
  | 'computation'
  | 'filters'
  | 'starredVariables'
  | 'toggleStarredVariable'
  | 'totalCounts'
  | 'filteredCounts'
  | 'geoConfigs'
  | 'baseUrl'
  | 'isSingleAppMode'
  | 'disableThumbnailCreation'
  | 'computeJobStatus'
  | 'createComputeJob';

interface FullScreenVisualizationProps
  extends Pick<Props, FullScreenVisualizationPropKeys> {
  id: string;
  /** Optionally override the action icons */
  actions?: React.ReactNode;
  draggableContainerDims?: { width: number; height: number };
}

export function FullScreenVisualization(props: FullScreenVisualizationProps) {
  const {
    analysisState,
    computationAppOverview,
    visualizationPlugins,
    visualizationsOverview,
    id,
    updateVisualizations,
    computation,
    filters,
    starredVariables,
    toggleStarredVariable,
    totalCounts,
    filteredCounts,
    geoConfigs,
    baseUrl,
    isSingleAppMode,
    disableThumbnailCreation,
    actions,
    computeJobStatus,
    createComputeJob,
    draggableContainerDims,
  } = props;
  const themePrimaryColor = useUITheme()?.palette.primary;
  const history = useHistory();
  const viz = computation.visualizations.find((v) => v.visualizationId === id);
  const vizPlugin = viz && visualizationPlugins[viz.descriptor.type];
  const overviews = useMemo(
    () =>
      groupBy(visualizationsOverview, (v) =>
        v.name === viz?.descriptor.type ? 'mine' : 'others'
      ),
    [visualizationsOverview, viz]
  );
  const overview = overviews.mine != null ? overviews.mine[0] : undefined;
  const constraints = overview?.dataElementConstraints;
  const dataElementDependencyOrder = overview?.dataElementDependencyOrder;

  const updateConfiguration = useCallback(
    (configuration: unknown) => {
      updateVisualizations((visualizations) =>
        visualizations.map((v) =>
          v.visualizationId !== id
            ? v
            : { ...v, descriptor: { ...v.descriptor, configuration } }
        )
      );
    },
    [updateVisualizations, id]
  );

  // store a ref to the latest version of updateVisualizations
  const updateVisualizationsRef = useRef(updateVisualizations);

  // whenever updateVisualizations changes, update the updateVisualizationsRef
  useEffect(() => {
    updateVisualizationsRef.current = updateVisualizations;
  }, [updateVisualizations]);

  // update currentPlotFilters with the latest filters at fullscreen mode
  useEffect(() => {
    updateVisualizationsRef.current((visualizations) =>
      visualizations.map((v) =>
        v.visualizationId !== id
          ? v
          : {
              ...v,
              descriptor: { ...v.descriptor, currentPlotFilters: filters },
            }
      )
    );
  }, [filters, id]);

  // Function to update the thumbnail on the configured viz selection page
  const updateThumbnail = useCallback(
    (thumbnail: string) => {
      updateVisualizations((visualizations) =>
        visualizations.map((v) =>
          v.visualizationId !== id
            ? v
            : { ...v, descriptor: { ...v.descriptor, thumbnail } }
        )
      );
    },
    [updateVisualizations, id]
  );
  if (viz == null) return <div>Visualization not found.</div>;
  if (vizPlugin == null) return <div>Visualization type not implemented.</div>;

  const { computationId } = computation;
  const plugin = plugins[computation.descriptor.type] ?? undefined;
  const isComputationConfigurationValid = !!plugin.isConfigurationValid(
    computation.descriptor.configuration
  );

  return (
    <div className={cx('-FullScreenContainer')}>
      <div
        className={cx('-FullScreenActions')}
        css={{
          '& i.fa': {
            color:
              themePrimaryColor &&
              themePrimaryColor.hue[themePrimaryColor.level],
          },
        }}
      >
        {actions ?? (
          <>
            <div>
              <Tooltip title="Delete visualization">
                <button
                  type="button"
                  className="link"
                  onClick={() => {
                    if (viz == null) return;
                    updateVisualizations((visualizations) =>
                      visualizations.filter((v) => v.visualizationId !== id)
                    );
                    /* 
                      Here we're deleting the computation in the event we delete
                      the computation's last remaining visualization.
                    */
                    if (
                      !isSingleAppMode &&
                      computation.visualizations.length === 1
                    ) {
                      deleteComputationWithNoVisualizations(
                        analysisState,
                        computationId
                      );
                    }
                    history.replace(
                      Path.resolve(
                        history.location.pathname,
                        isSingleAppMode ? '..' : '../..'
                      )
                    );
                  }}
                >
                  <i className="fa fa-trash"></i>
                </button>
              </Tooltip>
            </div>
            <div>
              <Tooltip title="Copy visualization">
                <button
                  type="button"
                  className="link"
                  onClick={() => {
                    if (viz == null) return;
                    const vizCopyId = uuid();
                    updateVisualizations((visualizations) =>
                      visualizations.concat({
                        ...viz,
                        visualizationId: vizCopyId,
                        displayName:
                          'Copy of ' +
                          (viz.displayName || 'unnamed visualization'),
                      })
                    );
                    history.replace(
                      Path.resolve(history.location.pathname, '..', vizCopyId)
                    );
                  }}
                >
                  <i className="fa fa-clone"></i>
                </button>
              </Tooltip>
            </div>
            <Tooltip title="Minimize visualization">
              <Link
                to={{
                  pathname: `../${baseUrl ? '' : computationId}`, // Should go to ../visualizations unless in single app mode
                  state: { scrollToTop: false },
                }}
              >
                <i className="fa fa-window-minimize"></i>
              </Link>
            </Tooltip>
          </>
        )}
      </div>
      {viz == null ? (
        <ContentError>Visualization not found.</ContentError>
      ) : computation == null ? (
        <ContentError>Computation not found.</ContentError>
      ) : vizPlugin == null ? (
        <ContentError>
          <>Visualization type not implemented: {viz.descriptor.type}</>
        </ContentError>
      ) : (
        <div>
          <h3>
            <SaveableTextEditor
              value={viz.displayName ?? 'unnamed visualization'}
              onSave={(value) => {
                if (value) {
                  updateVisualizations((visualizations) =>
                    visualizations.map((v) =>
                      v.visualizationId !== id
                        ? v
                        : { ...v, displayName: value }
                    )
                  );
                }
              }}
            />
          </h3>
          <div className="Subtitle">{overview?.displayName}</div>
          {plugin && analysisState.analysis && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2em',
              }}
            >
              <plugin.configurationComponent
                analysisState={analysisState}
                computation={computation}
                visualizationId={viz.visualizationId}
                computationAppOverview={computationAppOverview}
                totalCounts={totalCounts}
                filteredCounts={filteredCounts}
                geoConfigs={geoConfigs}
                addNewComputation={() => null}
              />
              {createComputeJob && computationAppOverview.computeName && (
                <ComputationStepContainer
                  computationStepInfo={{
                    stepNumber: 2,
                    stepTitle: `Generate ${computationAppOverview.displayName} results`,
                  }}
                  isStepDisabled={!isComputationConfigurationValid}
                >
                  <RunComputeButton
                    computationAppOverview={computationAppOverview}
                    status={computeJobStatus}
                    isConfigured={isComputationConfigurationValid}
                    createJob={createComputeJob}
                  />
                </ComputationStepContainer>
              )}
            </div>
          )}
          {computationAppOverview.computeName ? (
            <ComputationStepContainer
              computationStepInfo={{
                stepNumber: 3,
                stepTitle: `Use ${computationAppOverview.displayName} results in visualization`,
              }}
              isStepDisabled={computeJobStatus !== 'complete'}
            >
              <div style={{ marginLeft: '3em' }}>
                <vizPlugin.fullscreenComponent
                  options={vizPlugin.options}
                  dataElementConstraints={constraints}
                  dataElementDependencyOrder={dataElementDependencyOrder}
                  visualization={viz}
                  computation={computation}
                  filters={filters}
                  starredVariables={starredVariables}
                  toggleStarredVariable={toggleStarredVariable}
                  updateConfiguration={updateConfiguration}
                  updateThumbnail={
                    disableThumbnailCreation ? undefined : updateThumbnail
                  }
                  totalCounts={totalCounts}
                  filteredCounts={filteredCounts}
                  geoConfigs={geoConfigs}
                  otherVizOverviews={overviews.others}
                  computeJobStatus={computeJobStatus}
                />
              </div>
            </ComputationStepContainer>
          ) : (
            <vizPlugin.fullscreenComponent
              options={vizPlugin.options}
              dataElementConstraints={constraints}
              dataElementDependencyOrder={dataElementDependencyOrder}
              visualization={viz}
              computation={computation}
              filters={filters}
              starredVariables={starredVariables}
              toggleStarredVariable={toggleStarredVariable}
              updateConfiguration={updateConfiguration}
              updateThumbnail={
                disableThumbnailCreation ? undefined : updateThumbnail
              }
              totalCounts={totalCounts}
              filteredCounts={filteredCounts}
              geoConfigs={geoConfigs}
              otherVizOverviews={overviews.others}
              computeJobStatus={computeJobStatus}
              draggableContainerDims={draggableContainerDims}
            />
          )}
        </div>
      )}
    </div>
  );
}

// define type and ConfiguredVisualizationGrayOut component for gray-out thumbnail
type ConfiguredVisualizationGrayOutProps = {
  filters: Filter[];
  currentPlotFilters?: Filter[];
  hasCompute: boolean;
  computeJobStatus?: JobStatus;
  children: JSX.Element;
  isComputationConfigurationValid: boolean;
};

function ConfiguredVisualizationGrayOut({
  filters,
  currentPlotFilters,
  hasCompute,
  computeJobStatus,
  children,
  isComputationConfigurationValid,
}: ConfiguredVisualizationGrayOutProps) {
  const message = useMemo(() => {
    if (hasCompute && computeJobStatus !== 'complete') {
      if (computeJobStatus == null && isComputationConfigurationValid)
        return <Loading />;

      const message =
        computeJobStatus === 'failed'
          ? {
              primary: 'Computation failed',
              secondary: 'Please contact us for support.',
            }
          : computeJobStatus === 'expired'
          ? {
              primary: 'Computation expired',
              secondary: 'Please regenerate results to use this visualization.',
            }
          : computeJobStatus === 'no-such-job' ||
            !isComputationConfigurationValid
          ? {
              primary: `Computation not ${
                isComputationConfigurationValid ? 'started' : 'configured'
              }`,
              secondary:
                'Configure and run a computation to use this visualization.',
            }
          : {
              primary: 'Computation in progress',
              secondary:
                'This visualization will be available when the computation in complete.',
            };
      return (
        <>
          <div>{message.primary}</div>
          <div style={{ fontSize: '.6em', marginTop: '1em' }}>
            {message.secondary}
          </div>
        </>
      );
    }

    // using lodash isEqual to compare two objects
    if (!isEqual(filters, currentPlotFilters)) {
      return (
        <>
          Open to sync with
          <br /> current subset
        </>
      );
    }

    return null;
  }, [computeJobStatus, currentPlotFilters, filters, hasCompute]);

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          filter: message ? 'blur(5px)' : undefined,
        }}
      >
        {children}
      </div>
      {message && (
        <div className={cx('-ConfiguredVisualizationGrayOut')}>{message}</div>
      )}
    </div>
  );
}

function deleteComputationWithNoVisualizations(
  analysisState: AnalysisState,
  computationId: string
) {
  const computations = analysisState.analysis?.descriptor.computations;
  if (computations) {
    analysisState.setComputations([
      ...computations.filter((c) => c.computationId !== computationId),
    ]);
  }
}

type VisualizationGroup = {
  groupName: string;
  groupDescription: string;
  groupVisualizationsList: VisualizationOverview[];
};
function groupVisualizations(
  visualizations: VisualizationOverview[]
): VisualizationGroup[] {
  return [
    {
      groupName: 'Distributions',
      groupDescription: 'Plot the spread of any continuous variable.',
      groupVisualizationsList: ['boxplot', 'histogram'],
    },
    {
      groupName: 'Counts and Proportions',
      groupDescription: 'Compare frequencies of categorical variable(s).',
      groupVisualizationsList: ['barplot', 'twobytwo', 'conttable'],
    },
    {
      groupName: 'X-Y Relationships',
      groupDescription:
        'Visualize the relationship between two continuous variables.',
      groupVisualizationsList: ['scatterplot', 'lineplot'],
    },
    {
      groupName: 'Geolocation Maps',
      groupDescription: 'See the distribution of data on a map',
      groupVisualizationsList: ['map-markers', 'map-markers-overlay'],
    },
    // {
    //   groupName: 'Individual-level plots',
    //   groupDescription:
    //     'Visualize data over time, with separate plots for each identifier (ie, Household ID, Participant ID, etc).',
    //   groupVisualizationsList: ['timelineplot', 'stripplots'],
    // },
  ].map((group) => ({
    ...group,
    groupVisualizationsList: visualizations.filter(({ name }) =>
      group.groupVisualizationsList.includes(name)
    ),
  }));
}
