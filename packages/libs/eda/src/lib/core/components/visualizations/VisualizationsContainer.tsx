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
import { VisualizationType } from './VisualizationTypes';

import './Visualizations.scss';
import { ContentError } from '@veupathdb/wdk-client/lib/Components/PageStatus/ContentError';
import PlaceholderIcon from './PlaceholderIcon';
import { Tooltip } from '@material-ui/core';
import { isEqual, groupBy } from 'lodash';
import { EntityCounts } from '../../hooks/entityCounts';
import { PromiseHookState } from '../../hooks/promise';
import { GeoConfig } from '../../types/geoConfig';

const cx = makeClassNameHelper('VisualizationsContainer');

interface Props {
  computation: Computation;
  updateVisualizations: (
    visualizations:
      | Visualization[]
      | ((visualizations: Visualization[]) => Visualization[])
  ) => void;
  visualizationTypes: Partial<Record<string, VisualizationType>>;
  visualizationsOverview: VisualizationOverview[];
  filters: Filter[];
  starredVariables: VariableDescriptor[];
  toggleStarredVariable: (targetVariable: VariableDescriptor) => void;
  totalCounts: PromiseHookState<EntityCounts>;
  filteredCounts: PromiseHookState<EntityCounts>;
  geoConfigs: GeoConfig[];
}

/**
 * Responsible for rendering the following:
 * - list of existing visualizations, scoped to the given computation
 * - dialog for selecting a new visualization
 * - displaying a configured visualization in "fullscreen" mode
 * @param props Props
 */
export function VisualizationsContainer(props: Props) {
  const { url } = useRouteMatch();
  return (
    <div className={cx()}>
      <Switch>
        <Route exact path={url}>
          <ConfiguredVisualizations {...props} />
        </Route>
        <Route exact path={`${url}/new`}>
          <NewVisualizationPicker {...props} />
        </Route>
        <Route
          path={`${url}/:id`}
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
  const { computation, updateVisualizations, visualizationsOverview } = props;
  const { url } = useRouteMatch();

  return (
    <Grid>
      <Link replace to={`${url}/new`} className={cx('-NewVisualization')}>
        <i className="fa fa-plus"></i>
        New visualization
      </Link>
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
                        onClick={() =>
                          updateVisualizations((visualizations) =>
                            visualizations.filter(
                              (v) => v.visualizationId !== viz.visualizationId
                            )
                          )
                        }
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
                  <Link replace to={`${url}/${viz.visualizationId}`}>
                    {viz.descriptor.thumbnail ? (
                      <img
                        alt={viz.displayName}
                        src={viz.descriptor.thumbnail}
                      />
                    ) : (
                      <div className={cx('-ConfiguredVisualizationNoPreview')}>
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
  );
}

function NewVisualizationPicker(props: Props) {
  const {
    visualizationTypes,
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
        {visualizationsOverview.map((vizOverview, index) => {
          const vizType = visualizationTypes[vizOverview.name!];
          const disabled =
            vizType == null ||
            (vizType.isEnabledInPicker != null &&
              vizType.isEnabledInPicker({ geoConfigs }) == false);
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
                            configuration: vizType?.createDefaultConfig(),
                          },
                        })
                      );
                      history.replace(`../${computationId}/${visualizationId}`);
                    }}
                  >
                    {vizType ? (
                      <vizType.selectorComponent {...vizOverview} />
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
                {vizType == null && <i>(Coming soon!)</i>}
                {vizType != null && disabled && (
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
    visualizationTypes,
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
  } = props;
  const history = useHistory();
  const viz = computation.visualizations.find((v) => v.visualizationId === id);
  const vizType = viz && visualizationTypes[viz.descriptor.type];
  const overviews = groupBy(visualizationsOverview, (v) =>
    v.name === viz?.descriptor.type ? 'mine' : 'others'
  );
  const overview = overviews.mine[0];
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
  if (vizType == null) return <div>Visualization type not implemented.</div>;

  const { computationId } = computation;

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
                history.replace(Path.resolve(history.location.pathname, '..'));
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
          <Link replace to={`../${computationId}`}>
            <i className="fa fa-window-minimize"></i>
          </Link>
        </Tooltip>
      </div>
      {viz == null ? (
        <ContentError>Visualization not found.</ContentError>
      ) : computation == null ? (
        <ContentError>Computation not found.</ContentError>
      ) : vizType == null ? (
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
          <vizType.fullscreenComponent
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
            otherVizOverviews={overviews.other}
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
