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
    x: [0,1,2,3,4,5,6,7,8,9,10],
    y: randomData(11).map((x) => Math.floor(x*100)),
    name: 'Variable A'
  }]}
  xLabel="exam score"
  yLabel="count"
/>

const x = [ 'eggs', 'milk', 'cheese' ];
export const MultiVariate = () => <Histogram
  onPlotUpdate={action('state updated')}
  data={[{
    x,
    y: randomData(3).map((x) => 100*x),
    name: 'carbohydrate'
  }, {
    x,
    y: randomData(3).map((x) => 100*x),
    name: 'fat'
  }]}
  xLabel="ingredient"
  yLabel="percent content"
/>

function randomData(size: number) {
  const data: number[] = [];
  for (let i = 0; i < size; i++) {
    data.push(Math.random());
  }
  return data;
}
