import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import Histogram from '../../plots/Histogram';
import PlotLegend from '../../components/plotControls/PlotLegend';
import PlotGradientLegend from '../../components/plotControls/PlotGradientLegend';
import { HistogramData } from '../../types/plots';

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
          value: 1465,
        },
        {
          binStart: 3,
          binEnd: 6,
          binLabel: '(3,6]',
          value: 3962,
        },
        {
          binStart: 6,
          binEnd: 9,
          binLabel: '(6,9]',
          value: 6023,
        },
        {
          binStart: 9,
          binEnd: 12,
          binLabel: '(9,12]',
          value: 4745,
        },
        {
          binStart: 12,
          binEnd: 15,
          binLabel: '(12,15]',
          value: 801,
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
          value: 830,
        },
        {
          binStart: 12,
          binEnd: 15,
          binLabel: '(12,15]',
          value: 3718,
        },
        {
          binStart: 15,
          binEnd: 18,
          binLabel: '(15,18]',
          value: 4118,
        },
        {
          binStart: 18,
          binEnd: 21,
          binLabel: '(18,21]',
          value: 3481,
        },
        {
          binStart: 21,
          binEnd: 24,
          binLabel: '(21,24]',
          value: 2077,
        },
        {
          binStart: 24,
          binEnd: 27,
          binLabel: '(24,27]',
          value: 349,
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
          value: 401,
        },
        {
          binStart: 24,
          binEnd: 27,
          binLabel: '(24,27]',
          value: 1825,
        },
        {
          binStart: 27,
          binEnd: 30,
          binLabel: '(27,30]',
          value: 2078,
        },
        {
          binStart: 30,
          binEnd: 33,
          binLabel: '(30,33]',
          value: 1531,
        },
        {
          binStart: 33,
          binEnd: 36,
          binLabel: '(33,36]',
          value: 1295,
        },
        {
          binStart: 36,
          binEnd: 39,
          binLabel: '(36,39]',
          value: 995,
        },
        {
          binStart: 39,
          binEnd: 42,
          binLabel: '(39,42]',
          value: 790,
        },
        {
          binStart: 42,
          binEnd: 45,
          binLabel: '(42,45]',
          value: 685,
        },
        {
          binStart: 45,
          binEnd: 48,
          binLabel: '(45,48]',
          value: 601,
        },
        {
          binStart: 48,
          binEnd: 51,
          binLabel: '(48,51]',
          value: 570,
        },
        {
          binStart: 51,
          binEnd: 54,
          binLabel: '(51,54]',
          value: 387,
        },
        {
          binStart: 54,
          binEnd: 57,
          binLabel: '(54,57]',
          value: 314,
        },
        {
          binStart: 57,
          binEnd: 60,
          binLabel: '(57,60]',
          value: 242,
        },
        {
          binStart: 60,
          binEnd: 63,
          binLabel: '(60,63]',
          value: 38,
        },
      ],
    },
  ],
  binWidthSlider: {
    valueType: 'number',
    binWidth: 3,
    binWidthRange: {
      min: 0.1,
      max: 31,
    },
    binWidthStep: 0.03,
  },
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

