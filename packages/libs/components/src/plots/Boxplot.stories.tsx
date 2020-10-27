import React from 'react';
import Boxplot from './Boxplot';
import stats from 'stats-lite';

export default {
  title: 'Boxplot',
  component: Boxplot,
};


const catRawData = [ 6, 3, 9, 2, 5, 7, 10, 10, 2, 19 ];
const catQ1 = stats.percentile(catRawData, 0.25);
const catQ3 = stats.percentile(catRawData, 0.75);
const catIQR = catQ3-catQ1;
const catLower = catQ1 - 1.5*catIQR;
const catUpper = catQ3 + 1.5*catIQR;

const catData = {
  lowerFence : catLower,
  q1 : catQ1,
  median : stats.median(catRawData),
  q3 : catQ3,
  upperFence : catUpper,
  label : 'cats',
  rawData : catRawData,
  outliers : catRawData.filter((x) => x < catLower || x > catUpper)
};

const dogRawData = [ 11, 25, 6, 15, 10, 20, 8, 22, 15, 12, 16, 9, 35 ];
const dogQ1 = stats.percentile(dogRawData, 0.25);
const dogQ3 = stats.percentile(dogRawData, 0.75);
const dogIQR = dogQ3-dogQ1;
const dogLower = dogQ1 - 1.5*dogIQR;
const dogUpper = dogQ3 + 1.5*dogIQR;

const dogData = {
  lowerFence : dogLower,
  q1 : dogQ1,
  median : stats.median(dogRawData),
  q3 : dogQ3,
  upperFence : dogUpper,
  label : 'dogs',
  rawData : dogRawData,
  outliers : dogRawData.filter((x) => x < dogLower || x > dogUpper)
};

export const Basic = () => <Boxplot
  data={[ catData, dogData ]}
/>
