import React from 'react';
import Boxplot from './Boxplot';
import stats from 'stats-lite';
import _ from 'lodash';

export default {
  title: 'Boxplot',
  component: Boxplot,
};


const catRawData = [ 16, 18, 19, 28, 15, 17, 18, 21, 20, 22 ];
const catData = summaryStats(catRawData);
const catMean = stats.mean(catRawData);

const dogRawData = [ 20, 60, 61, 77, 72, 50, 61, 80, 88, 120, 130, 131, 129, 67, 77, 87, 66, 69, 74, 56, 68 ];
const dogData = summaryStats(dogRawData);
const dogMean = stats.mean(dogRawData);

export const Basic = () => <Boxplot
  data={[ {...catData, label: 'cats'}, {...dogData, label: 'dogs'} ]}
/>

export const WithMean = () => <Boxplot
  data={[ {...catData, label: 'cats', mean: catMean}, {...dogData, label: 'dogs', mean: dogMean} ]}
/>

const outdoorTemperatureRawData = [ -25, -10, -5, -3, 0, 1, 2, 6, 7, 17, 18, 25, 33 ];
const outdoorTemperatureData = summaryStats(outdoorTemperatureRawData);

export const BelowZero = () => <Boxplot
  data={[ {...outdoorTemperatureData, label: 'outdoor temperature'} ]}
/>

export const NoWhiskers = () => <Boxplot
  data={[ {...outdoorTemperatureData, lowerWhisker: undefined, upperWhisker: undefined, label: 'outdoor temperature'} ]}
/>

const indoorTemperatureRawData = [ 15, 17, 20, 21, 21, 21, 21, 23, 22, 25 ];
const indoorTemperatureData = summaryStats(indoorTemperatureRawData);

export const YAxisLabel = () => <Boxplot
  data={[ {...outdoorTemperatureData, label: 'outdoor'}, {...indoorTemperatureData, label: 'indoor'} ]}
  yAxisLabel={"temperature, °C"}
/>

export const XAndYAxisLabel = () => <Boxplot
  data={[ {...catData, label: 'cats'}, {...dogData, label: 'dogs'} ]}
  xAxisLabel={"domestic animal"}
  yAxisLabel={"height, cm"}
/>

export const FixedYAxisRange = () => <Boxplot
  data={[ {...outdoorTemperatureData, label: 'outdoor'}, {...indoorTemperatureData, label: 'indoor'} ]}
  yAxisLabel={"temperature, °C"}
  xAxisLabel={"location"}
  defaultYAxisRange={[-50,50]}
/>

export const FixedTooSmallYAxisRange = () => <Boxplot
  data={[ {...outdoorTemperatureData, label: 'outdoor'}, {...indoorTemperatureData, label: 'indoor'} ]}
  yAxisLabel={"temperature, °C"}
  xAxisLabel={"location"}
  defaultYAxisRange={[-10,10]}
/>

export const Horizontal = () => <Boxplot
  data={[ {...catData, label: 'cats'}, {...dogData, label: 'dogs'} ]}
  xAxisLabel={"domestic animal"}
  yAxisLabel={"height, cm"}
  defaultOrientation={"horizontal"}
/>

export const HorizontalLongLabels = () => <Boxplot
  data={[ {...catData, label: 'hungry domestic cats'}, {...dogData, label: 'sleepy domestic dogs'} ]}
  xAxisLabel={"type of domestic animal"}
  yAxisLabel={"height, cm"}
  defaultOrientation={"horizontal"}
/>



function summaryStats(rawData : number[]) {
  const q1 = stats.percentile(rawData, 0.25);
  const median = stats.median(rawData);
  const q3 = stats.percentile(rawData, 0.75);
  const IQR = q3-q1;
  const lowerFence = q1 - 1.5*IQR;
  const upperFence = q3 + 1.5*IQR;
  const lowerWhisker = _.min(rawData.filter((x) => x > lowerFence));
  const upperWhisker = _.max(rawData.filter((x) => x < upperFence));

  const outliers = rawData.filter((x) => x < lowerFence || x > upperFence);

  return {
    q1, median, q3,
    lowerWhisker, upperWhisker, outliers
  }
}

