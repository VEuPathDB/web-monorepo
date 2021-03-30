import React, { useEffect } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import HistogramControls from '../../components/plotControls/HistogramControls';
import usePlotControls, {
  usePlotControlsParams,
} from '../../hooks/usePlotControls';
import { HistogramData } from '../../types/plots';
import { LIGHT_PURPLE } from '../../constants/colors';
import { NumberOrTimeDelta, TimeDelta } from '../../types/general';

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
    console.log(`Story got new binWidth ${controls.data.binWidth}`);
  }, [controls.data.binWidth]);

  return (
    <HistogramControls
      label="Customizable Control Panel Label"
      accentColor={LIGHT_PURPLE}
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
    binWidth: args.binWidth ?? ([6, args.selectedUnit ?? 'hours'] as TimeDelta),
    binWidthRange: { min: 1, max: 24, unit: args.selectedUnit ?? 'hours' },
    binWidthStep: [1, args.selectedUnit ?? 'hours'] as TimeDelta,
  };
};

AdditionalOptions.args = {
  data: dummyData({ binWidth: [6, 'hours'], selectedUnit: 'hours' }),
  onSelectedUnitChange: async (newUnit: string) => {
    return dummyData({ selectedUnit: newUnit });
  },
  histogram: {
    valueType: 'date',
    binWidthRange: { min: 1, max: 24, unit: 'hours' },
    binWidthStep: [1, 'hours'],
    onBinWidthChange: async (args: {
      binWidth: NumberOrTimeDelta;
      selectedUnit?: string;
    }) => {
      return dummyData({
        binWidth: args.binWidth,
        selectedUnit: args.selectedUnit,
      });
    },
  },
};

export const YAxisControls: Story<usePlotControlsParams<HistogramData>> = (
  args
) => {
  const controls = usePlotControls<HistogramData>({
    data: {
      series: [
        {
          name: 'dummy data',
          bins: [
            {
              binStart: -1.6,
              binEnd: 1.6,
              binLabel: '[-1.6,1.6]',
              count: 7642,
            },
            {
              binStart: 1.6,
              binEnd: 4.8,
              binLabel: '(1.6,4.8]',
              count: 10045,
            },
            {
              binStart: 4.8,
              binEnd: 8,
              binLabel: '(4.8,8]',
              count: 2514,
            },
            {
              binStart: 8,
              binEnd: 11.2,
              binLabel: '(8,11.2]',
              count: 945,
            },
            {
              binStart: 11.2,
              binEnd: 14.4,
              binLabel: '(11.2,14.4]',
              count: 515,
            },
          ],
        },
      ],
    },
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
  histogram: {
    binWidthRange: { min: 5, max: 100 },
    binWidthStep: 5,
    onBinWidthChange: async () => {
      return { series: [{ name: 'dummy data', bins: [] }] };
    },
    // add y-axis controls at histogram for now
    yLogScale: false,
    yAbsoluteRelative: 'absolute',
  },
};
