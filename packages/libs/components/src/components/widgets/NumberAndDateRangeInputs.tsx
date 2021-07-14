import React, { useState, useEffect, useMemo } from 'react';

import { Typography } from '@material-ui/core';
import { DARK_GRAY, MEDIUM_GRAY } from '../../constants/colors';
import { NumberInput, DateInput } from './NumberAndDateInputs';
import Button from './Button';
import Notification from './Notification';
import { NumberRange, DateRange, NumberOrDateRange } from '../../types/general';

export type BaseProps<M extends NumberOrDateRange> = {
  /** Externally controlled range. */
  range?: M;
  /** If true, warn about empty lower or upper values. Default is false */
  required?: boolean;
  /** Function to invoke when range changes. */
  onRangeChange: (newRange?: NumberOrDateRange) => void;
  /** When true, allow undefined min or max. Default is true
   * When false, and rangeBounds is given, use the min or max of rangeBounds to fill in the missing value.
   * */
  allowPartialRange?: boolean;
  /** Minimum and maximum allowed values for the user-inputted range. Optional. */
  rangeBounds?: M;
  /** Optional validator function. Should return {validity: true, message: ''} if value is allowed.
   * If provided, rangeBounds and required will have no effect.
   */
  validator?: (
    newRange?: NumberOrDateRange
  ) => { validity: boolean; message: string };
  /** UI Label for the widget. Optional */
  label?: string;
  /** Label for lower bound widget. Optional. Default is Min */
  lowerLabel?: string;
  /** Label for upper bound widget. Optional. Default is Max */
  upperLabel?: string;
  /** Additional styles for component container. Optional. */
  containerStyles?: React.CSSProperties;
  /** Show cancel/clear button */
  showClearButton?: boolean;
  /** Text to adorn the clear button; Default is 'Clear' */
  clearButtonLabel?: string;
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
  validator,
  onRangeChange,
  allowPartialRange = true,
  label,
  lowerLabel = '',
  upperLabel = '',
  valueType,
  containerStyles,
  showClearButton = false,
  clearButtonLabel = 'Clear',
}: BaseInputProps) {
  if (validator && (required || rangeBounds))
    console.log(
      'WARNING: NumberRangeInput or DateRangeInput will ignore props required and/or rangeBounds because validator was provided.'
    );

  const [focused, setFocused] = useState(false);
  const [localRange, setLocalRange] = useState<
    NumberRange | DateRange | undefined
  >(range);
  const [isReceiving, setIsReceiving] = useState<boolean>(false);
  const [validationWarning, setValidationWarning] = useState<string>('');

  // handle incoming value changes
  useEffect(() => {
    setIsReceiving(true);
    setLocalRange(range);
  }, [range]);

  // if we are not currently receiving incoming data
  // pass localRange (if it differs from `range`) out to consumer
  // respecting `allowPartialRange`
  useEffect(() => {
    if (!isReceiving) {
      if (
        localRange &&
        (allowPartialRange ||
          (localRange.min != null && localRange.max != null))
      ) {
        const { validity, message } = validator
          ? validator(localRange)
          : { validity: true, message: '' };
        if (validity) {
          // communicate the change if there is a change
          if (localRange.min !== range?.min || localRange.max !== range?.max) {
            onRangeChange(localRange);
          }
          setValidationWarning('');
        } else {
          setValidationWarning(message);
        }
      } else if (
        localRange?.min == null &&
        localRange?.max == null &&
        range?.min != null &&
        range?.max != null
      ) {
        onRangeChange(undefined);
      } else if (
        // fill in the min or max for a partially entered range
        localRange &&
        rangeBounds &&
        !allowPartialRange
      ) {
        if (localRange.min == null) {
          setLocalRange({
            min: rangeBounds.min,
            max: localRange.max,
          } as NumberOrDateRange);
        } else if (localRange.max == null) {
          setLocalRange({
            min: localRange.min,
            max: rangeBounds.max,
          } as NumberOrDateRange);
        }
      }
    }
  }, [
    localRange,
    range,
    isReceiving,
    onRangeChange,
    allowPartialRange,
    rangeBounds,
    validator,
  ]);

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
            minValue={validator ? undefined : (rangeBounds?.min as number)}
            maxValue={
              validator ? undefined : ((max ?? rangeBounds?.max) as number)
            }
            label={lowerLabel}
            required={validator ? undefined : required}
            onValueChange={(newValue) => {
              setIsReceiving(false);
              setLocalRange({ min: newValue, max } as NumberRange);
            }}
          />
        ) : (
          <DateInput
            value={min as string}
            minValue={validator ? undefined : (rangeBounds?.min as string)}
            maxValue={
              validator ? undefined : ((max ?? rangeBounds?.max) as string)
            }
            label={lowerLabel}
            required={validator ? undefined : required}
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
            minValue={
              validator ? undefined : ((min ?? rangeBounds?.min) as number)
            }
            maxValue={validator ? undefined : (rangeBounds?.max as number)}
            label={upperLabel}
            required={validator ? undefined : required}
            onValueChange={(newValue) => {
              setIsReceiving(false);
              setLocalRange({ min, max: newValue } as NumberRange);
            }}
          />
        ) : (
          <DateInput
            value={max as string}
            minValue={
              validator ? undefined : ((min ?? rangeBounds?.min) as string)
            }
            maxValue={validator ? undefined : (rangeBounds?.max as string)}
            label={upperLabel}
            required={validator ? undefined : required}
            onValueChange={(newValue) => {
              setIsReceiving(false);
              setLocalRange({ min, max: newValue } as DateRange);
            }}
          />
        )}
        {showClearButton && (
          <Button
            type={'solid'}
            text={clearButtonLabel}
            onClick={() => {
              setIsReceiving(false);
              setLocalRange(undefined);
            }}
            containerStyles={{
              paddingLeft: '10px',
              height: '20px',
            }}
          />
        )}
      </div>
      {validationWarning ? (
        <Notification
          title="Warning"
          text={validationWarning}
          onAcknowledgement={() => {
            setValidationWarning('');
          }}
        />
      ) : null}
    </div>
  );
}
