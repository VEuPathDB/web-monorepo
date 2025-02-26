import { useCallback } from 'react';
import { NumberOrDateRange, NumberRange, DateRange } from '../../types/general';
import {
  ValueTypeAddon,
  LabelAddon,
  ContainerStylesAddon,
} from '../../types/plots';
import {
  NumberRangeInput,
  DateRangeInput,
} from '../widgets/NumberAndDateRangeInputs';

export interface AxisRangeControlProps
  extends ValueTypeAddon,
    LabelAddon,
    ContainerStylesAddon {
  /** the controlled range for the axis */
  range?: NumberOrDateRange;
  /** function to call when widget updates the range */
  onRangeChange?: (newRange?: NumberOrDateRange) => void;
  // add disabled prop to disable input fields
  disabled?: boolean;
  /** is this for a log scale axis? If so, we'll validate the min value to be > 0 */
  logScale?: boolean;
  /** specify step for increment/decrement buttons in MUI number inputs; MUI's default is 1 */
  step?: number;
  /** specify the height of the input element */
  inputHeight?: number;
}

export default function AxisRangeControl({
  label,
  valueType,
  range,
  onRangeChange,
  containerStyles,
  // add disabled prop to disable input fields: default is false
  disabled = false,
  logScale = false,
  step = undefined,
  inputHeight,
}: AxisRangeControlProps) {
  const validator = useCallback(
    (
      range?: NumberOrDateRange
    ): {
      validity: boolean;
      message: string;
    } => {
      if (range) {
        if (range.min === range.max) {
          return {
            validity: false,
            message: 'Start and end of range cannot be the same',
          };
        } else if (range.min > range.max) {
          return {
            validity: false,
            message: 'End cannot be before start of range',
          };
        } else if (logScale && range.min <= 0) {
          return {
            validity: false,
            message:
              'Range start should be greater than zero when using log scale',
          };
        }
      }
      return { validity: true, message: '' };
    },
    [logScale]
  );

  return onRangeChange ? (
    valueType != null && valueType === 'date' ? (
      <DateRangeInput
        label={label}
        range={range as DateRange}
        onRangeChange={onRangeChange}
        allowPartialRange={false}
        containerStyles={containerStyles}
        validator={validator}
        // add disabled prop to disable input fields
        disabled={disabled}
        inputHeight={inputHeight}
      />
    ) : (
      <NumberRangeInput
        label={label}
        range={range as NumberRange}
        onRangeChange={onRangeChange}
        allowPartialRange={false}
        containerStyles={containerStyles}
        validator={validator}
        // add disabled prop to disable input fields
        disabled={disabled}
        step={step}
        inputHeight={inputHeight}
      />
    )
  ) : null;
}
