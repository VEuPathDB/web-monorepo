import React from 'react';
import { action } from '@storybook/addon-actions';
import LinePlot from './LinePlot';

export default {
  title: 'LinePlot',
  component: LinePlot,
};

export const Basic = () => <LinePlot
  onPlotUpdate={action('state updated')}
  data={[{
    x: ['A','B','C','D','E'],
    y: [2,4,3,5,8],
    name: 'Variable A',
    line: {
      dash: 'solid',
      width: 3
      }
  }]}
  xLabel="foo"
  yLabel="bar"
/>


export const BasicFilled = () => <LinePlot
  onPlotUpdate={action('state updated')}
  data={[{
    x: [1,2,4,8,16,32,64,128],
    y: [22,54,90,12,94,38,25,82],
    name: 'Variable A',
    fill: 'tozeroy',
    line: {
      dash: 'solid',
      width: 3
      }
  }]}
  xLabel="foo"
  yLabel="bar"
/>



const x = ['A','B','C','D','E'];
export const MultiVariate = () => <LinePlot
  onPlotUpdate={action('state updated')}
  data={[{
    x,
    y: [1,2,3,4,5],
    name: 'Variable A',
    line: {
      dash: 'dashdot',
      width: 4
    }
  }, 
  {
    x,
    y: [1,4,9,16,25],
    name: 'Variable B',
    line: {
      dash: 'dot',
      width: 4
    }
  }, 
  {
    x,
    y: [3,9,4,16,10],
    name: 'Variable C',
    line: {
      dash: 'solid',
      width: 4
    }
  }


]}
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
