import Toggle from '@veupathdb/wdk-client/lib/Components/Icon/Toggle';

import { cx } from './PreferredOrganismsConfig';

import './PreferredOrganismsToggle.scss';

interface Props {
  enabled: boolean;
  label?: React.ReactNode;
  onClick: () => void;
}

export function PreferredOrganismsToggle({ enabled, label, onClick }: Props) {
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
      <Toggle on={enabled} />
      {label}
    </button>
  );
}
