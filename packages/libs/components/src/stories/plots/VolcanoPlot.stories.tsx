import React, { useState } from 'react';
import VolcanoPlot, { VolcanoPlotProps } from '../../plots/VolcanoPlot';
import { Story, Meta } from '@storybook/react/types-6-0';
import { scaleLinear } from '@visx/scale';

export default {
  title: 'Plots/VolcanoPlot',
  component: VolcanoPlot,
} as Meta;

interface VEuPathDBVolcanoPlotData {
  volcanoplot: {
    data: Array<{
      foldChange: string[];
      pValue: string[];
      adjustedPValue: string[];
      pointId: string[];
      overlayValue: string;
    }>;
  };
}

// Let's make some fake data!
const dataSetVolcano: VEuPathDBVolcanoPlotData = {
  volcanoplot: {
    data: [
      {
        foldChange: ['2', '3'],
        pValue: ['0.001', '0.0001'],
        adjustedPValue: ['0.01', '0.001'],
        pointId: ['a', 'b'],
        overlayValue: 'positive',
      },
      {
        foldChange: ['0.5', '0.8', '1', '0.5', '0.1', '4', '0.2'],
        pValue: ['0.001', '0.0001', '0.2', '0.1', '0.7', '0.1', '0.4'],
        adjustedPValue: ['0.01', '0.001', '2', '1', '7', '1', '4'],
        pointId: ['c', 'd', 'e', 'f', 'g', 'h', 'i'],
        overlayValue: 'none',
      },
      {
        foldChange: ['0.01', '0.02', '0.03'],
        pValue: ['0.001', '0.0001', '0.002'],
        adjustedPValue: ['0.01', '0.001', '0.02'],
        pointId: ['j', 'k', 'l'],
        overlayValue: 'negative',
      },
    ],
  },
};

const plotTitle = 'Volcano erupt!';

interface TemplateProps {
  data: VEuPathDBVolcanoPlotData;
  markerBodyOpacity: number;
  // foldChangeHighGate: number;
  // foldChangeLowGate: number; // we can't have gates unless we mimic the backend updating the data format when we change gates
  adjustedPValueGate: number;
}

const Template: Story<TemplateProps> = (args) => {
  // Better to break into a high and low prop? Would be more clear
  const foldChangeGates = [-1.5, 1.5];

  const comparisonLabels = ['group a', 'group b'];

  const volcanoPlotProps: VolcanoPlotProps = {
    data: dataSetVolcano.volcanoplot,
    adjustedPValueGate: 0.1,
    foldChangeGate: 2,
    markerBodyOpacity: args.markerBodyOpacity,
  };

  return <VolcanoPlot {...volcanoPlotProps} />;
};

export const Basic = Template.bind({});
Basic.args = {
  data: dataSetVolcano,
  markerBodyOpacity: 0.8,
};

// export const Truncation = Template.bind({})
// Truncation.args = {
//   data: dataSetVolcano,
//   independentAxisRange: []
// }

// this process input data function is similar to scatter's but not the same.
// would probably be worth revisiting what is in common and factoring accordingly
