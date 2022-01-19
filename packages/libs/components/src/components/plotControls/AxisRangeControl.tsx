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
  /** DKDK Parent component name, e.g., HistogramFilter: will be used for adjusting input form width */
  parentComponentName?: string;
}

export default function AxisRangeControl({
  label,
  valueType,
  range,
  onRangeChange,
  containerStyles,
  //DKDK parent component name
  parentComponentName,
}: AxisRangeControlProps) {
  const validator = useCallback((range?: NumberOrDateRange): {
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
      }
    }
    return { validity: true, message: '' };
  }, []);

  return onRangeChange ? (
    valueType != null && valueType === 'date' ? (
      <DateRangeInput
        label={label}
        range={range as DateRange}
        onRangeChange={onRangeChange}
        allowPartialRange={false}
        containerStyles={containerStyles}
        validator={validator}
        //DKDK parentComponentName
        parentComponentName={parentComponentName}
      />
    ) : (
      <NumberRangeInput
        label={label}
        range={range as NumberRange}
        onRangeChange={onRangeChange}
        allowPartialRange={false}
        containerStyles={containerStyles}
        validator={validator}
        //DKDK parentComponentName
        parentComponentName={parentComponentName}
      />
    )
  ) : null;
}
