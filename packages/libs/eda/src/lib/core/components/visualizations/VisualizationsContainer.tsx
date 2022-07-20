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
import { Link, SaveableTextEditor } from '@veupathdb/wdk-client/lib/Components';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Filter } from '../../types/filter';
import { VariableDescriptor } from '../../types/variable';
import {
  Computation,
  Visualization,
  VisualizationOverview,
  VisualizationDescriptor,
} from '../../types/visualization';
import { Grid } from '../Grid';

import './Visualizations.scss';
import { ContentError } from '@veupathdb/wdk-client/lib/Components/PageStatus/ContentError';
import Banner from '@veupathdb/coreui/dist/components/banners/Banner';
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
  const [
    shouldShowWarning,
    setShouldShowWarning,
  ] = useLocalBackedState<boolean>(
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
    updateVisualizations,
    visualizationsOverview,
    baseUrl,
    isSingleAppMode,
  } = props;
  const { url } = useRouteMatch();

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
                      {/* make gray-out box on top of thumbnail */}
                      <ConfiguredVisualizationGrayOut
                        filters={props.filters}
                        currentPlotFilters={
                          (viz.descriptor as VisualizationDescriptor)
                            .currentPlotFilters as Filter[]
                        }
                      />
                    </Link>
                  </>
                </div>
                <div className={cx('-ConfiguredVisualizationTitle')}>
                  {viz.displayName ?? 'Unnamed visualization'}
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

function NewVisualizationPicker(props: Props) {
  const {
    visualizationPlugins,
    visualizationsOverview,
    updateVisualizations,
    computation,
    geoConfigs,
  } = props;
  const history = useHistory();
  const { computationId } = computation;
  return (
    <div className={cx('-PickerContainer')}>
      <div className={cx('-PickerActions')}>
        <Link replace to={`../${computationId}`}>
          <i className="fa fa-close"></i>
        </Link>
      </div>
      <h3>Select a visualization</h3>
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
                      history.replace(`../${computationId}/${visualizationId}`);
                    }}
                  >
                    {vizPlugin ? (
                      <img
                        alt={vizOverview.displayName}
                        style={{ height: '100%', width: '100%' }}
                        src={vizPlugin.selectorIcon}
                      />
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

function FullScreenVisualization(props: Props & { id: string }) {
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
  } = props;
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

  return (
    <div className={cx('-FullScreenContainer')}>
      <div className={cx('-FullScreenActions')}>
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
                      'Copy of ' + (viz.displayName || 'unnamed visualization'),
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
          {plugin && (
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
          )}
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
            updateThumbnail={updateThumbnail}
            totalCounts={totalCounts}
            filteredCounts={filteredCounts}
            geoConfigs={geoConfigs}
            otherVizOverviews={overviews.others}
          />
        </div>
      )}
    </div>
  );
}

// define type and ConfiguredVisualizationGrayOut component for gray-out thumbnail
type ConfiguredVisualizationGrayOutProps = {
  filters: Filter[];
  currentPlotFilters: Filter[];
};

function ConfiguredVisualizationGrayOut({
  filters,
  currentPlotFilters,
}: ConfiguredVisualizationGrayOutProps) {
  // using lodash isEqual to compare two objects
  const thumbnailGrayOut = useMemo(() => isEqual(filters, currentPlotFilters), [
    filters,
    currentPlotFilters,
  ]);

  return !thumbnailGrayOut ? (
    <div className={cx('-ConfiguredVisualizationGrayOut')}>
      Open to sync with
      <br /> current subset
    </div>
  ) : (
    <></>
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
