import { IconAlt, Link } from '@veupathdb/wdk-client/lib/Components';

interface Props {
  onDismiss: () => void;
  newOrganismCount: number;
  displayName: string;
}

export function NewOrganismsBanner({
  newOrganismCount,
  onDismiss,
  displayName,
}: Props) {
  return (
    <div
      style={{
        display: 'inline-grid',
        gridAutoFlow: 'column',
        gap: '1em',
        justifyContent: 'flex-end',
        marginRight: '1em',
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
        {makeNewOrganismDescription(newOrganismCount, displayName)}
        <br />
        <Link to="/preferred-organisms">
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
        onClick={onDismiss}
      >
        <IconAlt fa="times fa-2x" />
      </button>
    </div>
  );
}

function makeNewOrganismDescription(
  newOrganismCount: number,
  displayName: string
) {
  return newOrganismCount === 1
    ? `${displayName} recently added 1 new organism.`
    : `${displayName} recently added ${newOrganismCount} new organisms.`;
}
