import React, { useState } from 'react';

import { Typography } from '@material-ui/core';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { DARK_GRAY, MEDIUM_GRAY } from '../../constants/colors';

export type NumericInputProps = {
  /** The current value of the widget. */
  value: number;
  /** Function to invoke when value changes. */
  onValueChange: (newValue: number) => void;
  /** UI Label for the widget. Optional */
  label?: string;
  /** Additional styles for component container. Optional. */
  containerStyles?: React.CSSProperties;
};

export default function NumericInput({
  value,
  onValueChange,
  label,
  containerStyles,
}: NumericInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      style={{ ...containerStyles }}
      onMouseOver={() => setFocused(true)}
      onMouseOut={() => setFocused(false)}
    >
      {label && (
        <Typography
          variant="button"
          style={{ color: focused ? DARK_GRAY : MEDIUM_GRAY }}
        >
          {label}
        </Typography>
      )}
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <input
          style={{
            borderWidth: 0,
            fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
            fontSize: '14px',
            color: MEDIUM_GRAY,
            width: 40,
          }}
          value={value}
        />
        <KeyboardArrowUpIcon
          htmlColor={MEDIUM_GRAY}
          style={{ width: 20, height: 20 }}
          onClick={() => onValueChange(value + 1)}
        />
        <KeyboardArrowDownIcon
          htmlColor={MEDIUM_GRAY}
          style={{ width: 20, height: 20 }}
          onClick={() => onValueChange(value + -1)}
        />
      </div>
    </div>
  );
}
