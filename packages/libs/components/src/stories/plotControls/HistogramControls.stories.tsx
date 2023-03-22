import React, { useEffect } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import HistogramControls from '../../components/plotControls/HistogramControls';
import usePlotControls, {
  usePlotControlsParams,
} from '../../hooks/usePlotControls';
import { HistogramData } from '../../types/plots';
import { LIGHT_PURPLE } from '../../constants/colors';
import { NumberOrTimeDelta, TimeDelta } from '../../types/general';
import { mutedPurple } from '@veupathdb/coreui/dist/definitions/colors';

export default {
  title: 'Plot Controls/Histogram',
  component: HistogramControls,
} as Meta;

export const RequiredControls: Story<usePlotControlsParams<HistogramData>> = (
  args
) => {
  const controls = usePlotControls<HistogramData>({
    data: { series: [{ name: 'dummy data', bins: [] }] },
    histogram: args.histogram,
  });

  return (
    <HistogramControls
      {...controls}
      {...controls.histogram}
      valueType="number"
    />
  );
};

RequiredControls.args = {
  histogram: {
    binWidthRange: { min: 5, max: 100 },
    binWidthStep: 5,
    onBinWidthChange: async () => {
      return { series: [{ name: 'dummy data', bins: [] }] };
    },
  },
};

export const AdditionalOptions: Story<usePlotControlsParams<HistogramData>> = (
  args
) => {
  const controls = usePlotControls<HistogramData>({
    data: args.data,
    onSelectedUnitChange: args.onSelectedUnitChange,
    histogram: args.histogram,
  });

  useEffect(() => {
    console.log(
      `Story got new binWidth ${controls.data.binWidthSlider?.binWidth}`
    );
  }, [controls.data.binWidthSlider?.binWidth]);

  return (
    <HistogramControls
      label="Customizable Control Panel Label"
      accentColor={{ hue: mutedPurple, level: 400 }}
      {...controls}
      {...controls.histogram}
    />
  );
};

const dummyData = (args: {
  binWidth?: NumberOrTimeDelta;
  selectedUnit?: string;
}) => {
  return {
    series: [{ name: 'dummy data', bins: [] }],
    availableUnits: ['day', 'hours'],
    selectedUnit: args.selectedUnit ?? 'hours',
    binWidth: args.binWidth ?? { value: 6, unit: args.selectedUnit ?? 'hours' },
    binWidthRange: { min: 1, max: 24, unit: args.selectedUnit ?? 'hours' },
    binWidthStep: 1,
  };
};

AdditionalOptions.args = {
  data: dummyData({
    binWidth: { value: 6, unit: 'hours' },
    selectedUnit: 'hours',
  }),
  onSelectedUnitChange: async (newUnit: string) => {
    return dummyData({ selectedUnit: newUnit });
  },
  histogram: {
    valueType: 'date',
    binWidthRange: { min: 1, max: 24, unit: 'hours' },
    binWidthStep: 1,
    onBinWidthChange: async (binWidth: NumberOrTimeDelta) => {
      return dummyData({
        binWidth: binWidth,
      });
    },
  },
};

export const YAxisControls: Story<usePlotControlsParams<HistogramData>> = (
  args
) => {
  const controls = usePlotControls<HistogramData>({
    data: args.data,
    histogram: args.histogram,
  });

  return (
    <HistogramControls
      // label="Customizable Control Panel Label"
      {...controls}
      {...controls.histogram}
      valueType="number"
    />
  );
};

YAxisControls.args = {
  data: { series: [{ name: 'dummy data', bins: [] }] },
  histogram: {
    binWidthRange: { min: 5, max: 100 },
    binWidthStep: 5,
    onBinWidthChange: async () => {
      return { series: [{ name: 'dummy data', bins: [] }] };
    },
    // add y-axis controls at histogram for now
    dependentAxisLogScale: false,
    dependentAxisMode: 'absolute',
  },
};
