import React, { useState, useEffect, useCallback } from 'react';

import { Typography, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DARK_GRAY, MEDIUM_GRAY } from '../../constants/colors';
import { NumberOrDate } from '../../types/general';

type BaseProps<M extends NumberOrDate> = {
  /** Externally controlled value. */
  value: M;
  /** Minimum allowed value (inclusive) */
  minValue?: M;
  /** Maximum allowed value (inclusive) */
  maxValue?: M;
  /** Function to invoke when value changes. */
  onValueChange: (newValue: NumberOrDate) => void;
  /** UI Label for the widget. Optional */
  label?: string;
  /** Additional styles for component container. Optional. */
  containerStyles?: React.CSSProperties;
  /** Do not flag up value range violations */
  displayRangeViolationWarnings?: boolean;
};

export type NumberInputProps = BaseProps<number>;

export function NumberInput(props: NumberInputProps) {
  return <BaseInput {...props} valueType="number" />;
}

export type DateInputProps = BaseProps<Date>;

export function DateInput(props: DateInputProps) {
  return <BaseInput {...props} valueType="date" />;
}

type BaseInputProps =
  | (NumberInputProps & {
      valueType: 'number';
    })
  | (DateInputProps & {
      valueType: 'date'; // another possibility is 'datetime-local', but the Material UI TextField doesn't provide a date picker
    });

/**
 * Input field taking a value we can do < > <= => comparisons with
 * i.e. number or date.
 * Not currently exported. But could be if needed.
 */
function BaseInput({
  value,
  minValue,
  maxValue,
  onValueChange,
  label,
  valueType,
  containerStyles,
  displayRangeViolationWarnings = true,
}: BaseInputProps) {
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

  const boundsCheckedValue = useCallback(
    (newValue: NumberOrDate) => {
      if (minValue !== undefined && newValue < minValue) {
        newValue = minValue;
        displayRangeViolationWarnings &&
          setErrorState({
            error: true,
            helperText: `Sorry, value can't go below ${minValue}!`,
          });
      } else if (maxValue !== undefined && newValue > maxValue) {
        newValue = maxValue;
        displayRangeViolationWarnings &&
          setErrorState({
            error: true,
            helperText: `Sorry, value can't go above ${maxValue}!`,
          });
      } else {
        setErrorState({ error: false, helperText: '' });
      }
      return newValue;
    },
    [minValue, maxValue, displayRangeViolationWarnings, setErrorState]
  );

  useEffect(() => {
    // if the min or max change
    // run the controlledValue through the bounds checker
    // to fix controlledValue or reset the error states as required
    const newValue = boundsCheckedValue(value);
    if (newValue !== value) onValueChange(newValue);
  }, [boundsCheckedValue, value, onValueChange]);

  const handleChange = useCallback(
    (event: any) => {
      const newValue = boundsCheckedValue(
        valueType === 'number'
          ? Number(event.target.value)
          : new Date(event.target.value)
      );
      if (newValue !== value) onValueChange(newValue);
    },
    [value, boundsCheckedValue, onValueChange]
  );

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
          value={
            valueType === 'number'
              ? value
              : (value as Date)?.toISOString().substr(0, 10)
          }
          type={valueType}
          variant="outlined"
          onChange={handleChange}
          {...errorState}
        />
      </div>
    </div>
  );
}
