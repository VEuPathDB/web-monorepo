import React from 'react';
import { Meta, Story } from '@storybook/react'
import Boxplot, {Props} from './Boxplot';
import stats from 'stats-lite';
import _ from 'lodash';

export default {
  title: 'Boxplot',
  component: Boxplot,
} as Meta;

const Template = (args : Props) => <Boxplot {...args} />;

const catRawData = [ 8, 26, 28, 19, 28, 20, 50, 38, 35, 32, 31, 25, 22, 21, 25, 22 ];
const catData = summaryStats(catRawData);
const catMean = stats.mean(catRawData);

const dogRawData = [ 20, 60, 61, 77, 72, 50, 61, 80, 88, 120, 130, 131, 129, 67, 77, 87, 66, 69, 74, 56, 68 ];
const dogData = summaryStats(dogRawData);
const dogMean = stats.mean(dogRawData);

export const Basic : Story<Props> = Template.bind({});
Basic.args = {
  data: [ {...catData, label: 'cats'},
	  {...dogData, label: 'dogs'} ]
};

export const NoOutliersGiven : Story<Props> = Template.bind({});
NoOutliersGiven.args = {
  data: [ {...catData, label: 'cats', outliers: []},
	  {...dogData, label: 'dogs', outliers: []} ]
};

export const WithMean : Story<Props> = Template.bind({});
WithMean.args = {
  data: [ {...catData, label: 'cats', mean: catMean},
	  {...dogData, label: 'dogs', mean: dogMean} ]
}

const outdoorTemperatureRawData = [ -25, -10, -5, -3, 0, 1, 2, 6, 7, 17, 18, 25, 33 ];
const outdoorTemperatureData = summaryStats(outdoorTemperatureRawData);

export const BelowZero : Story<Props> = Template.bind({});
BelowZero.args = {
  data: [ {...outdoorTemperatureData, label: 'outdoor temperature'} ]
}

export const NoWhiskers : Story<Props> = Template.bind({});
NoWhiskers.args = {
  data: [ {...outdoorTemperatureData, lowerWhisker: undefined, upperWhisker: undefined, label: 'outdoor temperature'} ]
}

const indoorTemperatureRawData = [ 15, 17, 20, 21, 21, 21, 21, 23, 22, 25 ];
const indoorTemperatureData = summaryStats(indoorTemperatureRawData);

export const YAxisLabel : Story<Props> = Template.bind({});
YAxisLabel.args = {
  data: [ {...outdoorTemperatureData, label: 'outdoor'},
	  {...indoorTemperatureData, label: 'indoor'} ],
  yAxisLabel: "temperature, °C"
}

export const XAndYAxisLabel : Story<Props> = Template.bind({});
XAndYAxisLabel.args = {
  data: [ {...catData, label: 'cats'}, {...dogData, label: 'dogs'} ],
  xAxisLabel: "domestic animal",
  yAxisLabel: "height, cm"
}

export const FixedYAxisRange : Story<Props> = Template.bind({});
FixedYAxisRange.args = {
  data: [ {...outdoorTemperatureData, label: 'outdoor'}, {...indoorTemperatureData, label: 'indoor'} ],
  yAxisLabel: "temperature, °C",
  xAxisLabel: "location",
  defaultYAxisRange: [-50,50]
}

export const FixedTooSmallYAxisRange : Story<Props> = Template.bind({});
FixedTooSmallYAxisRange.args = {
  data: [ {...outdoorTemperatureData, label: 'outdoor'}, {...indoorTemperatureData, label: 'indoor'} ],
  yAxisLabel: "temperature, °C",
  xAxisLabel: "location",
  defaultYAxisRange: [-10,10]
}

export const Horizontal : Story<Props> = Template.bind({});
Horizontal.args = {
  data: [ {...catData, label: 'cats'}, {...dogData, label: 'dogs'} ],
  xAxisLabel: "domestic animal",
  yAxisLabel: "height, cm",
  defaultOrientation: "horizontal"
}

export const HorizontalLongLabels : Story<Props> = Template.bind({});
HorizontalLongLabels.args = {
  data: [ {...catData, label: 'hungry domestic cats'}, {...dogData, label: 'sleepy domestic dogs'} ],
  xAxisLabel: "type of domestic animal",
  yAxisLabel: "height, cm",
  defaultOrientation: "horizontal"
}


export const WithRawData : Story<Props> = Template.bind({});
WithRawData.args = {
  data: [ {...catData, label: 'cats', rawData: catRawData}, {...dogData, label: 'dogs', rawData: dogRawData} ],
  defaultShowRawData: true,
  xAxisLabel: "domestic animal",
  yAxisLabel: "height, cm"
}

export const HorizontalWithRawData : Story<Props> = Template.bind({});
HorizontalWithRawData.args = {
  data: [ {...catData, label: 'cats', rawData: catRawData}, {...dogData, label: 'dogs', rawData: dogRawData} ],
  defaultShowRawData: true,
  xAxisLabel: "domestic animal",
  yAxisLabel: "height, cm",
  defaultOrientation: "horizontal"
}

export const HorizontalWithOneRawDataOneMean : Story<Props> = Template.bind({});
HorizontalWithOneRawDataOneMean.args = {
  data: [ {...catData, label: 'cats with mean', mean: catMean}, {...dogData, label: 'dogs with raw', rawData: dogRawData} ],
  defaultShowRawData: true,
  xAxisLabel: "domestic animal",
  yAxisLabel: "height, cm",
  defaultOrientation: "horizontal"
}



function summaryStats(rawData : number[]) {
  const q1 = stats.percentile(rawData, 0.25);
  const median = stats.median(rawData);
  const q3 = stats.percentile(rawData, 0.75);
  const IQR = q3-q1;
  const lowerFence = q1 - 1.5*IQR;
  const upperFence = q3 + 1.5*IQR;
  const lowerWhisker = _.min(rawData.filter((x) => x >= lowerFence));
  const upperWhisker = _.max(rawData.filter((x) => x <= upperFence));

  const outliers = rawData.filter((x) => x < lowerFence || x > upperFence);

  return {
    q1, median, q3,
    lowerWhisker, upperWhisker, outliers
  }
}

