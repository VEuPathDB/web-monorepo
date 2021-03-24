import { Link } from '@veupathdb/wdk-client/lib/Components';
import { keyBy } from 'lodash';
import React, { useMemo } from 'react';
import { RouteComponentProps } from 'react-router';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { App, Visualization } from '../../types/visualization';
import { Grid } from '../Grid';
import { VisualizationType } from './VisualizationTypes';

interface Props {
  appId: string;
  visualizations: Visualization[];
  apps: App[];
  addVisualization: (visualization: Visualization) => void;
  visualizationTypes: VisualizationType[];
}

/**
 * Responsible for rendering the following:
 * - list of existing visualizations, scoped to the given app
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
  const { appId, apps, visualizations, visualizationTypes } = props;
  const { url } = useRouteMatch();
  const app = useMemo(() => apps.find((app) => app.id === appId), [
    appId,
    apps,
  ]);
  const scopedVisualizations = useMemo(
    () => visualizations.filter((viz) => viz.appId === appId),
    [appId, visualizations]
  );
  const vizTypesByType = useMemo(
    () => keyBy(visualizationTypes, (v) => v.type),
    [visualizationTypes]
  );
  if (app == null) return <div>App not found</div>;
  return (
    <Grid>
      <div
        style={{
          height: '8em',
          width: '15em',
          border: '.2em dashed black',
          borderRadius: '.5em',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#eee',
        }}
      >
        <Link
          to={`${url}/new`}
          style={{
            fontSize: '1.35em',
            display: 'block',
            textAlign: 'center',
          }}
        >
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
            <div
              style={{
                height: '15em',
                width: '25em',
                border: '1px solid black',
                borderRadius: '.5em',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  padding: '.5em',
                  fontSize: '1.8em',
                }}
              >
                <Link to={`${url}/${viz.id}`}>
                  <i className="fa fa-arrows-alt"></i>
                </Link>
              </div>
              <type.gridComponent visualization={viz} app={app} />
            </div>
          );
        })
        .reverse()}
    </Grid>
  );
}

function NewVisualizationPicker(props: Props) {
  const { visualizationTypes, addVisualization, appId, apps } = props;
  const app = useMemo(() => apps.find((app) => appId === app.id), [
    apps,
    appId,
  ]);
  const history = useHistory();
  if (app == null) return <div>App not found</div>;
  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          padding: '2em 0',
          position: 'absolute',
          right: 0,
        }}
      >
        <Link
          to={`../${appId}`}
          style={{
            fontSize: '1.35em',
          }}
        >
          <i className="fa fa-close"></i>
        </Link>
      </div>
      <h3>Select a visualization</h3>
      <Grid>
        {visualizationTypes.map((vizType) => (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              style={{
                height: '10em',
                width: '10em',
                background: '#eee',
                marginBottom: '1em',
                border: '.15em solid black',
              }}
              onClick={async () => {
                const id = uuid();
                addVisualization({
                  id,
                  appId: appId,
                  type: vizType.type,
                  configuration: vizType.createDefaultConfig(),
                });
                history.push(`../${appId}`);
              }}
            >
              <vizType.selectorComponent />
            </button>
            <div
              style={{
                textTransform: 'uppercase',
                color: '#444',
                fontWeight: 500,
              }}
            >
              {vizType.displayName}
            </div>
          </div>
        ))}
      </Grid>
    </div>
  );
}

function FullScreenVisualization(props: Props & { id: string }) {
  const { visualizationTypes, id, appId, visualizations, apps } = props;
  const viz = visualizations.find((v) => v.id === id && v.appId === appId);
  const app = apps.find((a) => a.id === appId);
  const vizType = visualizationTypes.find((t) => t.type === viz?.type);
  if (viz == null) return <div>Visualization not found.</div>;
  if (app == null) return <div>App not found.</div>;
  if (vizType == null) return <div>Visualization type not implemented.</div>;
  return (
    <div
      style={{
        position: 'relative',
        padding: '2em 0',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: 0,
        }}
      >
        <Link
          to={`../${appId}`}
          style={{
            fontSize: '1.35em',
          }}
        >
          <i className="fa fa-window-restore"></i>
        </Link>
      </div>
      <vizType.fullscreenComponent visualization={viz} app={app} />
    </div>
  );
}
