import React, { useState } from 'react';
import VolcanoPlot, { VolcanoPlotProps } from '../../plots/VolcanoPlot';
import {
  XYChart,
  Tooltip,
  Axis,
  Grid,
  GlyphSeries,
  LineSeries,
} from '@visx/xychart';
// import { min, max, lte, gte } from 'lodash';
// import { dataSetProcess, xAxisRange, yAxisRange } from './ScatterPlot.storyData';
import { Story, Meta } from '@storybook/react/types-6-0';
// test to use RadioButtonGroup directly instead of ScatterPlotControls
import { NumberRange } from '../../types/general';

import { ScatterPlotData } from '../../types/plots';
import { AxisBottom } from '@visx/visx';
import { scaleLinear } from '@visx/scale';
import ControlsHeader from '../../../lib/components/typography/ControlsHeader';
import { Line } from '@visx/shape';
import { Group } from '@visx/group';

export default {
  title: 'Plots/VolcanoPlotVisx',
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

// These can go into addons eventually. I'd expect other vizs that involve significance to use these as well
// These are NOT the final proposed colors
const highMedLowColors = ['#dd1111', '#bbbbbb', '#1111dd'];

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

  /**
   * Volcano knows
   * x and y label (always fold change and pvalue)
   */

  /**
   * datasetProcess has three or fewer series
   * has columms for foldChange, adjustedPValue, pointId, significanceDirection (naming help!!)
   *
   */

  const independentAxisRange = {
    min: -5,
    max: 5,
  };
  // Determined by the data and symmetric around 0 by default?
  const dependentAxisRange = {
    min: 0,
    max: 0.03,
  }; // By default max determined by data and min at 0

  const accessors = {
    xAccessor: (d: any) => {
      return d.x;
    },
    yAccessor: (d: any) => {
      return d.y;
    },
  };

  const bottomScale = scaleLinear({
    domain: [-4, 4],
    range: [-1, 8],
    nice: true,
  });
  const volcanoPlotProps: VolcanoPlotProps = {
    data: dataSetVolcano.volcanoplot,
    adjustedPValueGate: 0.1,
    foldChangeGate: 2,
  };

  return <VolcanoPlot {...volcanoPlotProps} />;
};

export const Default2 = Template.bind({});
Default2.args = {
  data: dataSetVolcano,
  markerBodyOpacity: 0.8,
};

// this process input data function is similar to scatter's but not the same.
// would probably be worth revisiting what is in common and factoring accordingly
