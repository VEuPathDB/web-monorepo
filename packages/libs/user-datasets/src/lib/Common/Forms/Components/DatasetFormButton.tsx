import React from 'react';
import * as util from '../../../Utils';

import { useUITheme } from '@veupathdb/coreui/lib/components/theming';

import './DatasetFormButton.scss';

export enum ActionKind {
  Primary,

  /**
   * Secondary action, highlighted in light blue.
   */
  Secondary,

  /**
   * Tertiary action, gray button;
   */
  Tertiary,
}

export interface DatasetFormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly children: React.ReactNode;
  readonly onClick: util.Runnable;
  readonly disabled?: boolean;
  readonly kind?: ActionKind;
}

export function DatasetFormButton({
  children,
  className,
  onClick,
  disabled,
  type = 'button',
  kind = ActionKind.Primary,
  ...attrs
}: DatasetFormButtonProps): React.ReactElement {
  const classes = (function(): string {
    const result: Array<string> = ['ud-action'];

    switch (kind) {
      case ActionKind.Primary:
        result.push('primary');
        break;

      case ActionKind.Secondary:
        result.push('secondary');
        break;

      case ActionKind.Tertiary:
        result.push('tertiary');
        break;
    }

    if (util.isNonEmptyString(className)) {
      result.push(className);
    }

    return result.join(' ');
  })();

  const styleOverride = util.ifDefined(
    useUITheme()?.palette?.primary,
    (palette): util.Possible<React.CSSProperties> => {
      if (disabled)
        return undefined;

      switch (kind) {
        case ActionKind.Primary:
          return ({
            backgroundColor: palette.hue['600'],
            boxShadow: '4px 5px ' + palette.hue['700'],
          });
      }
    },
  );

  return (
    <button
      type={type}
      className={classes}
      style={styleOverride}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      {...attrs}
    >
      {children}
    </button>
  );
}
