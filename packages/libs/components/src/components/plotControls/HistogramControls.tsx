import React from 'react';

// Definitions
import { LIGHT_GRAY } from '../../constants/colors';
import { OrientationOptions } from '../../types/plots';
import ControlsHeader from '../typography/ControlsHeader';

// Local Components
import ButtonGroup from '../widgets/ButtonGroup';
import OpacitySlider from '../widgets/OpacitySlider';
import OrientationToggle from '../widgets/OrientationToggle';
import SliderWidget from '../widgets/Slider';

export type HistogramControlsProps = {
  /** Label for control panel. Optional. */
  label?: string;
  /** Currently selected bar layout. */
  barLayout: string;
  /** Function to invoke when barlayout changes. */
  onBarLayoutChange: (layout: 'overlay' | 'stack') => void;
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
}: HistogramControlsProps) {
  console.log(availableUnits, selectedUnit, onSelectedUnitChange);

  return (
    <div
      style={{
        borderStyle: 'solid',
        borderWidth: 2,
        borderColor: LIGHT_GRAY,
        borderRadius: '10px',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        ...containerStyles,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        <OrientationToggle
          orientation={orientation}
          onOrientationChange={onOrientationChange}
          containerStyles={{ paddingBottom: 10, paddingRight: 25 }}
        />
        <ButtonGroup
          label='Bar Layout'
          options={['overlay', 'stack']}
          selectedOption={barLayout}
          // @ts-ignore
          onOptionSelected={onBarLayoutChange}
          containerStyles={{ paddingBottom: 10, paddingRight: 25 }}
        />
        {availableUnits?.length && selectedUnit && onSelectedUnitChange && (
          <ButtonGroup
            label='Data Units'
            options={availableUnits}
            selectedOption={selectedUnit}
            onOptionSelected={onSelectedUnitChange}
            containerStyles={{ paddingBottom: 10, paddingRight: 25 }}
          />
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        <OpacitySlider
          value={opacity}
          onValueChange={onOpacityChange}
          containerStyles={{ width: 100, paddingBottom: 10, paddingRight: 40 }}
        />
        <SliderWidget
          label='Bin Width'
          minimum={binWidthRange[0]}
          maximum={binWidthRange[1]}
          step={binWidthStep}
          value={binWidth}
          onChange={onBinWidthChange}
          containerStyles={{ width: 100 }}
        />
      </div>
      {label && (
        <ControlsHeader
          text={label}
          styleOverrides={{ paddingTop: 10, textAlign: 'right' }}
        />
      )}
    </div>
  );
}
