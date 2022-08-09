import React, { useState } from 'react';
import { Typography } from '@material-ui/core';

import { LIGHT_BLUE, MEDIUM_GRAY } from '../../constants/colors';
import { FilledSwitch } from '@veupathdb/coreui';
import { grey } from '@material-ui/core/colors';

export type SwitchProps = {
  /** Optional label for widget. */
  label?: string;
  /** If the switch is on or off. */
  state?: boolean;
  /** What action to take when state changes. */
  onStateChange: (newState: boolean) => void;
  /** Color to use. Will accept any valid CSS color definition.
   * Defaults to LIGHT_BLUE */
  color?: string;
  /** Additional styles to apply to the widget container. */
  containerStyles?: React.CSSProperties;
  /** If true, disable interaction with the switch */
  disabled?: boolean;
  /** label position; default is 'before' */
  labelPosition?: 'before' | 'after';
};

/**
 * A simple switch UI widget.
 *
 * Should be used when you want to toggle something
 * between two distinct options. */
export default function Switch({
  label,
  state,
  onStateChange,
  color = LIGHT_BLUE,
  containerStyles = {},
  disabled = false,
  labelPosition = 'before',
}: SwitchProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: labelPosition === 'after' ? 'row-reverse' : 'row',
        alignItems: 'center',
        ...containerStyles,
      }}
    >
      {label && (
        <Typography
          variant="button"
          style={{
            color: disabled ? MEDIUM_GRAY : 'rgb(0, 0, 0)',
            ...(labelPosition === 'after'
              ? { paddingLeft: 5 }
              : { paddingRight: 5 }),
          }}
        >
          {label}
        </Typography>
      )}
      <FilledSwitch
        options={[false, true]}
        selectedOption={state ?? false}
        onOptionChange={onStateChange}
        disabled={disabled}
        styleOverrides={{
          default: [
            { backgroundColor: grey[400] },
            { backgroundColor: color, knobColor: 'white' },
          ],
          hover: [
            { backgroundColor: grey[500] },
            { backgroundColor: color, knobColor: 'white' },
          ],
          disabled: { backgroundColor: grey[300] },
        }}
      />
    </div>
  );
}
