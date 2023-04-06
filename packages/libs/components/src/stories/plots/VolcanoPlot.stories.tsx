import React, { useState } from 'react';
import VolcanoPlot, { VolcanoPlotProps } from '../../plots/VolcanoPlot';
import { Story, Meta } from '@storybook/react/types-6-0';
import { scaleLinear } from '@visx/scale';
import { range } from 'lodash';
import { AreaSeries } from '@visx/xychart';

export default {
  title: 'Plots/VolcanoPlot',
  component: VolcanoPlot,
} as Meta;

interface VEuPathDBVolcanoPlotData {
  volcanoplot: {
    series: {
      foldChange: string[];
      pValue: string[];
      adjustedPValue: string[];
      pointId: string[];
    };
  };
}

// Let's make some fake data!
const dataSetVolcano: VEuPathDBVolcanoPlotData = {
  volcanoplot: {
    series: {
      foldChange: [
        '2',
        '3',
        '0.5',
        '0.8',
        '1',
        '0.5',
        '0.1',
        '4',
        '0.2',
        '0.01',
        '0.02',
        '0.03',
      ],
      pValue: [
        '0.001',
        '0.0001',
        '0.01',
        '0.001',
        '2',
        '1',
        '7',
        '1',
        '4',
        '0.001',
        '0.0001',
        '0.002',
      ],
      adjustedPValue: ['0.01', '0.001', '0.01', '0.001', '0.02'],
      pointId: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'],
    },
  },
};

const nPoints = 300;
const dataSetVolcanoManyPoints: VEuPathDBVolcanoPlotData = {
  volcanoplot: {
    series: {
      foldChange: range(1, nPoints).map((p) => String(6 * Math.random() + 3)),
      pValue: range(1, nPoints).map((p) => String(Math.random())),
      adjustedPValue: range(1, nPoints).map((p) =>
        String(nPoints * Math.random())
      ),
      pointId: range(1, nPoints).map((p) => String(p)),
    },
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
  const comparisonLabels = ['up in group a', 'up in group b'];

  const volcanoPlotProps: VolcanoPlotProps = {
    data: args.data.volcanoplot.series,
    significanceThreshold: 0.1,
    foldChangeThreshold: 2,
    markerBodyOpacity: args.markerBodyOpacity,
    comparisonLabels: comparisonLabels,
  };

  return <VolcanoPlot {...volcanoPlotProps} />;
};

export const Simple = Template.bind({});
Simple.args = {
  data: dataSetVolcano,
  markerBodyOpacity: 0.8,
};

export const ManyPoints = Template.bind({});
ManyPoints.args = {
  data: dataSetVolcanoManyPoints,
  markerBodyOpacity: 0.5,
};

// Add story for truncation
// export const Truncation = Template.bind({})
// Truncation.args = {
//   data: dataSetVolcano,
//   independentAxisRange: []
// }
