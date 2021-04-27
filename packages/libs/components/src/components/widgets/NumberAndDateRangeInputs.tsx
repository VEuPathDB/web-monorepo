import React, { useState, useEffect, useCallback } from 'react';

import { Typography } from '@material-ui/core';
import { DARK_GRAY, MEDIUM_GRAY } from '../../constants/colors';
import { NumberInput, DateInput } from './NumberAndDateInputs';
import { NumberRange, DateRange, NumberOrDateRange } from '../../types/general';

export type BaseProps<M extends NumberOrDateRange> = {
  /** Externally controlled range. */
  range?: M;
  /** If true, warn about empty lower or upper values. Default is false */
  required?: boolean;
  /** Function to invoke when range changes. */
  onRangeChange: (newRange: NumberOrDateRange) => void;
  /** When true, allow undefined min or max. Default is true */
  allowPartialRanges?: boolean;
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
  allowPartialRanges = true,
  label,
  lowerLabel = '',
  upperLabel = '',
  valueType,
  containerStyles,
}: BaseInputProps) {
  const [focused, setFocused] = useState(false);
  const [localRange, setLocalRange] = useState<
    NumberRange | DateRange | undefined
  >(range);
  const [isReceiving, setIsReceiving] = useState<boolean>(false);

  // handle incoming value changes
  useEffect(() => {
    setIsReceiving(true);
    setLocalRange(range);
  }, [range]);

  // if we are not currently receiving incoming data
  // pass localRange (if it differs from `range`) out to consumer
  // respecting `allowPartialRanges`
  useEffect(() => {
    if (
      !isReceiving &&
      localRange &&
      (localRange.min !== range?.min || localRange.max !== range?.max) &&
      (allowPartialRanges || (localRange.min != null && localRange.max != null))
    ) {
      onRangeChange(localRange);
    }
  }, [localRange, range, isReceiving, onRangeChange, allowPartialRanges]);

  const { min, max } = localRange ?? {};
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
              setIsReceiving(false);
              setLocalRange({ min: newValue, max } as NumberRange);
            }}
          />
        ) : (
          <DateInput
            value={min as string}
            minValue={rangeBounds?.min as string}
            maxValue={(max ?? rangeBounds?.max) as string}
            label={lowerLabel}
            required={required}
            onValueChange={(newValue) => {
              setIsReceiving(false);
              setLocalRange({ min: newValue, max } as DateRange);
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
              setIsReceiving(false);
              setLocalRange({ min, max: newValue } as NumberRange);
            }}
          />
        ) : (
          <DateInput
            value={max as string}
            minValue={(min ?? rangeBounds?.min) as string}
            maxValue={rangeBounds?.max as string}
            label={upperLabel}
            required={required}
            onValueChange={(newValue) => {
              setIsReceiving(false);
              setLocalRange({ min, max: newValue } as DateRange);
            }}
          />
        )}
      </div>
    </div>
  );
}
