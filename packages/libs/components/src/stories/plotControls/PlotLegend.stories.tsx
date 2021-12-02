import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import Histogram from '../../plots/Histogram';
import PlotLegend from '../../components/plotControls/PlotLegend';
import PlotLegendGradient from '../../components/plotControls/PlotLegendGradient';
import { HistogramData } from '../../types/plots';
import {
  SequentialGradientColormap,
  DivergingGradientColormap,
} from '../../types/plots/addOns';

export default {
  title: 'Plot Controls/PlotLegend',
  component: PlotLegend,
} as Meta;

// From GEMS1 Case Control: Main - Age, Overlay - Age group
const data: HistogramData = {
  series: [
    {
      name: '0-11 months',
      bins: [
        {
          binStart: 0,
          binEnd: 3,
          binLabel: '[0,3]',
          count: 1465,
        },
        {
          binStart: 3,
          binEnd: 6,
          binLabel: '(3,6]',
          count: 3962,
        },
        {
          binStart: 6,
          binEnd: 9,
          binLabel: '(6,9]',
          count: 6023,
        },
        {
          binStart: 9,
          binEnd: 12,
          binLabel: '(9,12]',
          count: 4745,
        },
        {
          binStart: 12,
          binEnd: 15,
          binLabel: '(12,15]',
          count: 801,
        },
      ],
    },
    {
      name: '12-23 months',
      bins: [
        {
          binStart: 9,
          binEnd: 12,
          binLabel: '(9,12]',
          count: 830,
        },
        {
          binStart: 12,
          binEnd: 15,
          binLabel: '(12,15]',
          count: 3718,
        },
        {
          binStart: 15,
          binEnd: 18,
          binLabel: '(15,18]',
          count: 4118,
        },
        {
          binStart: 18,
          binEnd: 21,
          binLabel: '(18,21]',
          count: 3481,
        },
        {
          binStart: 21,
          binEnd: 24,
          binLabel: '(21,24]',
          count: 2077,
        },
        {
          binStart: 24,
          binEnd: 27,
          binLabel: '(24,27]',
          count: 349,
        },
      ],
    },
    {
      name: '24-59 months',
      bins: [
        {
          binStart: 21,
          binEnd: 24,
          binLabel: '(21,24]',
          count: 401,
        },
        {
          binStart: 24,
          binEnd: 27,
          binLabel: '(24,27]',
          count: 1825,
        },
        {
          binStart: 27,
          binEnd: 30,
          binLabel: '(27,30]',
          count: 2078,
        },
        {
          binStart: 30,
          binEnd: 33,
          binLabel: '(30,33]',
          count: 1531,
        },
        {
          binStart: 33,
          binEnd: 36,
          binLabel: '(33,36]',
          count: 1295,
        },
        {
          binStart: 36,
          binEnd: 39,
          binLabel: '(36,39]',
          count: 995,
        },
        {
          binStart: 39,
          binEnd: 42,
          binLabel: '(39,42]',
          count: 790,
        },
        {
          binStart: 42,
          binEnd: 45,
          binLabel: '(42,45]',
          count: 685,
        },
        {
          binStart: 45,
          binEnd: 48,
          binLabel: '(45,48]',
          count: 601,
        },
        {
          binStart: 48,
          binEnd: 51,
          binLabel: '(48,51]',
          count: 570,
        },
        {
          binStart: 51,
          binEnd: 54,
          binLabel: '(51,54]',
          count: 387,
        },
        {
          binStart: 54,
          binEnd: 57,
          binLabel: '(54,57]',
          count: 314,
        },
        {
          binStart: 57,
          binEnd: 60,
          binLabel: '(57,60]',
          count: 242,
        },
        {
          binStart: 60,
          binEnd: 63,
          binLabel: '(60,63]',
          count: 38,
        },
      ],
    },
  ],
  valueType: 'number',
  binWidth: 3,
  binWidthRange: {
    min: 0.1,
    max: 31,
  },
  binWidthStep: 0.03,
};

// legend items processed from data.value
const legendItems = [
  {
    label: '24-59 months',
    marker: 'square',
    markerColor: 'rgb(153,153,51)',
    hasData: true,
    group: 1,
    rank: 1,
  },
  {
    label: '12-23 months',
    marker: 'square',
    markerColor: 'rgb(136,204,238)',
    hasData: true,
    group: 1,
    rank: 1,
  },
  {
    label: '0-11 months',
    marker: 'square',
    markerColor: 'rgb(136,34,85)',
    hasData: true,
    group: 1,
    rank: 1,
  },
];

// set some default props
const plotWidth = 1000;
const plotHeight = 600;
const independentAxisLabel = 'Age (months)';
const dependentAxisLabel = 'Count';
const plotTitle = 'From GEMS1 Case Control: Main - Age, Overlay - Age group';

// custom legend with histogram
export const HistogramPlotLegend = () => {
  // set useState to track checkbox status
  const [checkedLegendItems, setCheckedLegendItems] = useState<string[]>(
    legendItems.map((item) => item.label)
  );

  return (
    <div>
      <Histogram
        data={data}
        independentAxisLabel={independentAxisLabel}
        dependentAxisLabel={dependentAxisLabel}
        title={plotTitle}
        // width height is replaced with containerStyles
        containerStyles={{
          width: plotWidth,
          height: plotHeight,
        }}
        interactive={true}
        displayLegend={true}
        displayLibraryControls={true}
        showValues={false}
        // margin={{l: 50, r: 10, b: 20, t: 10}}
        // add legend title
        legendTitle={'Age group'}
        // pass checkedLegendItems to PlotlyPlot
        checkedLegendItems={checkedLegendItems}
      />
      <PlotLegend
        legendItems={legendItems}
        checkedLegendItems={checkedLegendItems}
        onCheckedLegendItemsChange={setCheckedLegendItems}
        // pass legend title
        legendTitle={'Age group'}
      />
    </div>
  );
};

// custom legend with scatterplot gradient colormap
export const ScatterGradientPlotLegend = () => {
  // set useState to track checkbox status
  const [checkedLegendItems, setCheckedLegendItems] = useState<string[]>(
    legendItems.map((item) => item.label)
  );

  return (
    <div>
      {/* <Histogram
        data={data}
        independentAxisLabel={independentAxisLabel}
        dependentAxisLabel={dependentAxisLabel}
        title={plotTitle}
        // width height is replaced with containerStyles
        containerStyles={{
          width: plotWidth,
          height: plotHeight,
        }}
        interactive={true}
        displayLegend={true}
        displayLibraryControls={true}
        showValues={false}
        // margin={{l: 50, r: 10, b: 20, t: 10}}
        // add legend title
        legendTitle={'Age group'}
        // pass checkedLegendItems to PlotlyPlot
        checkedLegendItems={checkedLegendItems}
      /> */}
      <PlotLegendGradient
        legendMax={0}
        legendMin={-1}
        colorScale={SequentialGradientColormap}
        // pass legend title
        legendTitle={'Age group'}
      />
    </div>
  );
};
// legendMax,
// legendMin,
// colorScale,
// legendTitle,
// markMidpoint
