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
  /** The currently selected bin unit. */
  selectedUnit?: string;
  /** Function to invoke when the selected bin unit changes. */
  onSelectedUnitChange?: (unit: string) => void;
  /** The current binWidth */
  binWidth: NumberOrTimeDelta;
  /** Function to invoke when bin width changes. */
  onBinWidthChange?: (params: {
    binWidth: NumberOrTimeDelta;
    selectedUnit?: string;
  }) => void;
  /** The acceptable range of binWidthValues. */
  binWidthRange: NumberOrTimeDeltaRange;
  /** The step to take when adjusting binWidth */
  binWidthStep: NumberOrTimeDelta;
  /** A range to highlight by means of opacity. Optional */
  selectedRange?: NumberOrDateRange; // TO DO: handle DateRange too
  /** function to call upon selecting a range (in independent axis). Optional */
  onSelectedRangeChange?: (newRange: NumberOrDateRange) => void;
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
  dependentAxisRange?: NumberOrDateRange;
  /** Action to take on y-axis min/max range change. */
  onDependentAxisRangeChange?: (newRange: NumberOrDateRange) => void;
  /** Whether or not to display y-axis absolute Relative. */
  dependentAxisMode?: string;
  /** Action to take on display legend change. */
  onDependentAxisModeChange?: (layout: 'absolute' | 'relative') => void;
  /** Action to reset dependent axis range. */
  onDependentAxisRangeReset?: () => void;
  /** Whether or not to set x-axis min/max range. */
  independentAxisRange?: NumberOrDateRange;
  /** Action to take on x-axis min/max range change. */
  onIndependentAxisRangeChange?: (newRange: NumberOrDateRange) => void;
  /** Action to reset independent axis range. */
  onIndependentAxisRangeReset?: () => void;
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
  onDependentAxisRangeReset,
  // add x-axis/independent axis controls: axis range and range reset
  independentAxisRange,
  onIndependentAxisRangeChange,
  onIndependentAxisRangeReset,
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
        borderWidth: 2,
        borderColor: LIGHT_GRAY,
        borderRadius: '10px',
        padding: '15px',
        minWidth: '175px',
        ...containerStyles,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(max-content, 100px))',
          marginRight: 35,
          columnGap: 25,
          rowGap: 15,
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
            containerStyles={{ paddingRight: 25 }}
          />
        )}
        {/* commend this out as it moves to x-axis control group */}
        {/* {availableUnits?.length && selectedUnit && onSelectedUnitChange ? (
          <ButtonGroup
            label="Data Units"
            options={availableUnits}
            selectedOption={selectedUnit}
            onOptionSelected={onSelectedUnitChange}
          />
        ) : null} */}
        {onSelectedRangeChange ? (
          valueType !== undefined && valueType === 'date' ? (
            <DateRangeInput
              label="Selected Range"
              rangeBounds={selectedRangeBounds as DateRange}
              range={selectedRange as DateRange}
              onRangeChange={onSelectedRangeChange}
            />
          ) : (
            <NumberRangeInput
              label="Selected Range"
              rangeBounds={selectedRangeBounds as NumberRange}
              range={selectedRange as NumberRange}
              onRangeChange={onSelectedRangeChange}
            />
          )
        ) : null}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            width > 500 ? '2fr 2fr 1fr' : width > 300 ? '1fr 1fr' : '1fr',
          marginTop: 15,
          marginRight: 15,
          columnGap: 25,
          rowGap: 5,
        }}
      >
        {onOpacityChange && (
          <OpacitySlider
            value={opacity}
            onValueChange={onOpacityChange}
            color={accentColor}
          />
        )}
        {/* commend this out as it moves to x-axis control group */}
        {/* {onBinWidthChange && (
          <SliderWidget
            label={`Bin Width${
              valueType !== undefined && valueType === 'date'
                ? ' (' + (binWidth as TimeDelta)[1] + ')'
                : ''
            }`}
            minimum={binWidthRange.min}
            maximum={binWidthRange.max}
            step={
              valueType !== undefined && valueType === 'date'
                ? (binWidth as TimeDelta)[0]
                : (binWidthStep as number)
            }
            value={typeof binWidth === 'number' ? binWidth : binWidth[0]}
            onChange={(newValue: number) => {
              onBinWidthChange({
                binWidth:
                  valueType !== undefined && valueType === 'date'
                    ? ([newValue, selectedUnit] as TimeDelta)
                    : newValue,
                selectedUnit,
              });
            }}
          />
        )} */}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', paddingTop: 5 }}>
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
            containerStyles={{ paddingRight: 25 }}
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
            containerStyles={{ paddingRight: 25 }}
          />
        )}
      </div>
      {/* y-axis controls with box */}
      <div
        style={{
          display: 'inline-flex',
          borderStyle: 'solid',
          borderWidth: 2,
          borderColor: 'rgb(240, 240, 240)',
          borderRadius: 0,
          padding: '1em',
          // width: 400,
          minWidth: 175,
          marginTop: 25,
          marginRight: 25,
        }}
      >
        {/* wrapper div to prevent from inline-flex */}
        <div>
          <div
            style={{
              width: 50,
              marginTop: '-1.8em',
              marginLeft: '-.3em',
              marginBottom: '.3em',
              background: 'white',
              textAlign: 'center',
            }}
          >
            y-Axis
          </div>

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
              containerStyles={{ paddingBottom: 5 }}
            />
          )}
          {onDependentAxisRangeChange ? (
            valueType !== undefined && valueType === 'date' ? (
              <DateRangeInput
                label="Range:"
                // rangeBounds={selectedRangeBounds as DateRange}
                range={dependentAxisRange as DateRange}
                onRangeChange={onDependentAxisRangeChange}
              />
            ) : (
              <NumberRangeInput
                label="Range:"
                // rangeBounds={selectedRangeBounds as NumberRange}
                range={dependentAxisRange as NumberRange}
                onRangeChange={onDependentAxisRangeChange}
              />
            )
          ) : null}
          {dependentAxisMode && onDependentAxisModeChange && (
            <ButtonGroup
              label="Absolute/Relative:"
              options={['absolute', 'relative']}
              selectedOption={dependentAxisMode}
              // @ts-ignore
              onOptionSelected={onDependentAxisModeChange}
            />
          )}
          {/* add dependent axis range reset button */}
          <div style={{ paddingTop: 25, width: 170 }}>
            {onDependentAxisRangeReset && (
              <Button
                type={'solid'}
                text={'Reset to defaults'}
                onClick={onDependentAxisRangeReset}
              />
            )}
          </div>
        </div>
      </div>

      {/* x-axis controls with box */}
      <div
        style={{
          display: 'inline-flex',
          borderStyle: 'solid',
          borderWidth: 2,
          borderColor: 'rgb(240, 240, 240)',
          borderRadius: 0,
          padding: '1em',
          // width: 400,
          minWidth: 175,
          marginTop: 25,
          marginRight: 25,
        }}
      >
        {/* wrapper div to prevent from inline-flex */}
        <div>
          <div
            style={{
              width: 50,
              marginTop: '-1.8em',
              marginLeft: '-.3em',
              marginBottom: '.3em',
              background: 'white',
              textAlign: 'center',
            }}
          >
            x-Axis
          </div>

          {availableUnits?.length && selectedUnit && onSelectedUnitChange ? (
            <ButtonGroup
              label="Data Units"
              options={availableUnits}
              selectedOption={selectedUnit}
              onOptionSelected={onSelectedUnitChange}
              containerStyles={{ paddingBottom: 15 }}
            />
          ) : null}

          {onBinWidthChange && (
            <SliderWidget
              label={`Bin Width${
                valueType !== undefined && valueType === 'date'
                  ? ' (' + (binWidth as TimeDelta)[1] + ')'
                  : ''
              }`}
              minimum={binWidthRange.min}
              maximum={binWidthRange.max}
              step={
                valueType !== undefined && valueType === 'date'
                  ? (binWidth as TimeDelta)[0]
                  : (binWidthStep as number)
              }
              value={typeof binWidth === 'number' ? binWidth : binWidth[0]}
              onChange={(newValue: number) => {
                onBinWidthChange({
                  binWidth:
                    valueType !== undefined && valueType === 'date'
                      ? ([newValue, selectedUnit] as TimeDelta)
                      : newValue,
                  selectedUnit,
                });
              }}
              containerStyles={{ paddingBottom: 5 }}
            />
          )}

          {onIndependentAxisRangeChange ? (
            valueType !== undefined && valueType === 'date' ? (
              <DateRangeInput
                label="Range:"
                // rangeBounds={selectedRangeBounds as DateRange}
                range={independentAxisRange as DateRange}
                onRangeChange={onIndependentAxisRangeChange}
              />
            ) : (
              <NumberRangeInput
                label="Range:"
                // rangeBounds={selectedRangeBounds as NumberRange}
                range={independentAxisRange as NumberRange}
                onRangeChange={onIndependentAxisRangeChange}
              />
            )
          ) : null}

          {/* add dependent axis range reset button */}
          <div style={{ paddingTop: 10, width: 170 }}>
            {onIndependentAxisRangeReset && (
              <Button
                type={'solid'}
                text={'Reset to defaults'}
                onClick={onIndependentAxisRangeReset}
              />
            )}
          </div>
        </div>
      </div>

      {/* reset all */}
      <div style={{ paddingTop: 25, width: 130 }}>
        {onResetAll && (
          <Button type={'solid'} text={'Reset All'} onClick={onResetAll} />
        )}
      </div>

      {errorStacks.map(({ error, occurences }, index) => (
        <Notification
          title="Error"
          key={index}
          text={error.message}
          color={accentColor}
          occurences={occurences}
          containerStyles={{ marginTop: 10 }}
          onAcknowledgement={() => errorManagement.removeError(error)}
        />
      ))}

      {label && (
        <ControlsHeader
          text={label}
          styleOverrides={{ paddingTop: 25, textAlign: 'right' }}
        />
      )}
    </div>
  );
}
