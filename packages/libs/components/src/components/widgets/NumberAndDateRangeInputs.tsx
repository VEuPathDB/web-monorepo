import React, { useState } from 'react';

import { Typography } from '@material-ui/core';
import { DARK_GRAY, MEDIUM_GRAY } from '../../constants/colors';
import { NumberInput, DateInput } from './NumberAndDateInputs';
import { NumberRange, DateRange, NumberOrDateRange } from '../../types/general';

export type BaseProps<M extends NumberOrDateRange> = {
  /** Externally controlled range. */
  range: M;
  /** If true, warn about empty lower or upper values. Default is false */
  required?: boolean;
  /** Function to invoke when range changes. */
  onRangeChange: (newRange: NumberOrDateRange) => void;
  /** Minimum and maximum allowed values for the user-inputted range. Optional. */
  rangeBounds?: M;
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
  range,
  required = false,
  rangeBounds,
  onRangeChange,
  label,
  lowerLabel = 'Min',
  upperLabel = 'Max',
  valueType,
  containerStyles,
}: BaseInputProps) {
  const [focused, setFocused] = useState(false);

  const { min, max } = range ?? {};
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
            value={min as number}
            minValue={rangeBounds?.min as number}
            maxValue={(max ?? rangeBounds?.max) as number}
            label={lowerLabel}
            required={required}
            onValueChange={(newValue) => {
              if (newValue !== undefined && onRangeChange)
                onRangeChange({ min: newValue, max } as NumberRange);
            }}
          />
        ) : (
          <DateInput
            value={min as Date}
            minValue={rangeBounds?.min as Date}
            maxValue={(max ?? rangeBounds?.max) as Date}
            label={lowerLabel}
            required={required}
            onValueChange={(newValue) => {
              if (newValue !== undefined && onRangeChange)
                onRangeChange({ min: newValue, max } as DateRange);
            }}
          />
        )}
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {/* change margin */}
          <div style={{ margin: '3px 15px 15px 15px' }}>
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
            value={max as number}
            minValue={(min ?? rangeBounds?.min) as number}
            maxValue={rangeBounds?.max as number}
            label={upperLabel}
            required={required}
            onValueChange={(newValue) => {
              if (newValue !== undefined && onRangeChange)
                onRangeChange({ min, max: newValue } as NumberRange);
            }}
          />
        ) : (
          <DateInput
            value={max as Date}
            minValue={(min ?? rangeBounds?.min) as Date}
            maxValue={rangeBounds?.max as Date}
            label={upperLabel}
            required={required}
            onValueChange={(newValue) => {
              if (newValue !== undefined && onRangeChange)
                onRangeChange({ min, max: newValue } as DateRange);
            }}
          />
        )}
      </div>
    </div>
  );
}
