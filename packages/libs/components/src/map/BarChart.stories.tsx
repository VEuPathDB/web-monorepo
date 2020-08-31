import React, { ReactElement, useState, useCallback } from 'react';
// import { action } from '@storybook/addon-actions';
import BarChart from './BarChart';

export default {
  title: 'Bar Chart',
  component: BarChart,
};

let colors = [
  '#FFB300',
  '#803E75',
  'grey',
]

export const HighchartsBarChartStory = () => {
  return (
    <BarChart labels={['America', 'Europe', 'Africa']} values={[3, 1, 4]} width={700} height={500} yRange={[0, 5]} type='bar' library='highcharts' colors={colors} />
  );
}

export const SmallHighchartsBarChartStory = () => {
  return (
    <BarChart labels={['America', 'Europe', 'Africa']} values={[3, 1, 4]} width={40} height={40} yRange={[0, 5]} type='bar' library='highcharts' colors={colors} />
  );
}

export const HighchartsLineChartStory = () => {
  return (
    <BarChart labels={['America', 'Europe', 'Africa']} values={[3, 1, 4]} width={700} height={500} yRange={[0, 5]} type='line' library='highcharts' colors={colors} />
  );
}

export const SmallHighchartsLineChartStory = () => {
  return (
    <BarChart labels={['America', 'Europe', 'Africa']} values={[3, 1, 4]} width={40} height={40} yRange={[0, 5]} type='line' library='highcharts' colors={colors} />
  );
}
