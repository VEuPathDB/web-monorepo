import Toggle from '@veupathdb/wdk-client/lib/Components/Icon/Toggle';

import { cx } from './PreferredOrganismsConfig';

import './PreferredOrganismsToggle.scss';

interface Props {
  enabled: boolean;
  onClick: () => void;
  showLabel?: boolean;
}

export function PreferredOrganismsToggle({
  enabled,
  onClick,
  showLabel = true,
}: Props) {
  return (
    <button
      className={cx('--Toggle')}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
      }}
      type="button"
      onClick={onClick}
    >
      <Toggle on={!enabled} />
      {showLabel && (
        <div>
          Disable <strong>My Organism Preferences</strong>
        </div>
      )}
    </button>
  );
}
