import React from 'react';
import { action } from '@storybook/addon-actions';
import ScatterPlot from './ScatterPlot';

export default {
  title: 'ScatterPlot',
  component: ScatterPlot,
};

export const Basic = () => <ScatterPlot
  onPlotUpdate={action('state updated')}
  data={[{
    x: randomData(100),
    y: randomData(100),
    name: 'Variable A',
  }]}
  xLabel="foo"
  yLabel="bar"
/>

export const MultiVariate = () => <ScatterPlot
  onPlotUpdate={action('state updated')}
  data={[{
    x: randomData(100),
    y: randomData(100),
    name: 'Variable A'
  }, {
    x: randomData(100),
    y: randomData(100),
    name: 'Variable B'
  }]}
  xLabel="foo"
  yLabel="bar"
/>

function randomData(size: number) {
  const data: number[] = [];
  for (let i = 0; i < size; i++) {
    data.push(Math.random());
  }
  return data;
}
