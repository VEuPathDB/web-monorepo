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
   * If a validator is provided, `required` is no longer useful, and
   * rangeBounds will only be used for auto-filling empty inputs.
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
  /** DKDK check truncated axis */
  isAxisTruncated?: boolean;
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
  //DKDK set default isAxisTruncated is false
  isAxisTruncated = false,
}: BaseInputProps) {
  if (validator && required)
    console.log(
      'WARNING: NumberRangeInput or DateRangeInput will ignore `required` prop because validator was provided.'
    );

  const [focused, setFocused] = useState(false);
  const [localRange, setLocalRange] = useState<
    NumberRange | DateRange | undefined
  >(range);
  const [isReceiving, setIsReceiving] = useState<boolean>(false);
  const [validationWarning, setValidationWarning] = useState<string>('');

  //DKDK
  const [truncatedAxisWarning, setTruncatedAxisWarning] = useState<string>('');

  // handle incoming value changes
  useEffect(() => {
    setIsReceiving(true);
    setLocalRange(range);
  }, [range]);

  // //DKDK
  // console.log('range at NumberAndDateRangeInputs =', range?.min, range?.max);
  // console.log('isAxisTruncated at NumberAndDateRangeInputs =', isAxisTruncated);

  // //DKDK does not work
  // // const span = <span> whatever your string </span>
  // const truncatedAxisText = "Gray shadow(s) indicates that data is truncated/not shown<br />due to your range selection";
  // const truncatedAxisTextSpan = `${truncatedAxisText}`

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
          //DKDK
          if (isAxisTruncated) {
            // setTruncatedAxisWarning('Gray shadow(s) indicates that data is truncated/not shown due to your range selection');
            // setTruncatedAxisWarning('Gray shadow(s) indicates that data is truncated/not shown' + <br /> + 'due to your range selection');
            setTruncatedAxisWarning(
              'Data is truncated (light gray area) by range selection'
            );
          }
        } else {
          setValidationWarning(message);
          //DKDK
          setTruncatedAxisWarning('');
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
    //DKDK
    // isAxisTruncated,
  ]);

  const { min, max } = localRange ?? {};

  console.log('clearButtonLabel =', clearButtonLabel);
  console.log('truncatedAxisWarning =', truncatedAxisWarning);

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
            type={'outlined'}
            text={clearButtonLabel}
            onClick={() => {
              setIsReceiving(false);
              setLocalRange(undefined);
            }}
            containerStyles={{
              paddingLeft: '20px',
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
      {/* DKDK */}
      {truncatedAxisWarning ? (
        // <div style={{width: '80%'}}>
        <Notification
          title="Information"
          text={truncatedAxisWarning}
          //DKDK this was defined as LIGHT_BLUE
          color={'#5586BE'}
          onAcknowledgement={() => {
            setTruncatedAxisWarning('');
          }}
        />
      ) : // </div>
      null}
    </div>
  );
}