// test data for long legend items: taken from Scatterplot with Smoothed mean
const longLegendItems = [
  {
    label: 'Bangladesh',
    marker: 'circle',
    markerColor: 'rgb(136,34,85)',
    hasData: true,
    group: 1,
    rank: 1,
  },
  {
    label: 'India',
    marker: 'circle',
    markerColor: 'rgb(136,204,238)',
    hasData: true,
    group: 1,
    rank: 1,
  },
  {
    label: 'Kenya',
    marker: 'circle',
    markerColor: 'rgb(153,153,51)',
    hasData: true,
    group: 1,
    rank: 1,
  },
  {
    label: 'Mali',
    marker: 'circle',
    markerColor: 'rgb(51,34,136)',
    hasData: true,
    group: 1,
    rank: 1,
  },
  {
    label: 'Mozambique',
    marker: 'circle',
    markerColor: 'rgb(68,170,153)',
    hasData: true,
    group: 1,
    rank: 1,
  },
  {
    label: 'Pakistan',
    marker: 'circle',
    markerColor: 'rgb(221,204,119)',
    hasData: true,
    group: 1,
    rank: 1,
  },
  {
    label: 'The Gambia',
    marker: 'circle',
    markerColor: 'rgb(204,102,119)',
    hasData: true,
    group: 1,
    rank: 1,
  },
  {
    label: 'Bangladesh, Smoothed mean',
    marker: 'line',
    markerColor: 'rgb(136,34,85)',
    hasData: true,
    group: 1,
    rank: 1,
  },
  {
    label: 'Bangladesh, 95% Confidence interval',
    marker: 'fainted',
    markerColor: 'rgb(136,34,85)',
    hasData: true,
    group: 1,
    rank: 1,
  },
  {
    label: 'India, Smoothed mean',
    marker: 'line',
    markerColor: 'rgb(136,204,238)',
    hasData: false,
    group: 1,
    rank: 1,
  },
  {
    label: 'India, 95% Confidence interval',
    marker: 'fainted',
    markerColor: 'rgb(136,204,238)',
    hasData: false,
    group: 1,
    rank: 1,
  },
  {
    label: 'Kenya, Smoothed mean',
    marker: 'line',
    markerColor: 'rgb(153,153,51)',
    hasData: false,
    group: 1,
    rank: 1,
  },
  {
    label: 'Kenya, 95% Confidence interval',
    marker: 'fainted',
    markerColor: 'rgb(153,153,51)',
    hasData: false,
    group: 1,
    rank: 1,
  },
  {
    label: 'Mali, Smoothed mean',
    marker: 'line',
    markerColor: 'rgb(51,34,136)',
    hasData: true,
    group: 1,
    rank: 1,
  },
  {
    label: 'Mali, 95% Confidence interval',
    marker: 'fainted',
    markerColor: 'rgb(51,34,136)',
    hasData: true,
    group: 1,
    rank: 1,
  },
  {
    label: 'Mozambique, Smoothed mean',
    marker: 'line',
    markerColor: 'rgb(68,170,153)',
    hasData: true,
    group: 1,
    rank: 1,
  },
  {
    label: 'Mozambique, 95% Confidence interval',
    marker: 'fainted',
    markerColor: 'rgb(68,170,153)',
    hasData: true,
    group: 1,
    rank: 1,
  },
  {
    label: 'Pakistan, Smoothed mean',
    marker: 'line',
    markerColor: 'rgb(221,204,119)',
    hasData: true,
    group: 1,
    rank: 1,
  },
  {
    label: 'Pakistan, 95% Confidence interval',
    marker: 'fainted',
    markerColor: 'rgb(221,204,119)',
    hasData: true,
    group: 1,
    rank: 1,
  },
  {
    label: 'The Gambia, Smoothed mean',
    marker: 'line',
    markerColor: 'rgb(204,102,119)',
    hasData: true,
    group: 1,
    rank: 1,
  },
  {
    label: 'The Gambia, 95% Confidence interval',
    marker: 'fainted',
    markerColor: 'rgb(204,102,119)',
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

// custom legend with scatterplot gradient colorscale
export const GradientPlotLegend = () => {
  return (
    <div>
      <PlotGradientLegend
        legendMax={100}
        legendMin={5}
        // Options are 'sequential' and 'divergent'
        gradientColorscaleType={'divergent'}
        // pass legend title
        legendTitle={'Very very very long name'}
        nTicks={5}
      />
    </div>
  );
};

// custom legend with histogram
export const TestLongLegendItems = () => {
  // long legend test
  const [checkedLongLegendItems, setCheckedLongLegendItems] = useState<
    string[]
  >(longLegendItems.map((item) => item.label));

  return (
    <div>
      {/* testing long legend items: taken from a Scatter plot with smoothed mean */}
      <h5># Testing long legend items</h5>
      <PlotLegend
        legendItems={longLegendItems}
        checkedLegendItems={checkedLongLegendItems}
        onCheckedLegendItemsChange={setCheckedLongLegendItems}
        // pass legend title
        legendTitle={'Country'}
      />
    </div>
  );
};
