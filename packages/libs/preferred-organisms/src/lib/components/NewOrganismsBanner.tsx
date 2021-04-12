import { useLocation } from 'react-router-dom';

import { Link } from '@veupathdb/wdk-client/lib/Components';

interface Props {
  newOrganismCount: number;
  projectId: string;
}

export function NewOrganismsBanner({ newOrganismCount, projectId }: Props) {
  const location = useLocation();
  const linkToMockNewOrganisms = location.search.length > 0;

  return (
    <div
      style={{
        color: '#cc0000',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
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
        Please{' '}
        <Link
          to={`/preferred-organisms${
            linkToMockNewOrganisms ? '?showWipFeatures=true' : ''
          }`}
        >
          review My Organisms Preferences.
        </Link>
      </div>
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
