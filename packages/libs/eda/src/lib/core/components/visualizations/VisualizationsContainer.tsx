import React, { useCallback, useMemo } from 'react';
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
} from '../../types/visualization';
import { Grid } from '../Grid';
import { VisualizationType } from './VisualizationTypes';

import './Visualizations.scss';
import { ContentError } from '@veupathdb/wdk-client/lib/Components/PageStatus/ContentError';
import PlaceholderIcon from './PlaceholderIcon';
import { Tooltip } from '@material-ui/core';

const cx = makeClassNameHelper('VisualizationsContainer');

interface Props {
  computationId: string;
  visualizations: Visualization[];
  computations: Computation[];
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
  const {
    computationId,
    computations,
    updateVisualizations,
    visualizations,
    visualizationsOverview,
  } = props;
  const { url } = useRouteMatch();
  const computation = useMemo(
    () => computations.find((computation) => computation.id === computationId),
    [computationId, computations]
  );
  const scopedVisualizations = useMemo(
    () => visualizations.filter((viz) => viz.computationId === computationId),
    [computationId, visualizations]
  );
  if (computation == null) return <div>Computation not found</div>;

  return (
    <Grid>
      <Link replace to={`${url}/new`} className={cx('-NewVisualization')}>
        <i className="fa fa-plus"></i>
        Select a visualization
      </Link>
      {scopedVisualizations
        .map((viz) => {
          const meta = visualizationsOverview.find((v) => v.name === viz.type);
          return (
            <div key={viz.id}>
              <div className={cx('-ConfiguredVisualization')}>
                <div className={cx('-ConfiguredVisualizationActions')}>
                  <div>
                    <Tooltip title="Delete visualization">
                      <button
                        type="button"
                        className="link"
                        onClick={() =>
                          updateVisualizations((visualizations) =>
                            visualizations.filter((v) => v.id !== viz.id)
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
                              id: uuid(),
                            })
                          )
                        }
                      >
                        <i className="fa fa-clone"></i>
                      </button>
                    </Tooltip>
                  </div>
                  <div>
                    <Tooltip title="View fullscreen">
                      <Link replace to={`${url}/${viz.id}`}>
                        <i className="fa fa-arrows-alt"></i>
                      </Link>
                    </Tooltip>
                  </div>
                </div>
                {viz.thumbnail ? (
                  <img alt={viz.displayName} src={viz.thumbnail} />
                ) : (
                  <div className={cx('-ConfiguredVisualizationNoPreview')}>
                    Preview unavaiable
                  </div>
                )}
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
    computationId,
    computations,
  } = props;
  const computation = useMemo(
    () => computations.find((computation) => computationId === computation.id),
    [computations, computationId]
  );
  const history = useHistory();
  if (computation == null) return <div>Computation not found</div>;
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
          return (
            <div
              className={cx('-PickerEntry', vizType == null && 'disabled')}
              key={`vizType${index}`}
            >
              {/* add viz description tooltip for viz picker */}
              <Tooltip title={<>{vizOverview.description}</>}>
                <button
                  type="button"
                  disabled={vizType == null}
                  onClick={async () => {
                    const id = uuid();
                    updateVisualizations((visualizations) =>
                      visualizations.concat({
                        id,
                        computationId: computationId,
                        type: vizOverview.name!,
                        displayName: 'Unnamed visualization',
                        configuration: vizType?.createDefaultConfig(),
                      })
                    );
                    history.replace(`../${computationId}/${id}`);
                  }}
                >
                  {vizType ? (
                    <vizType.selectorComponent {...vizOverview} />
                  ) : (
                    <PlaceholderIcon name={vizOverview.name} />
                  )}
                </button>
              </Tooltip>
              <div className={cx('-PickerEntryName')}>
                {vizOverview.displayName?.includes(', ') ? (
                  <div>
                    {vizOverview.displayName.split(', ')[0]} <br />
                    {vizOverview.displayName.split(', ')[1]}
                  </div>
                ) : (
                  <div>{vizOverview.displayName}</div>
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
    computationId,
    visualizations,
    updateVisualizations,
    computations,
    filters,
    starredVariables,
    toggleStarredVariable,
  } = props;
  const history = useHistory();
  const viz = visualizations.find(
    (v) => v.id === id && v.computationId === computationId
  );
  const computation = computations.find((a) => a.id === computationId);
  const vizType = viz && visualizationTypes[viz.type];
  const overview = visualizationsOverview.find((v) => v.name === viz?.type);
  const constraints = overview?.dataElementConstraints;
  const dataElementDependencyOrder = overview?.dataElementDependencyOrder;
  const updateConfiguration = useCallback(
    (configuration: unknown) => {
      updateVisualizations((visualizations) =>
        visualizations.map((v) => (v.id !== id ? v : { ...v, configuration }))
      );
    },
    [updateVisualizations, id]
  );

  const updateThumbnail = useCallback(
    (thumbnail: string) => {
      updateVisualizations((visualizations) =>
        visualizations.map((v) => (v.id !== id ? v : { ...v, thumbnail }))
      );
    },
    [updateVisualizations, id]
  );
  if (viz == null) return <div>Visualization not found.</div>;
  if (computation == null) return <div>Computation not found.</div>;
  if (vizType == null) return <div>Visualization type not implemented.</div>;

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
                  visualizations.filter((v) => v.id !== id)
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
                const id = uuid();
                updateVisualizations((visualizations) =>
                  visualizations.concat({
                    ...viz,
                    id,
                    displayName:
                      'Copy of ' + (viz.displayName || 'unnamed visualization'),
                  })
                );
                history.replace(
                  Path.resolve(history.location.pathname, '..', id)
                );
              }}
            >
              <i className="fa fa-clone"></i>
            </button>
          </Tooltip>
        </div>
        <Tooltip title="Minimize visualization">
          <Link replace to={`../${computationId}`}>
            <i className="fa fa-window-restore"></i>
          </Link>
        </Tooltip>
      </div>
      {viz == null ? (
        <ContentError>Visualization not found.</ContentError>
      ) : computation == null ? (
        <ContentError>Computation not found.</ContentError>
      ) : vizType == null ? (
        <ContentError>
          <>Visualization type not implemented: {viz.type}</>
        </ContentError>
      ) : (
        <div>
          <h3>
            <SaveableTextEditor
              value={viz.displayName ?? 'unnamed visualization'}
              onSave={(value) =>
                updateVisualizations((visualizations) =>
                  visualizations.map((v) =>
                    v.id !== id ? v : { ...v, displayName: value }
                  )
                )
              }
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
          />
        </div>
      )}
    </div>
  );
}
