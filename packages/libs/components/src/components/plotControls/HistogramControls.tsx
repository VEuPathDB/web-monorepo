import React from 'react';
import useDimensions from 'react-cool-dimensions';

// Definitions
import { LIGHT_BLUE, LIGHT_GRAY } from '../../constants/colors';
import { OrientationOptions } from '../../types/plots';
import ControlsHeader from '../typography/ControlsHeader';

// Local Components
import ButtonGroup from '../widgets/ButtonGroup';
import OpacitySlider from '../widgets/OpacitySlider';
import OrientationToggle from '../widgets/OrientationToggle';
import SliderWidget from '../widgets/Slider';
import Switch from '../widgets/Switch';

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
  onDisplayLegendChange: (displayLegend: boolean) => void;
  /** Current histogram opacity. */
  opacity: number;
  /** Function to invoke when opacity changes. */
  onOpacityChange: (opacity: number) => void;
  /** The current orientation of the plot.  */
  orientation: OrientationOptions;
  /** Function to invoke when orientation changes. */
  onOrientationChange: (orientation: string) => void;
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
  /** Additional styles for controls container. Optional */
  containerStyles?: React.CSSProperties;
  /** Color to use as an accent in the control panel. Will accept any
   * valid CSS color definition. Defaults to LIGHT_BLUE */
  accentColor?: string;
};

/**
 * A histogram controls panel.
 * If you prefer a different layout, you can easily
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
  onDisplayLegendChange,
  barLayout,
  onBarLayoutChange,
  opacity,
  onOpacityChange,
  orientation,
  onOrientationChange,
  availableUnits,
  selectedUnit,
  onSelectedUnitChange,
  containerStyles = {},
  accentColor = LIGHT_BLUE,
}: HistogramControlsProps) {
  const { ref, width } = useDimensions<HTMLDivElement>();

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
          onOrientationChange={onOrientationChange}
        />
        <ButtonGroup
          label='Bar Layout'
          options={['overlay', 'stack']}
          selectedOption={barLayout}
          // @ts-ignore
          onOptionSelected={onBarLayoutChange}
        />
        {availableUnits?.length && selectedUnit && onSelectedUnitChange && (
          <ButtonGroup
            label='Data Units'
            options={availableUnits}
            selectedOption={selectedUnit}
            onOptionSelected={onSelectedUnitChange}
          />
        )}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            width > 500 ? '2fr 2fr 1fr' : width > 300 ? '1fr 1fr' : '1fr',
          marginTop: 15,
          marginRight: 10,
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
          label='Bin Width'
          minimum={binWidthRange[0]}
          maximum={binWidthRange[1]}
          step={binWidthStep}
          value={binWidth}
          onChange={onBinWidthChange}
        />
        <Switch
          color={accentColor}
          state={displayLegend}
          // The stinky use of `any` here comes from
          // an incomplete type definition in the
          // material UI library.
          onStateChange={(event: any) =>
            onDisplayLegendChange(event.target.checked)
          }
        />
      </div>

      {label && (
        <ControlsHeader
          text={label}
          styleOverrides={{ paddingTop: 25, textAlign: 'right' }}
        />
      )}
    </div>
  );
}
