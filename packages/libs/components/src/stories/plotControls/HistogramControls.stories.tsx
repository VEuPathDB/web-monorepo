import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import HistogramControls from '../../components/plotControls/HistogramControls';
import usePlotControls, {
  usePlotControlsParams,
} from '../../hooks/usePlotControls';
import { HistogramData } from '../../types/plots';

export default {
  title: 'Plot Controls/Histogram',
  component: HistogramControls,
} as Meta;

export const RequiredControls: Story<usePlotControlsParams<HistogramData>> = (
  args
) => {
  const controls = usePlotControls<HistogramData>({
    data: [{ name: 'dummy data', bins: [] }],
    availableUnits: args.availableUnits,
    initialSelectedUnit: args.initialSelectedUnit,
    histogram: args.histogram,
  });

  return (
    <HistogramControls
      barLayout={controls.barLayout}
      onBarLayoutChange={controls.setBarLayout}
      binWidth={controls.histogram.binWidth}
      binWidthRange={controls.histogram.binWidthRange}
      binWidthStep={controls.histogram.binWidthStep}
      onBinWidthChange={controls.histogram.setBinWidth}
      opacity={controls.opacity}
      onOpacityChange={controls.setOpacity}
      orientation={controls.orientation}
      onOrientationChange={controls.toggleOrientation}
    />
  );
};

RequiredControls.args = {
  histogram: {
    initialBinWidth: 5,
    binWidthRange: [5, 100],
    binWidthStep: 5,
    onBinWidthChange: async (width) => {
      return [];
    },
  },
};

export const OptionalControls: Story<usePlotControlsParams<HistogramData>> = (
  args
) => {
  const controls = usePlotControls<HistogramData>({
    data: [{ name: 'dummy data', bins: [] }],
    availableUnits: args.availableUnits,
    initialSelectedUnit: args.initialSelectedUnit,
    histogram: args.histogram,
  });

  return (
    <HistogramControls
      label='Customizable Control Panel Label'
      availableUnits={controls.availableUnits}
      selectedUnit={controls.selectedUnit}
      onSelectedUnitChange={controls.setSelectedUnit}
      barLayout={controls.barLayout}
      onBarLayoutChange={controls.setBarLayout}
      binWidth={controls.histogram.binWidth}
      binWidthRange={controls.histogram.binWidthRange}
      binWidthStep={controls.histogram.binWidthStep}
      onBinWidthChange={controls.histogram.setBinWidth}
      opacity={controls.opacity}
      onOpacityChange={controls.setOpacity}
      orientation={controls.orientation}
      onOrientationChange={controls.toggleOrientation}
    />
  );
};

OptionalControls.args = {
  availableUnits: ['Celsius', 'Fahrenheit'],
  initialSelectedUnit: 'Celsius',
  onSelectedUnitChange: async () => [],
  histogram: {
    initialBinWidth: 5,
    binWidthRange: [5, 100],
    binWidthStep: 5,
    onBinWidthChange: async (width) => {
      return [];
    },
  },
};
