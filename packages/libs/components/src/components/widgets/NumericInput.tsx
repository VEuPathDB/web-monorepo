import React, { useState, useEffect } from 'react';

import { Typography, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DARK_GRAY, MEDIUM_GRAY } from '../../constants/colors';

export type NumericInputProps = {
  /** The starting value of the widget. */
  defaultValue?: number;
  /** Externally controlled value. */
  controlledValue?: number;
  /** Minimum allowed value (inclusive) */
  minValue?: number;
  /** Maximum allowed value (inclusive) */
  maxValue?: number;
  /** Function to invoke when value changes. */
  onValueChange: (newValue?: number) => void;
  /** UI Label for the widget. Optional */
  label?: string;
  /** Additional styles for component container. Optional. */
  containerStyles?: React.CSSProperties;
};

export default function NumericInput({
  defaultValue,
  controlledValue,
  minValue,
  maxValue,
  onValueChange,
  label,
  containerStyles,
}: NumericInputProps) {
  const [focused, setFocused] = useState(false);
  const [errorState, setErrorState] = useState({
    error: false,
    helperText: '',
  });

  const classes = makeStyles({
    root: {
      height: 32, // default height is 56 and is waaaay too tall
    },
  })();

  const boundsCheckedValue = (newValue?: number) => {
    if (newValue === undefined) return;
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
    return newValue;
  };

  useEffect(() => {
    // if the min or max change
    // run the controlledValue through the bounds checker
    // to fix controlledValue or reset the error states as required
    const newValue = boundsCheckedValue(controlledValue);
    if (newValue !== undefined) onValueChange(newValue);
  }, [minValue, maxValue]);

  const handleChange = (event: any) => {
    if (event.target.value.length > 0) {
      const newValue = boundsCheckedValue(Number(event.target.value));
      if (newValue !== undefined) onValueChange(newValue);
    } else {
      // allows user to clear the input box
      onValueChange(undefined);
    }
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
          defaultValue={defaultValue}
          value={controlledValue}
          type="number"
          variant="outlined"
          onChange={handleChange}
          {...errorState}
        />
      </div>
    </div>
  );
}
