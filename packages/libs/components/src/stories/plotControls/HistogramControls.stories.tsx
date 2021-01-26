import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import HistogramControls from '../../components/plotControls/HistogramControls';
import usePlotControls, {
  usePlotControlsParams,
} from '../../hooks/usePlotControls';
import { HistogramData } from '../../types/plots';
import { LIGHT_PURPLE } from '../../constants/colors';

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

  return <HistogramControls {...controls} {...controls.histogram} />;
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

export const AdditionalOptions: Story<usePlotControlsParams<HistogramData>> = (
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
      accentColor={LIGHT_PURPLE}
      {...controls}
      {...controls.histogram}
    />
  );
};

AdditionalOptions.args = {
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
