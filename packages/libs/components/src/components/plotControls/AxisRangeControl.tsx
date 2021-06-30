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
}

export default function AxisRangeControl({
  label,
  valueType,
  range,
  onRangeChange,
  containerStyles,
}: AxisRangeControlProps) {
  return onRangeChange ? (
    valueType != null && valueType === 'date' ? (
      <DateRangeInput
        label={label}
        range={range as DateRange}
        onRangeChange={onRangeChange}
        allowPartialRange={false}
        containerStyles={containerStyles}
      />
    ) : (
      <NumberRangeInput
        label={label}
        range={range as NumberRange}
        onRangeChange={onRangeChange}
        allowPartialRange={false}
        containerStyles={containerStyles}
      />
    )
  ) : null;
}
