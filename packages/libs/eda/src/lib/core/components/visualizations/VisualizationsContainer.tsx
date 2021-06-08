import React, { useMemo } from 'react';
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

const cx = makeClassNameHelper('VisualizationsContainer');

interface Props {
  computationId: string;
  visualizations: Visualization[];
  computations: Computation[];
  addVisualization: (visualization: Visualization) => void;
  updateVisualization: (visualization: Visualization) => void;
  deleteVisualization: (id: string) => void;
  visualizationTypes: Partial<Record<string, VisualizationType>>;
  visualizationsOverview: VisualizationOverview[];
  filters: Filter[];
  starredVariables: string[];
  toggleStarredVariable: (targetVariableId: string) => void;
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
    addVisualization,
    deleteVisualization,
    visualizations,
    visualizationTypes,
    visualizationsOverview,
    filters,
    starredVariables,
    toggleStarredVariable,
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
      <Link to={`${url}/new`} className={cx('-NewVisualization')}>
        <i className="fa fa-plus"></i>
        Select a visualization
      </Link>
      {scopedVisualizations
        .map((viz) => {
          const type = visualizationTypes[viz.type];
          const meta = visualizationsOverview.find((v) => v.name === viz.type);
          return (
            <>
              <div key={viz.id} className={cx('-ConfiguredVisualization')}>
                <div className={cx('-ConfiguredVisualizationActions')}>
                  <div>
                    <button
                      title="Delete visualization"
                      type="button"
                      className="link"
                      onClick={() => deleteVisualization(viz.id)}
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                  </div>
                  <div>
                    <button
                      title="Copy visualization"
                      type="button"
                      className="link"
                      onClick={() =>
                        addVisualization({
                          ...viz,
                          displayName: `Copy of ${
                            viz.displayName ?? 'visualization'
                          }`,
                          id: uuid(),
                        })
                      }
                    >
                      <i className="fa fa-clone"></i>
                    </button>
                  </div>
                  <div>
                    <Link to={`${url}/${viz.id}`} title="View fullscreen">
                      <i className="fa fa-arrows-alt"></i>
                    </Link>
                  </div>
                </div>
                {type ? (
                  <type.gridComponent
                    visualization={viz}
                    computation={computation}
                    filters={filters}
                    starredVariables={starredVariables}
                    toggleStarredVariable={toggleStarredVariable}
                  />
                ) : (
                  <div>Visualization type not implemented: {viz.type}</div>
                )}
              </div>
              <div className={cx('-ConfiguredVisualizationTitle')}>
                {viz.displayName ?? 'Unnamed visualization'}
              </div>
              <div className={cx('-ConfiguredVisualizationSubtitle')}>
                {meta?.displayName}
              </div>
            </>
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
    addVisualization,
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
        <Link to={`../${computationId}`}>
          <i className="fa fa-close"></i>
        </Link>
      </div>
      <h3>Select a visualization</h3>
      <Grid>
        {visualizationsOverview.map((vizOverview) => {
          const vizType = visualizationTypes[vizOverview.name!];
          return (
            <div className={cx('-PickerEntry', vizType == null && 'disabled')}>
              <button
                type="button"
                disabled={vizType == null}
                onClick={async () => {
                  const id = uuid();
                  addVisualization({
                    id,
                    computationId: computationId,
                    type: vizOverview.name!,
                    displayName:
                      'Unnamed ' + (vizOverview.displayName ?? 'visualization'),
                    configuration: vizType?.createDefaultConfig(),
                  });
                  history.push(`../${computationId}/${id}`);
                }}
              >
                {vizType ? (
                  <vizType.selectorComponent {...vizOverview} />
                ) : (
                  <PlaceholderIcon name={vizOverview.name} />
                )}
              </button>
              <div className={cx('-PickerEntryName')}>
                <div>{vizOverview.displayName}</div>
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
    addVisualization,
    deleteVisualization,
    updateVisualization,
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
  if (viz == null) return <div>Visualization not found.</div>;
  if (computation == null) return <div>Computation not found.</div>;
  if (vizType == null) return <div>Visualization type not implemented.</div>;

  return (
    <div className={cx('-FullScreenContainer')}>
      <div className={cx('-FullScreenActions')}>
        <div>
          <button
            title="Delete visualization"
            type="button"
            className="link"
            onClick={() => {
              if (viz == null) return;
              deleteVisualization(viz.id);
              history.replace(Path.resolve(history.location.pathname, '..'));
            }}
          >
            <i className="fa fa-trash"></i>
          </button>
        </div>
        <div>
          <button
            title="Copy visualization"
            type="button"
            className="link"
            onClick={() => {
              if (viz == null) return;
              const id = uuid();
              addVisualization({
                ...viz,
                id,
                displayName:
                  'Copy of ' +
                  (viz.displayName ||
                    ('unnamed ' + overview?.displayName ?? 'visualization')),
              });
              history.replace(
                Path.resolve(history.location.pathname, '..', id)
              );
            }}
          >
            <i className="fa fa-clone"></i>
          </button>
        </div>
        <Link to={`../${computationId}`} title="Minimize visualization">
          <i className="fa fa-window-restore"></i>
        </Link>
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
          <h3 style={{ fontStyle: 'normal', fontWeight: 'bold' }}>
            <SaveableTextEditor
              value={
                viz.displayName ??
                'Unnamed ' + overview?.displayName ??
                'visualization'
              }
              onSave={(value) =>
                updateVisualization({ ...viz, displayName: value })
              }
            />
          </h3>
          <div
            style={{
              fontStyle: 'italic',
              fontSize: '1.3em',
              color: '#333333',
              margin: 0,
              paddingLeft: '0.3em',
            }}
          >
            {' '}
            {overview?.displayName}{' '}
          </div>
          <vizType.fullscreenComponent
            dataElementConstraints={constraints}
            dataElementDependencyOrder={dataElementDependencyOrder}
            visualization={viz}
            updateVisualization={updateVisualization}
            computation={computation}
            filters={filters}
            starredVariables={starredVariables}
            toggleStarredVariable={toggleStarredVariable}
          />
        </div>
      )}
    </div>
  );
}
