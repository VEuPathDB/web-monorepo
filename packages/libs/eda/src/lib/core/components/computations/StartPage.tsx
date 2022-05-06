import { Link } from 'react-router-dom';
import { ComputationAppOverview } from '../../types/visualization';
import { ComputationPlugin } from './Types';
import { orderBy } from 'lodash';

interface Props {
  baseUrl: string;
  apps: ComputationAppOverview[];
  plugins: Record<string, ComputationPlugin>;
}

export function StartPage(props: Props) {
  const { apps, baseUrl, plugins } = props;
  return (
    <div>
      <h3>To get started, select an app.</h3>
      <p>
        Each app provides a set of visualizations targeted towards a particular
        question, and may include configuring and computing additional
        variables.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
        {/* orderBy renders available apps ahead of those in development */}
        {orderBy(apps, [(app) => (plugins[app.name] ? 1 : 0)], ['desc']).map(
          (app) => (
            <div
              style={{
                padding: '1em',
                border: '1px solid',
                borderRadius: '.5em',
                margin: '1em 0',
                cursor: plugins[app.name] ? 'pointer' : 'not-allowed',
                background: plugins[app.name] ? 'transparent' : '#eee',
                opacity: plugins[app.name] ? '1' : '0.5',
              }}
            >
              <Link
                to={`${baseUrl}/new/${app.name}`}
                style={{
                  pointerEvents: plugins[app.name] ? 'auto' : 'none',
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
                  {app.displayName}
                  {plugins[app.name] ? '' : <i> (Coming soon!)</i>}
                </div>
                <div>{app.description}</div>
              </Link>
            </div>
          )
        )}
      </div>
    </div>
  );
}
