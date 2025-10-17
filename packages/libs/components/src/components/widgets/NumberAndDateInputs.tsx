import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { Typography, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { DARKEST_GRAY, MEDIUM_GRAY } from '../../constants/colors';
import { NumberOrDate } from '../../types/general';
import { debounce } from 'lodash';
import { warning } from '@veupathdb/coreui/lib/definitions/colors';

type BaseProps<M extends NumberOrDate> = {
  /** Externally controlled value. */
  value?: M;
  /** Minimum allowed value (inclusive) */
  minValue?: M;
  /** Maximum allowed value (inclusive) */
  maxValue?: M;
  /** If true, warn about empty value. Default is false. */
  required?: boolean;
  /** Optional validator function. Should return {validity: true, message: ''} if value is allowed.
   * If provided, minValue and maxValue and required will have no effect.
   */
  validator?: (newValue?: M) => {
    validity: boolean;
    message: string;
  };
  /** Function to invoke when value changes. */
  onValueChange: (newValue?: M) => void;
  /** UI Label for the widget. Optional */
  label?: string;
  /** Additional styles for component container. Optional. */
  containerStyles?: React.CSSProperties;
  /** Do not flag up value range violations */
  displayRangeViolationWarnings?: boolean;
  /** Disabled? Default is false */
  disabled?: boolean;
  /** Style the Text Field with the warning color and bold stroke */
  applyWarningStyles?: boolean;
  /** specify the height of the input element */
  inputHeight?: number;
};

export type NumberInputProps = BaseProps<number> & {
  step?: number;
};

export function NumberInput(props: NumberInputProps) {
  return <BaseInput<number> {...props} valueType="number" />;
}

export type DateInputProps = BaseProps<string>;

export function DateInput(props: DateInputProps) {
  return <BaseInput<string> {...props} valueType="date" />;
}

type NumberInputPropsInternal<M extends NumberOrDate> = BaseProps<M> & {
  valueType: 'number';
  step?: number;
};

type DateInputPropsInternal<M extends NumberOrDate> = BaseProps<M> & {
  valueType: 'date';
};

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
function BaseInput<M extends NumberOrDate>(
  props: NumberInputPropsInternal<M> | DateInputPropsInternal<M>
) {
  const {
    value,
    minValue,
    maxValue,
    validator,
    required = false,
    onValueChange,
    label,
    valueType,
    containerStyles,
    displayRangeViolationWarnings = true,
    disabled = false,
    applyWarningStyles = false,
    inputHeight = 36.5,
  } = props;

  if (validator && (required || minValue != null || maxValue != null))
    console.log(
      'WARNING: NumberInput or DateInput will ignore props required, minValue and/or maxValue because validator was provided.'
    );

  const [localValue, setLocalValue] = useState(value);
  const [errorState, setErrorState] = useState({
    error: false,
    helperText: '',
  });

  const classes = makeStyles({
    root: {
      height: inputHeight, // default height is 56 and is waaaay too tall
      // 34.5 is the height of the reset button, but 36.5 lines up better
      // set width for date
      width: valueType === 'date' ? 165 : '',
    },
    notchedOutline: applyWarningStyles
      ? {
          borderColor: warning[500],
          borderWidth: 3,
        }
      : {},
  })();

  const debouncedOnChange = useMemo(
    () => debounce(onValueChange, 500),
    [onValueChange]
  );

  // Cancel pending onChange request when this component is unmounted.
  useEffect(() => debouncedOnChange.cancel, []);

  const defaultValidator = useCallback(
    (newValue?: M): { validity: boolean; message: string } => {
      if (newValue == null) {
        return {
          validity: !required,
          message: required ? `Please enter a ${valueType}.` : '',
        };
      }
      if (minValue != null && newValue < minValue) {
        return {
          validity: false,
          message: `Sorry, value can't go below ${minValue}!`,
        };
      } else if (maxValue != null && newValue > maxValue) {
        return {
          validity: false,
          message: `Sorry, value can't go above ${maxValue}!`,
        };
      } else if (
        minValue != null &&
        newValue === minValue &&
        maxValue != null &&
        newValue === maxValue
      ) {
        return {
          validity: false,
          message: `Sorry, min and max values can't be the same!`,
        };
      } else {
        return { validity: true, message: '' };
      }
    },
    [required, minValue, maxValue, valueType]
  );

  const boundsCheckedValue = useCallback(
    (newValue?: M) => {
      const _validator = validator ?? defaultValidator;
      const { validity, message } = _validator(newValue);
      setErrorState({ error: message !== '', helperText: message });
      return validity;
    },
    [validator, defaultValidator]
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
          ? (Number(event.target.value) as M)
          : (String(event.target.value) as M);
      setLocalValue(newValue);
      const isValid = boundsCheckedValue(newValue);
      if (isValid) {
        debouncedOnChange(newValue);
      } else {
        // immediately send the last valid value to onChange
        debouncedOnChange.flush();
      }
    },
    [boundsCheckedValue, debouncedOnChange, valueType]
  );

  return (
    <div
      // containerStyles is not used here - but bin control uses this!
      style={{ ...containerStyles }}
    >
      {label && (
        <Typography
          variant="button"
          style={{ color: disabled ? MEDIUM_GRAY : DARKEST_GRAY }}
        >
          {label}
        </Typography>
      )}
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <TextField
          InputProps={{ classes }}
          inputProps={{
            step: isNumberInput(props) ? props.step : undefined,
          }}
          value={
            localValue == null
              ? ''
              : valueType === 'number'
              ? localValue
              : typeof localValue === 'string'
              ? localValue.substr(0, 10)
              : '' // MUI date picker can't handle date-times
          }
          type={valueType}
          variant="outlined"
          onChange={handleChange}
          onFocus={(event) => event.currentTarget.select()}
          error={errorState.error}
          helperText={displayRangeViolationWarnings && errorState.helperText}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function isNumberInput<M extends NumberOrDate>(
  props: NumberInputPropsInternal<M> | DateInputPropsInternal<M>
): props is NumberInputPropsInternal<M> {
  return props.valueType === 'number';
}
