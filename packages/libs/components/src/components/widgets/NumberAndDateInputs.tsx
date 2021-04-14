import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { Typography, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DARK_GRAY, MEDIUM_GRAY } from '../../constants/colors';
import { NumberOrDate } from '../../types/general';
import { debounce } from 'lodash';

type BaseProps<M extends NumberOrDate> = {
  /** Externally controlled value. */
  value?: M;
  /** Minimum allowed value (inclusive) */
  minValue?: M;
  /** Maximum allowed value (inclusive) */
  maxValue?: M;
  /** Function to invoke when value changes. */
  onValueChange: (newValue?: NumberOrDate) => void;
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
 *
 * This component will allow out-of-range and empty values, but it will only
 * call `onValueChange` when the new value is valid. An error message will be
 * displayed when the value is invalid, but the consumer of this component will
 * not be notified of the invalid state. It's possible we will want to add a
 * callback to allow observing invalid states, in the future.
 *
 * The `onValueChange` callback is debounced at 500ms. This allows the user to
 * type a value at a reasonable pace, without invoking the callback for
 * intermediate values. We use a local state variable to track the input's
 * actual value.
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
  const [localValue, setLocalValue] = useState<NumberOrDate | undefined>(value);
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

  const debouncedOnChange = useMemo(() => debounce(onValueChange, 500), [
    onValueChange,
  ]);

  // Cancel pending onChange request when this component is unmounted.
  useEffect(() => debouncedOnChange.cancel, []);

  const boundsCheckedValue = useCallback(
    (newValue?: NumberOrDate) => {
      if (newValue == null) {
        setErrorState({
          error: true,
          helperText: `Please enter a ${valueType}.`,
        });
        return false;
      }
      if (minValue !== undefined && newValue < minValue) {
        newValue = minValue;
        setErrorState({
          error: true,
          helperText: `Sorry, value can't go below ${minValue}!`,
        });
        return false;
      } else if (maxValue !== undefined && newValue > maxValue) {
        newValue = maxValue;
        setErrorState({
          error: true,
          helperText: `Sorry, value can't go above ${maxValue}!`,
        });
        return false;
      } else {
        setErrorState({ error: false, helperText: '' });
        return true;
      }
    },
    [minValue, maxValue]
  );

  // Handle incoming value changes (including changes in minValue/maxValue, which affect boundsCheckedValue)
  useEffect(() => {
    boundsCheckedValue(value);
    if (value !== localValue) setLocalValue(value);
  }, [value, boundsCheckedValue]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue =
        event.target.value === ''
          ? undefined
          : valueType === 'number'
          ? Number(event.target.value)
          : new Date(event.target.value);
      setLocalValue(newValue);
      const isValid = boundsCheckedValue(newValue);
      if (isValid) {
        debouncedOnChange(newValue);
      } else {
        // immediately send the last valid value to onChange
        debouncedOnChange.flush();
      }
    },
    [boundsCheckedValue, debouncedOnChange]
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
            localValue == null
              ? ''
              : valueType === 'number'
              ? localValue
              : (localValue as Date)?.toISOString().substr(0, 10)
          }
          type={valueType}
          variant="outlined"
          onChange={handleChange}
          onFocus={(event) => event.currentTarget.select()}
          error={errorState.error}
          helperText={displayRangeViolationWarnings && errorState.helperText}
        />
      </div>
    </div>
  );
}
