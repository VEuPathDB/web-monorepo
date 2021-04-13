import { useLocation } from 'react-router-dom';

import { IconAlt, Link } from '@veupathdb/wdk-client/lib/Components';

import { useShowWipFeatures } from '../hooks/preferredOrganisms';

interface Props {
  onDismiss: () => void;
  newOrganismCount: number;
  projectId: string;
}

export function NewOrganismsBanner({ newOrganismCount, projectId }: Props) {
  const showWipFeatures = useShowWipFeatures();
  const location = useLocation();

  if (location.pathname.startsWith('preferred-organisms')) {
    return null;
  }

  return (
    <div
      style={{
        display: 'inline-grid',
        gridAutoFlow: 'column',
        gap: '1em',
      }}
    >
      <span className="fa-stack" style={{ fontSize: '1.2em' }}>
        <i
          className="fa fa-exclamation-triangle fa-stack-2x"
          style={{ color: 'rgb(255, 235, 59)', textShadow: '1px 1px black' }}
        ></i>
        <i
          className="fa fa-exclamation fa-stack-1x"
          style={{ color: 'black', fontSize: '1.3em', top: '2px' }}
        ></i>
      </span>
      <div>
        {makeNewOrganismDescription(newOrganismCount, projectId)}
        <br />
        <Link
          to={`/preferred-organisms${
            showWipFeatures ? '?showWipFeatures=true' : ''
          }`}
        >
          Please review My Organism Preferences.
        </Link>
      </div>
      <button
        type="button"
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          color: '#7c7c7c',
        }}
      >
        <IconAlt fa="times fa-2x" />
      </button>
    </div>
  );
}

function makeNewOrganismDescription(
  newOrganismCount: number,
  projectId: string
) {
  return newOrganismCount === 1
    ? `There is 1 new organism in ${projectId}.`
    : `There are ${newOrganismCount} new organisms in ${projectId}.`;
}
