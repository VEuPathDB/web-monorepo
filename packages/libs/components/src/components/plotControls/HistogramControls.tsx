import React, { useMemo } from 'react';
import useDimensions from 'react-cool-dimensions';

// Definitions
import { LIGHT_BLUE, LIGHT_GRAY } from '../../constants/colors';
import {
  ErrorManagement,
  NumberOrDateRange,
  NumberOrTimeDelta,
  NumberOrTimeDeltaRange,
  NumberRange,
  DateRange,
  TimeDelta,
} from '../../types/general';
import { OrientationOptions } from '../../types/plots';
import ControlsHeader from '../typography/ControlsHeader';

// Local Components
import Button from '../widgets/Button';
import ButtonGroup from '../widgets/ButtonGroup';
import Notification from '../widgets/Notification';
import OpacitySlider from '../widgets/OpacitySlider';
import OrientationToggle from '../widgets/OrientationToggle';
import SliderWidget from '../widgets/Slider';
import Switch from '../widgets/Switch';
import {
  NumberRangeInput,
  DateRangeInput,
} from '../widgets/NumberAndDateRangeInputs';
import LabelledGroup from '../widgets/LabelledGroup';

/**
 * Props for histogram controls.
 *
 * The presence or absence of an optional callback will
 * determine if that control is displayed.
 */
export type HistogramControlsProps = {
  /** Label for control panel. Optional. */
  label?: string;
  /** Currently selected bar layout. */
  barLayout: string;
  /** Function to invoke when barlayout changes. */
  onBarLayoutChange?: (layout: 'overlay' | 'stack') => void;
  /** Whether or not to display the plot legend. */
  displayLegend: boolean;
  /** Action to take on display legend change. */
  toggleDisplayLegend?: (displayLegend: boolean) => void;
  /** Whether or not to display the additionally controls that
   * may be provided by the charting library used to generate the plot.
   * For example, Plot.ly controls.*/
  displayLibraryControls: boolean;
  /** Action to take on display library controls change. */
  toggleLibraryControls?: (displayLegend: boolean) => void;
  /** Current histogram opacity. */
  opacity: number;
  /** Function to invoke when opacity changes. */
  onOpacityChange?: (opacity: number) => void;
  /** The current orientation of the plot.  */
  orientation: OrientationOptions;
  /** Function to invoke when orientation changes. */
  toggleOrientation?: (orientation: string) => void;
  /** Type of x-variable 'number' or 'date' */
  valueType?: 'number' | 'date';
  /** Available unit options by which to bin data. */
  availableUnits?: Array<string>;
  /** The currently selected binWidth unit. */
  selectedUnit?: string;
  /** Function to invoke when the selected bin unit changes. */
  onSelectedUnitChange?: (unit: string) => void;
  /** The current binWidth */
  binWidth?: NumberOrTimeDelta;
  /** Function to invoke when bin width changes. */
  onBinWidthChange?: (params: {
    binWidth: NumberOrTimeDelta;
    selectedUnit?: string;
  }) => void;
  /** The acceptable range of binWidthValues. */
  binWidthRange?: NumberOrTimeDeltaRange;
  /** The step to take when adjusting binWidth */
  binWidthStep?: number;
  /** A range to highlight by means of opacity. Optional */
  selectedRange?: NumberOrDateRange; // TO DO: handle DateRange too
  /** function to call upon selecting a range (in independent axis). Optional */
  onSelectedRangeChange?: (newRange?: NumberOrDateRange) => void;
  /** Min and max allowed values for the selected range. Optional */
  selectedRangeBounds?: NumberOrDateRange; // TO DO: handle DateRange too
  /** Additional styles for controls container. Optional */
  containerStyles?: React.CSSProperties;
  /** Color to use as an accent in the control panel. Will accept any
   * valid CSS color definition. Defaults to LIGHT_BLUE */
  accentColor?: string;
  /** Attributes and methdods for error management. */
  errorManagement: ErrorManagement;
  // add y-axis controls
  /** Whether or not to show y-axis log scale. */
  dependentAxisLogScale?: boolean;
  /** Action to take on y-axis log scale change. */
  toggleDependentAxisLogScale?: (dependentAxisLogScale: boolean) => void;
  /** Whether or not to set y-axis min/max range. */
  dependentAxisRange?: NumberRange;
  /** Action to take on y-axis min/max range change. */
  onDependentAxisRangeChange?: (newRange?: NumberRange) => void;
  /** Whether or not to display y-axis absolute Relative. */
  dependentAxisMode?: 'absolute' | 'relative';
  /** Action to take on display legend change. */
  onDependentAxisModeChange?: (newMode: 'absolute' | 'relative') => void;
  /** Action to reset dependent axis range. */
  onDependentAxisSettingsReset?: () => void;
  /** Whether or not to set x-axis min/max range. */
  independentAxisRange?: NumberOrDateRange;
  /** Action to take on x-axis min/max range change. */
  onIndependentAxisRangeChange?: (newRange?: NumberOrDateRange) => void;
  /** Action to reset independent axis range. */
  onIndependentAxisSettingsReset?: () => void;
  /** Action to Reset all to defaults. */
  onResetAll?: () => void;
};

