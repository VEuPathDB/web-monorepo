import Toggle from '@veupathdb/wdk-client/lib/Components/Icon/Toggle';

import { cx } from './PreferredOrganismsConfig';

interface Props {
  enabled: boolean;
  onClick: () => void;
}

export function PreferredOrganismsToggle({ enabled, onClick }: Props) {
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
      <Toggle on={!enabled} /> Disable{' '}
      <span className={cx('--InlineTitle')}>My Organism Preferences</span>
    </button>
  );
}
