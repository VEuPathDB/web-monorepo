import { Link } from '@veupathdb/wdk-client/lib/Components';
import { makeClassNameHelper } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { keyBy } from 'lodash';
import React, { useMemo } from 'react';
import { RouteComponentProps } from 'react-router';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { Filter } from '../../types/filter';
import { Computation, Visualization } from '../../types/visualization';
import { Grid } from '../Grid';
import { VisualizationType } from './VisualizationTypes';

import './Visualizations.scss';

const cx = makeClassNameHelper('VisualizationsContainer');

interface Props {
  computationId: string;
  visualizations: Visualization[];
  computations: Computation[];
  addVisualization: (visualization: Visualization) => void;
  updateVisualization: (visualization: Visualization) => void;
  visualizationTypes: VisualizationType[];
  filters: Filter[];
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
          <FullScreenVisualization id={routeProps.match.params.id} {...props} />
        )}
      />
    </Switch>
  );
}

function ConfiguredVisualizations(props: Props) {
  const {
    computationId,
    computations,
    visualizations,
    visualizationTypes,
    filters,
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
  const vizTypesByType = useMemo(
    () => keyBy(visualizationTypes, (v) => v.type),
    [visualizationTypes]
  );
  if (computation == null) return <div>Computation not found</div>;
  return (
    <Grid>
      <div className={cx('-NewVisualization')}>
        <Link to={`${url}/new`}>
          <i className="fa fa-plus"></i>
          <br />
          Add a visualization
        </Link>
      </div>
      {scopedVisualizations
        .map((viz) => {
          const type = vizTypesByType[viz.type];
          if (type == null)
            return <div>Viz type not implemented: {viz.type}</div>;
          return (
            <div className={cx('-ConfiguredVisualization')}>
              <div className={cx('-ConfiguredVisualizationActions')}>
                <Link to={`${url}/${viz.id}`}>
                  <i className="fa fa-arrows-alt"></i>
                </Link>
              </div>
              <type.gridComponent
                visualization={viz}
                computation={computation}
                filters={filters}
              />
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
        {visualizationTypes.map((vizType) => (
          <div className={cx('-PickerEntry')}>
            <button
              type="button"
              onClick={async () => {
                const id = uuid();
                addVisualization({
                  id,
                  computationId: computationId,
                  type: vizType.type,
                  configuration: vizType.createDefaultConfig(),
                });
                history.push(`../${computationId}`);
              }}
            >
              <vizType.selectorComponent />
            </button>
            <div className={cx('-PickerEntryName')}>{vizType.displayName}</div>
          </div>
        ))}
      </Grid>
    </div>
  );
}

function FullScreenVisualization(props: Props & { id: string }) {
  const {
    visualizationTypes,
    id,
    computationId,
    visualizations,
    updateVisualization,
    computations,
    filters,
  } = props;
  const viz = visualizations.find(
    (v) => v.id === id && v.computationId === computationId
  );
  const computation = computations.find((a) => a.id === computationId);
  const vizType = visualizationTypes.find((t) => t.type === viz?.type);
  if (viz == null) return <div>Visualization not found.</div>;
  if (computation == null) return <div>Computation not found.</div>;
  if (vizType == null) return <div>Visualization type not implemented.</div>;

  return (
    <div className={cx('-FullScreenContainer')}>
      <div className={cx('-FullScreenActions')}>
        <Link to={`../${computationId}`}>
          <i className="fa fa-window-restore"></i>
        </Link>
      </div>
      <vizType.fullscreenComponent
        visualization={viz}
        updateVisualization={updateVisualization}
        computation={computation}
        filters={filters}
      />
    </div>
  );
}