/**
 * A histogram controls panel.
 *
 * If you prefer a different layout or composition, you can
 * contruct you own control panel by using the various
 * widgets contained here.
 */
export default function HistogramControls({
  label,
  binWidth,
  binWidthStep,
  binWidthRange,
  onBinWidthChange,
  displayLegend,
  toggleDisplayLegend,
  displayLibraryControls,
  toggleLibraryControls,
  barLayout,
  onBarLayoutChange,
  opacity,
  onOpacityChange,
  orientation,
  toggleOrientation,
  valueType,
  availableUnits,
  selectedUnit,
  onSelectedUnitChange,
  selectedRange,
  onSelectedRangeChange,
  selectedRangeBounds,
  // add y-axis controls
  dependentAxisLogScale,
  toggleDependentAxisLogScale,
  dependentAxisRange,
  onDependentAxisRangeChange,
  dependentAxisMode,
  onDependentAxisModeChange,
  onDependentAxisSettingsReset,
  // add x-axis/independent axis controls: axis range and range reset
  independentAxisRange,
  onIndependentAxisRangeChange,
  onIndependentAxisSettingsReset,
  // add reset all
  onResetAll,
  containerStyles = {},
  accentColor = LIGHT_BLUE,
  errorManagement,
}: HistogramControlsProps) {
  const { ref, width } = useDimensions<HTMLDivElement>();

  const errorStacks = useMemo(() => {
    return errorManagement.errors.reduce<
      Array<{ error: Error; occurences: number }>
    >((accumulatedValue, currentValue) => {
      const existingErrorStack = accumulatedValue.find(
        (stack) => stack.error.message === currentValue.message
      );

      if (existingErrorStack) {
        existingErrorStack.occurences++;
        return [...accumulatedValue];
      } else {
        return [...accumulatedValue, { error: currentValue, occurences: 1 }];
      }
    }, []);
  }, [errorManagement.errors]);

  return (
    <div
      ref={ref}
      style={{
        borderStyle: 'solid',
        borderWidth: '0em',
        borderColor: '#cccccc',
        borderRadius: '0.6125em',
        padding: '0.9375em',
        minWidth: '11em',
        ...containerStyles,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(max-content, 100px))',
          marginRight: '2.1875em',
          columnGap: '1.5625em',
          rowGap: '0.9375em',
        }}
      >
        {toggleOrientation && (
          <OrientationToggle
            orientation={orientation}
            onOrientationChange={toggleOrientation}
          />
        )}
        {onBarLayoutChange && (
          <ButtonGroup
            label="Bar Layout"
            options={['overlay', 'stack']}
            selectedOption={barLayout}
            // @ts-ignore
            onOptionSelected={onBarLayoutChange}
            containerStyles={{ paddingRight: '1.5625em' }}
          />
        )}
        {onSelectedRangeChange ? (
          <LabelledGroup label="Subset by value">
            {valueType !== undefined && valueType === 'date' ? (
              <DateRangeInput
                rangeBounds={selectedRangeBounds as DateRange}
                range={selectedRange as DateRange}
                onRangeChange={onSelectedRangeChange}
                allowPartialRange={false}
                showClearButton={true}
              />
            ) : (
              <NumberRangeInput
                rangeBounds={selectedRangeBounds as NumberRange}
                range={selectedRange as NumberRange}
                onRangeChange={onSelectedRangeChange}
                allowPartialRange={false}
                showClearButton={true}
              />
            )}
          </LabelledGroup>
        ) : null}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            width > 500 ? '2fr 2fr 1fr' : width > 300 ? '1fr 1fr' : '1fr',
          // marginTop: '0.9375em',
          // marginRight: '0.9375em',
          columnGap: '1.5625em',
          rowGap: '0.3125em',
        }}
      >
        {onOpacityChange && (
          <OpacitySlider
            value={opacity}
            onValueChange={onOpacityChange}
            color={accentColor}
          />
        )}
      </div>
      <div
        style={{ display: 'flex', flexWrap: 'wrap', paddingTop: '0.3125em' }}
      >
        {toggleDisplayLegend && (
          <Switch
            label="Legend"
            color={accentColor}
            state={displayLegend}
            // The stinky use of `any` here comes from
            // an incomplete type definition in the
            // material UI library.
            onStateChange={(event: any) =>
              toggleDisplayLegend(event.target.checked)
            }
            containerStyles={{ paddingRight: '1.5625em' }}
          />
        )}
        {toggleLibraryControls && (
          <Switch
            label="Plot.ly Controls"
            color={accentColor}
            state={displayLibraryControls}
            onStateChange={(event: any) =>
              toggleLibraryControls(event.target.checked)
            }
            // add paddingRight
            containerStyles={{ paddingRight: '1.5625em' }}
          />
        )}
      </div>

      <LabelledGroup label="Y-axis" containerStyles={{}}>
        {toggleDependentAxisLogScale && dependentAxisLogScale !== undefined && (
          <Switch
            label="Log Scale:"
            color={accentColor}
            state={dependentAxisLogScale}
            // The stinky use of `any` here comes from
            // an incomplete type definition in the
            // material UI library.
            onStateChange={(event: any) =>
              toggleDependentAxisLogScale(event.target.checked)
            }
            containerStyles={{ paddingBottom: '0.3125em' }}
          />
        )}
        {onDependentAxisRangeChange && (
          <NumberRangeInput
            label="Range:"
            range={dependentAxisRange}
            onRangeChange={(newRange?: NumberOrDateRange) => {
              onDependentAxisRangeChange(newRange as NumberRange);
            }}
            allowPartialRange={false}
          />
        )}
        {dependentAxisMode && onDependentAxisModeChange && (
          <ButtonGroup
            label="Absolute/Relative:"
            options={['absolute', 'relative']}
            selectedOption={dependentAxisMode}
            // @ts-ignore
            onOptionSelected={onDependentAxisModeChange}
          />
        )}

        {onDependentAxisSettingsReset && (
          <Button
            type={'solid'}
            text={'Reset to defaults'}
            onClick={onDependentAxisSettingsReset}
            containerStyles={{
              paddingTop: '1.0em',
              width: '100%',
            }}
          />
        )}
      </LabelledGroup>

      <LabelledGroup label="X-axis" containerStyles={{}}>
        {availableUnits?.length && selectedUnit && onSelectedUnitChange && (
          <ButtonGroup
            label="Data Units"
            options={availableUnits}
            selectedOption={selectedUnit}
            onOptionSelected={onSelectedUnitChange}
            containerStyles={{ paddingBottom: '0.9375em' }}
          />
        )}

        {onBinWidthChange && (
          <SliderWidget
            label={`Bin Width${
              valueType !== undefined && valueType === 'date'
                ? ' (' + (binWidth as TimeDelta).unit + ')'
                : ''
            }`}
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
              onBinWidthChange({
                binWidth:
                  valueType !== undefined && valueType === 'date'
                    ? ({ value: newValue, unit: selectedUnit } as TimeDelta)
                    : newValue,
                selectedUnit,
              });
            }}
          />
        )}

        {onIndependentAxisRangeChange &&
          (valueType !== undefined && valueType === 'date' ? (
            <DateRangeInput
              label="Range:"
              range={independentAxisRange as DateRange}
              onRangeChange={onIndependentAxisRangeChange}
              allowPartialRange={false}
            />
          ) : (
            <NumberRangeInput
              label="Range:"
              range={independentAxisRange as NumberRange}
              onRangeChange={onIndependentAxisRangeChange}
              allowPartialRange={false}
            />
          ))}

        {onIndependentAxisSettingsReset && (
          <Button
            type={'solid'}
            text={'Reset to defaults'}
            onClick={onIndependentAxisSettingsReset}
            containerStyles={{
              paddingTop: '1.0em',
              width: '100%',
            }}
          />
        )}
      </LabelledGroup>

      {/* reset all */}
      {onResetAll && (
        <Button
          type={'solid'}
          text={'Reset All'}
          onClick={onResetAll}
          containerStyles={{
            paddingTop: '1.5625em',
            width: '8.125em',
          }}
        />
      )}

      {errorStacks.map(({ error, occurences }, index) => (
        <Notification
          title="Error"
          key={index}
          text={error.message}
          color={accentColor}
          occurences={occurences}
          containerStyles={{ marginTop: '0.625em' }}
          onAcknowledgement={() => errorManagement.removeError(error)}
        />
      ))}

      {label && (
        <ControlsHeader
          text={label}
          styleOverrides={{ paddingTop: '1.5625em', textAlign: 'right' }}
        />
      )}
    </div>
  );
}
