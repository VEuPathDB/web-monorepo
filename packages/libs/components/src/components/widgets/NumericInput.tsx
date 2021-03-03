import React, { useState } from 'react';

import { Typography, OutlinedInput } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DARK_GRAY, MEDIUM_GRAY } from '../../constants/colors';

export type NumericInputProps = {
  /** The current value of the widget. */
  value: number | undefined;
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

  const useStyles = makeStyles({
    root: {
      height: 30, // default height is 56 and is waaaay too tall
    },
  });
  const classes = useStyles();

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
        <OutlinedInput
          classes={classes}
          defaultValue={value}
          type="number"
          onChange={(event) => {
            const newValue = Number(event.target.value);
            onValueChange(newValue);
          }}
        />
      </div>
    </div>
  );
}
