import React, { useState, useEffect } from 'react';

import { Typography } from '@material-ui/core';
import { DARK_GRAY, MEDIUM_GRAY } from '../../constants/colors';
import { NumberInput, DateInput } from './NumberAndDateInputs';
import {
  NumberRange,
  DateRange,
  NumberOrDateRange,
  NumberOrDate,
} from '../../types/general';

export type BaseProps<M extends NumberOrDateRange> = {
  /** Default value for the range. */
  defaultRange: M;
  /** Minimum and maximum allowed values for the user-inputted range. Optional. */
  rangeBounds?: M;
  /** Externally controlled range. Optional but recommended. */
  controlledRange?: M;
  /** Function to invoke when range changes. */
  onRangeChange?: (newRange: NumberOrDateRange) => void;
  /** UI Label for the widget. Optional */
  label?: string;
  /** Label for lower bound widget. Optional. Default is Min */
  lowerLabel?: string;
  /** Label for upper bound widget. Optional. Default is Max */
  upperLabel?: string;
  /** Additional styles for component container. Optional. */
  containerStyles?: React.CSSProperties;
};

export type NumberRangeInputProps = BaseProps<NumberRange>;

export function NumberRangeInput(props: NumberRangeInputProps) {
  return <BaseInput {...props} valueType="number" />;
}

export type DateRangeInputProps = BaseProps<DateRange>;

export function DateRangeInput(props: DateRangeInputProps) {
  return <BaseInput {...props} valueType="date" />;
}

type BaseInputProps =
  | (NumberRangeInputProps & {
      valueType: 'number';
    })
  | (DateRangeInputProps & {
      valueType: 'date'; // another possibility is 'datetime-local', but the Material UI TextField doesn't provide a date picker
    });

/**
 * Paired input fields taking values we can do < > <= => comparisons with
 * i.e. number or date.
 * Not currently exported. But could be if needed.
 */
function BaseInput({
  defaultRange,
  rangeBounds,
  controlledRange,
  onRangeChange,
  label,
  lowerLabel = 'Min',
  upperLabel = 'Max',
  valueType,
  containerStyles,
}: BaseInputProps) {
  // lower and upper ranges for internal/uncontrolled operation
  const [lower, setLower] = useState<NumberOrDate>(defaultRange.min);
  const [upper, setUpper] = useState<NumberOrDate>(defaultRange.max);

  const [focused, setFocused] = useState(false);

  // listen for changes to the values of the two NumberInputs
  // and communicate outwards via onRangeChange
  useEffect(() => {
    if (onRangeChange && lower !== undefined && upper !== undefined) {
      onRangeChange({ min: lower, max: upper } as NumberOrDateRange);
    }
  }, [lower, upper]);

  // listen for changes to the controlledRange min and max (if provided)
  // and communicate those inwards to lower and upper
  useEffect(() => {
    if (controlledRange !== undefined) setLower(controlledRange.min);
  }, [controlledRange?.min]);

  useEffect(() => {
    if (controlledRange !== undefined) setUpper(controlledRange.max);
  }, [controlledRange?.max]);

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
        {valueType === 'number' ? (
          <NumberInput
            controlledValue={lower as number}
            minValue={rangeBounds?.min as number}
            maxValue={(upper ?? rangeBounds?.max) as number}
            label={lowerLabel}
            onValueChange={(newValue) => {
              if (newValue !== undefined) setLower(newValue as number);
            }}
          />
        ) : (
          <DateInput
            controlledValue={lower as Date}
            minValue={rangeBounds?.min as Date}
            maxValue={(upper ?? rangeBounds?.max) as Date}
            label={lowerLabel}
            onValueChange={(newValue) => {
              if (newValue !== undefined) setLower(newValue as Date);
            }}
          />
        )}
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ margin: 25 }}>
            <Typography
              variant="button"
              style={{ color: focused ? DARK_GRAY : MEDIUM_GRAY }}
            >
              to
            </Typography>
          </div>
        </div>
        {valueType === 'number' ? (
          <NumberInput
            controlledValue={upper as number}
            minValue={(lower ?? rangeBounds?.min) as number}
            maxValue={rangeBounds?.max as number}
            label={upperLabel}
            onValueChange={(newValue) => {
              if (newValue !== undefined) setUpper(newValue as number);
            }}
          />
        ) : (
          <DateInput
            controlledValue={upper as Date}
            minValue={(lower ?? rangeBounds?.min) as Date}
            maxValue={rangeBounds?.max as Date}
            label={upperLabel}
            onValueChange={(newValue) => {
              if (newValue !== undefined) setUpper(newValue as Date);
            }}
          />
        )}
      </div>
    </div>
  );
}
