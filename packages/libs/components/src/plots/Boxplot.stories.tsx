import React from 'react';
import Boxplot from './Boxplot';
import stats from 'stats-lite';

export default {
  title: 'Boxplot',
  component: Boxplot,
};


const catRawData = [ 6, 8, 9, 11, 5, 7, 10, 10, 12, 19 ];
const catData = summaryStats(catRawData);
const catMean = stats.mean(catRawData);

const dogRawData = [ 11, 25, 16, 15, 10, 20, 28, 24, 23, 22, 25, 15, 12, 16, 19, 42, 42, 45 ];
const dogData = summaryStats(dogRawData);
const dogMean = stats.mean(dogRawData);

export const Basic = () => <Boxplot
  data={[ {...catData, label: 'cats'}, {...dogData, label: 'dogs'} ]}
/>

export const WithMean = () => <Boxplot
  data={[ {...catData, label: 'cats', mean: catMean}, {...dogData, label: 'dogs', mean: dogMean} ]}
/>



function summaryStats(rawData : number[]) {
  const q1 = stats.percentile(rawData, 0.25);
  const median = stats.median(rawData);
  const q3 = stats.percentile(rawData, 0.75);
  const IQR = q3-q1;
  const lowerFence = q1 - 1.5*IQR;
  const upperFence = q3 + 1.5*IQR;
  const outliers = rawData.filter((x) => x < lowerFence || x > upperFence);

  return {
    q1, median, q3,
    lowerFence, upperFence, outliers
  }
}

