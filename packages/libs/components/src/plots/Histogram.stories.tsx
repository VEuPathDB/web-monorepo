import React from 'react';
import { action } from '@storybook/addon-actions';
import Histogram from './Histogram';

export default {
  title: 'Histogram',
  component: Histogram,
};

export const Basic = () => <Histogram
  onPlotUpdate={action('state updated')}
  data={[{
    x: randomData(100),
    y: randomData(100),
    name: 'Variable A'
  }]}
  xLabel="foo"
  yLabel="bar"
/>

const x = randomData(100);
export const MultiVariate = () => <Histogram
  onPlotUpdate={action('state updated')}
  data={[{
    x,
    y: randomData(100),
    name: 'Variable A'
  }, {
    x,
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
