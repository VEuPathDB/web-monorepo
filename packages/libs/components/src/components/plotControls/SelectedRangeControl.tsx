import {
  NumberRangeInput,
  DateRangeInput,
} from '../widgets/NumberAndDateRangeInputs';
import LabelledGroup from '../widgets/LabelledGroup';
import { NumberOrDateRange, NumberRange, DateRange } from '../../types/general';
import { ContainerStylesAddon, ValueTypeAddon } from '../../types/plots';
import { useCallback } from 'react';

export interface SelectedRangeControlProps
  extends ValueTypeAddon,
    ContainerStylesAddon {
  /** Label for this control component, optional */
  label?: string;
  /** A range to highlight by means of opacity. Optional */
  selectedRange?: NumberOrDateRange;
  /** function to call upon selecting a range (in independent axis). Optional */
  onSelectedRangeChange?: (newRange?: NumberOrDateRange) => void;
  /** Min and max allowed values for the selected range. Used to auto-fill start or end. Optional */
  selectedRangeBounds?: NumberOrDateRange; // TO DO: handle DateRange too
  /** Do we enforce the range bounds? Default is false */
  enforceBounds?: boolean;
  /** show a clear button, optional, default is true */
  showClearButton?: boolean;
}

export default function SelectedRangeControl({
  label,
  valueType,
  selectedRange,
  onSelectedRangeChange,
  selectedRangeBounds,
  enforceBounds = false,
  showClearButton = true,
  containerStyles,
}: SelectedRangeControlProps) {
  const validator = enforceBounds
    ? undefined
    : // use a custom validator when we don't want to
      // actually constrain the range between the bounds.
      useCallback((range?: NumberOrDateRange) => {
        if (
          range &&
          (valueType === 'date'
            ? // only compare the date part (one can be datetime, just-entered value is just a date)
              (range.min as string).substring(0, 10) >
              (range.max as string).substring(0, 10)
            : range?.min > range?.max)
        ) {
          return {
            validity: false,
            message: 'Range start cannot be above range end',
          };
        } else {
          return { validity: true, message: '' };
        }
      }, []);

  return onSelectedRangeChange ? (
    <LabelledGroup label={label}>
      {valueType != null && valueType === 'date' ? (
        <DateRangeInput
          rangeBounds={selectedRangeBounds as DateRange}
          range={selectedRange as DateRange}
          onRangeChange={onSelectedRangeChange}
          allowPartialRange={false}
          showClearButton={showClearButton}
          containerStyles={containerStyles}
          validator={validator}
        />
      ) : (
        <NumberRangeInput
          rangeBounds={selectedRangeBounds as NumberRange}
          range={selectedRange as NumberRange}
          onRangeChange={onSelectedRangeChange}
          allowPartialRange={false}
          showClearButton={showClearButton}
          containerStyles={containerStyles}
          validator={validator}
        />
      )}
    </LabelledGroup>
  ) : null;
}
