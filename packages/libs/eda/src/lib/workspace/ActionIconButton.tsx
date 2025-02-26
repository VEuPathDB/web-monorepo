import React from 'react';
import { IconAlt } from '@veupathdb/wdk-client/lib/Components';
import { cx } from './Utils';
import { Tooltip } from '@veupathdb/coreui';

interface Props {
  iconClassName: string;
  hoverText: string;
  action: () => void;
}

export function ActionIconButton(props: Props) {
  const { action, hoverText, iconClassName } = props;
  return (
    <div className={cx('-ActionIconButton')}>
      <Tooltip title={hoverText}>
        <button type="button" className="link" onClick={action}>
          <IconAlt fa={iconClassName} />
        </button>
      </Tooltip>
    </div>
  );
}
