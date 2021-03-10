import React, { useMemo } from 'react';
import useDimensions from 'react-cool-dimensions';

// Definitions
import { LIGHT_BLUE, LIGHT_GRAY } from '../../constants/colors';
import { ErrorManagement, NumberRange } from '../../types/general';
import { OrientationOptions } from '../../types/plots';
import ControlsHeader from '../typography/ControlsHeader';

// Local Components
import ButtonGroup from '../widgets/ButtonGroup';
import Notification from '../widgets/Notification';
import OpacitySlider from '../widgets/OpacitySlider';
import OrientationToggle from '../widgets/OrientationToggle';
import SliderWidget from '../widgets/Slider';
import Switch from '../widgets/Switch';
import NumberRangeInput from '../widgets/NumberRangeInput';

export type HistogramControlsProps = {
  /** Label for control panel. Optional. */
  label?: string;
  /** Currently selected bar layout. */
  barLayout: string;
  /** Function to invoke when barlayout changes. */
  onBarLayoutChange: (layout: 'overlay' | 'stack') => void;
  /** Whether or not to display the plot legend. */
  displayLegend: boolean;
  /** Action to take on display legend change. */
  toggleDisplayLegend: (displayLegend: boolean) => void;
  /** Whether or not to display the additionally controls that
   * may be provided by the charting library used to generate the plot.
   * For example, Plot.ly controls.*/
  displayLibraryControls: boolean;
  /** Action to take on display library controls change. */
  toggleLibraryControls: (displayLegend: boolean) => void;
  /** Current histogram opacity. */
  opacity: number;
  /** Function to invoke when opacity changes. */
  onOpacityChange: (opacity: number) => void;
  /** The current orientation of the plot.  */
  orientation: OrientationOptions;
  /** Function to invoke when orientation changes. */
  toggleOrientation: (orientation: string) => void;
  /** Available unit options by which to bin data. */
  availableUnits?: Array<string>;
  /** The currently selected bin unit. */
  selectedUnit?: string;
  /** Function to invoke when the selected bin unit changes. */
  onSelectedUnitChange?: (unit: string) => void;
  /** The current binWidth */
  binWidth: number;
  /** Function to invoke when bin width changes. */
  onBinWidthChange: (newWidth: number) => void;
  /** The acceptable range of binWidthValues. */
  binWidthRange: [number, number];
  /** The step to take when adjusting binWidth */
  binWidthStep: number;
  /** A range to highlight by means of opacity. Optional */
  selectedRange?: NumberRange; // TO DO: handle DateRange too
  /** function to call upon selecting a range (in independent axis). Optional */
  onSelectedRangeChange?: (newRange: NumberRange) => void;
  /** Min and max allowed values for the selected range. Optional */
  selectedRangeBounds?: NumberRange; // TO DO: handle DateRange too
  /** Show the range controls */
  displaySelectedRangeControls?: boolean;
  /** Additional styles for controls container. Optional */
  containerStyles?: React.CSSProperties;
  /** Color to use as an accent in the control panel. Will accept any
   * valid CSS color definition. Defaults to LIGHT_BLUE */
  accentColor?: string;
  /** Attributes and methdods for error management. */
  errorManagement: ErrorManagement;
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
  availableUnits,
  selectedUnit,
  onSelectedUnitChange,
  selectedRange,
  onSelectedRangeChange,
  selectedRangeBounds,
  displaySelectedRangeControls,
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
        <OrientationToggle
          orientation={orientation}
          onOrientationChange={toggleOrientation}
        />
        <ButtonGroup
          label="Bar Layout"
          options={['overlay', 'stack']}
          selectedOption={barLayout}
          // @ts-ignore
          onOptionSelected={onBarLayoutChange}
        />
        {availableUnits?.length && selectedUnit && onSelectedUnitChange ? (
          <ButtonGroup
            label="Data Units"
            options={availableUnits}
            selectedOption={selectedUnit}
            onOptionSelected={onSelectedUnitChange}
          />
        ) : null}
        {displaySelectedRangeControls && selectedRangeBounds ? (
          <NumberRangeInput
            label="Selected Range"
            defaultRange={selectedRangeBounds}
            rangeBounds={selectedRangeBounds}
            controlledRange={selectedRange}
            onRangeChange={onSelectedRangeChange}
          />
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
        <OpacitySlider
          value={opacity}
          onValueChange={onOpacityChange}
          color={accentColor}
        />
        <SliderWidget
          label="Bin Width"
          minimum={binWidthRange[0]}
          maximum={binWidthRange[1]}
          step={binWidthStep}
          value={binWidth}
          onChange={onBinWidthChange}
        />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', paddingTop: 5 }}>
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
        <Switch
          label="Plot.ly Controls"
          color={accentColor}
          state={displayLibraryControls}
          onStateChange={(event: any) =>
            toggleLibraryControls(event.target.checked)
          }
        />
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
