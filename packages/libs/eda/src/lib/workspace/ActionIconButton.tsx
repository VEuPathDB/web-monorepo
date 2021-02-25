import React from 'react';
import { IconAlt } from '@veupathdb/wdk-client/lib/Components';
import { cx } from './Utils';

interface Props {
  iconClassName: string;
  hoverText: string;
  action: () => void;
}

export function ActionIconButton(props: Props) {
  const { action, hoverText, iconClassName } = props;
  return (
    <div className={cx('-ActionIconButton')}>
      <button type="button" title={hoverText} className="link" onClick={action}>
        <IconAlt fa={iconClassName} />
      </button>
    </div>
  );
}
