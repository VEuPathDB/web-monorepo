import SliderWidget from '../widgets/Slider';
import { ContainerStylesAddon, ValueTypeAddon } from '../../types/plots';
import {
  NumberOrTimeDelta,
  NumberOrTimeDeltaRange,
  TimeDelta,
} from '../../types/general';

export interface BinWidthControlProps
  extends ValueTypeAddon,
    ContainerStylesAddon {
  /** Label for this control component, optional, default = 'Bin width' */
  label?: string;
  /** The current binWidth */
  binWidth?: NumberOrTimeDelta;
  /** Function to invoke when bin width changes. */
  onBinWidthChange?: (newBinWidth: NumberOrTimeDelta) => void;
  /** the allowed range of binWidths. Optional */
  binWidthRange?: NumberOrTimeDeltaRange;
  /** The step to take when adjusting binWidth. Optional. Downstream defaults to 1. */
  binWidthStep?: number;
}

export default function BinWidthControl({
  label = 'Bin width',
  valueType,
  binWidth,
  onBinWidthChange,
  binWidthRange,
  binWidthStep,
  containerStyles,
}: BinWidthControlProps) {
  const unit =
    valueType != null && valueType === 'date'
      ? (binWidth as TimeDelta).unit
      : undefined;

  return onBinWidthChange ? (
    <SliderWidget
      label={`${label}${unit ? ` (${unit})` : ''}`}
      minimum={binWidthRange?.min}
      maximum={binWidthRange?.max}
      showTextInput={true}
      step={binWidthStep}
      value={
        binWidth
          ? typeof binWidth === 'number'
            ? binWidth
            : binWidth.value
          : undefined
      }
      debounceRateMs={250}
      onChange={(newValue: number) => {
        onBinWidthChange(
          valueType != null && valueType === 'date'
            ? ({ value: newValue, unit } as TimeDelta)
            : newValue
        );
      }}
      containerStyles={containerStyles}
    />
  ) : null;
}
