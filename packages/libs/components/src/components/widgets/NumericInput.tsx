import React, { useState } from 'react';

import { Typography, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DARK_GRAY, MEDIUM_GRAY } from '../../constants/colors';

export type NumericInputProps = {
  /** The starting value of the widget. */
  defaultValue: number | undefined;
  /** Minimum allowed value (inclusive) */
  minValue?: number;
  /** Maximum allowed value (inclusive) */
  maxValue?: number;
  /** Function to invoke when value changes. */
  onValueChange: (newValue: number) => void;
  /** UI Label for the widget. Optional */
  label?: string;
  /** Additional styles for component container. Optional. */
  containerStyles?: React.CSSProperties;
};

export default function NumericInput({
  defaultValue,
  minValue,
  maxValue,
  onValueChange,
  label,
  containerStyles,
}: NumericInputProps) {
  const [myValue, setMyValue] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const [errorState, setErrorState] = useState({
    error: false,
    helperText: '',
  });

  const useStyles = makeStyles({
    root: {
      height: 32, // default height is 56 and is waaaay too tall
    },
  });
  const classes = useStyles();

  const handleChange = (event: any) => {
    let newValue = Number(event.target.value);
    if (minValue !== undefined && newValue < minValue) {
      newValue = minValue;
      setErrorState({
        error: true,
        helperText: `Sorry, value can't go below ${minValue}!`,
      });
    } else if (maxValue !== undefined && newValue > maxValue) {
      newValue = maxValue;
      setErrorState({
        error: true,
        helperText: `Sorry, value can't go above ${maxValue}!`,
      });
    } else {
      setErrorState({ error: false, helperText: '' });
    }
    setMyValue(newValue);
    onValueChange(newValue);
  };

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
        <TextField
          InputProps={{ classes }}
          value={myValue}
          type="number"
          variant="outlined"
          onChange={handleChange}
          {...errorState}
        />
      </div>
    </div>
  );
}
