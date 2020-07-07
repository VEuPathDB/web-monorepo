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
    fill: 'None',
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
    fill: 'None',
      line: {
      dash: 'dashdot',
      width: 4
    }
  }, 
  {
    x,
    y: [1,4,9,16,25],
    fill: 'None',
    name: 'Variable B',
    line: {
      dash: 'dot',
      width: 4
    }
  }, 
  {
    x,
    y: [3,9,4,16,10],
    fill: 'None',
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


export const MultiVariateFilled = () => <LinePlot
  onPlotUpdate={action('state updated')}
  data={[{
    x:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48],
    y: [90,92,95,95,96,97,97,98,98,97,94,94,92,90,84,78,52,29,17,10,5,3,2,2,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,8,16,22,28,38,50,66,70,67],
    name: 'E',
    fill: 'tozeroy',
    line: {
      dash: 'dashdot',
      width: 4
    }
  }, 
  {
    x:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48],
    y: [10,8,5,5,4,4,3,3,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,16,19,46,63,71,88,97,100,100,100,95,95,95,92,84,78,72,62,50,44,30,33],
    name: 'S',
    fill: 'tozeroy',
    line: {
      dash: 'solid',
      width: 4
    }
  },
  {
    x:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48],
    y: [0,0,0,0,0,0,0,0,0,2,5,6,8,10,16,22,48,71,83,90,95,97,98,98,100,93,84,81,54,37,29,12,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    name: 'T',
    fill: 'tozeroy',
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
