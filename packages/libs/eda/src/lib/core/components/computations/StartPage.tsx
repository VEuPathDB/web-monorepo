import React from 'react';
import { Link } from 'react-router-dom';
import { ComputationAppOverview } from '../../types/visualization';

interface Props {
  baseUrl: string;
  apps: ComputationAppOverview[];
}

export function StartPage(props: Props) {
  const { apps, baseUrl } = props;
  return (
    <div>
      <h3>To get started, select an app.</h3>
      <p>
        Each app provides a set of visualizations targeted towards a particular
        question, and may include configuring and computing additional
        variables.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
        {apps.map((app) => (
          <Link
            to={`${baseUrl}/new/${app.name}`}
            style={{
              padding: '1em',
              border: '1px solid',
              borderRadius: '.5em',
              margin: '1em 0',
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
              {app.displayName}
            </div>
            <div>{app.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
