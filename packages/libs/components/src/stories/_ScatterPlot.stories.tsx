import React from 'react';
import ScatterPlot from '../plots/ScatterPlot';

export default {
  title: 'ScatterPlot',
  component: ScatterPlot,
};

export const Basic = () => (
  <ScatterPlot
    data={[
      {
        x: [1, 2, 5, 6, 10, 12, 14, 18, 20, 22, 24, 26, 29, 30, 35],
        y: [3, 5, 1, 8, 6, 2, 20, 5, 10, 12, 14, 16, 20, 25, 27],
        name: 'Variable A',
      },
    ]}
    xLabel="Height"
    yLabel="Diameter"
  />
);

export const MultiVariate = () => (
  <ScatterPlot
    data={[
      {
        x: [1, 2, 5, 6, 10, 12, 14, 18, 20, 22, 24, 26, 29, 30, 35],
        y: [3, 5, 1, 8, 6, 2, 20, 5, 10, 12, 14, 16, 20, 25, 27],
        name: 'Variable A',
      },
      {
        x: [1, 2, 5, 6, 10, 12, 14, 18, 20, 22, 24, 26, 29, 30, 35],
        y: [5, 7, 3, 5, 12, 6, 17, 12, 7, 16, 19, 25, 28, 32, 33],
        name: 'Variable B',
      },
    ]}
    xLabel="Height"
    yLabel="Diameter"
  />
);

function randomData(size: number) {
  const data: number[] = [];
  for (let i = 0; i < size; i++) {
    data.push(Math.random());
  }
  return data;
}
