import SliderWidget from '../widgets/Slider';
import { ContainerStylesAddon, ValueTypeAddon } from '../../types/plots';
import {
  NumberOrTimeDelta,
  NumberOrTimeDeltaRange,
  TimeDelta,
} from '../../types/general';
import { Select, Typography } from '@material-ui/core';
import { MEDIUM_GRAY, DARKEST_GRAY } from '../../constants/colors';
import { MenuItem } from '@material-ui/core';

export interface BinWidthControlProps
  extends ValueTypeAddon,
    ContainerStylesAddon {
  /** Label for this control component, optional, default = 'Bin width' */
  label?: string;
  /** The current binWidth */
  binWidth?: NumberOrTimeDelta;
  /** The current binUnit */
  binUnit?: string;
  /** The available binUnits */
  binUnitOptions?: string[];
  /** Function to invoke when bin width changes. */
  onBinWidthChange?: (newBinWidth: NumberOrTimeDelta) => void;
  /** the allowed range of binWidths. Optional */
  binWidthRange?: NumberOrTimeDeltaRange;
  /** The step to take when adjusting binWidth. Optional. Downstream defaults to 1. */
  binWidthStep?: number;
  /** Is the widget disabled (grayed out and inoperable)?  Default is false */
  disabled?: boolean;
}

export default function BinWidthControl({
  label = 'Bin width',
  valueType,
  binWidth,
  binUnit,
  binUnitOptions,
  onBinWidthChange,
  binWidthRange,
  binWidthStep,
  containerStyles,
  disabled = false,
}: BinWidthControlProps) {
  const unit =
    valueType != null && valueType === 'date'
      ? (binWidth as TimeDelta).unit
      : undefined;

  return onBinWidthChange ? (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        ...containerStyles,
      }}
    >
      <Typography
        variant="button"
        style={{
          color: disabled ? MEDIUM_GRAY : DARKEST_GRAY,
          fontWeight: 400,
          paddingRight: 15,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Typography>
      {binUnitOptions && (
        <Select
          style={{ marginRight: '1em' }}
          value={binUnit}
          onChange={(event) => {
            const value =
              valueType != null && valueType === 'date'
                ? (binWidth as TimeDelta).value
                : binWidth;
            const unit = String(event.target.value);

            onBinWidthChange({ value, unit } as TimeDelta);
          }}
          disabled={disabled}
        >
          {binUnitOptions.map((option) => (
            <MenuItem value={option}>{option}</MenuItem>
          ))}
        </Select>
      )}
      <SliderWidget
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
        showLimits={true}
        disabled={disabled}
      />
    </div>
  ) : null;
}
