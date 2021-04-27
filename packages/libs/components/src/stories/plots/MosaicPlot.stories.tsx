import React from 'react';
import MosaicPlot from '../../plots/MosaicPlot';

export default {
  title: 'Plots/Mosaic',
  component: MosaicPlot,
};

export const TwoByTwo = () => (
  <MosaicPlot
    data={[
      [40, 15],
      [10, 25],
    ]}
    xValues={['Men', 'Women']}
    yValues={['Died', 'Survived']}
    xLabel={'Sex'}
    yLabel={'Status'}
    colors={['orange', 'blue']}
  />
);

export const TwoByThree = () => (
  <MosaicPlot
    data={[
      [45, 15, 20],
      [10, 45, 20],
    ]}
    xValues={['Rabbit', 'Cat', 'Dog']}
    yValues={['Positive', 'Negative']}
    xLabel={'Animal'}
    yLabel={'Rabies'}
    width={400}
    height={300}
    showLegend={false}
    showModebar={false}
  />
);

export const FourByThree = () => (
  <MosaicPlot
    data={[
      [52, 15, 35],
      [15, 40, 50],
      [20, 15, 7],
      [22, 30, 10],
    ]}
    xValues={['Mercury', 'Venus', 'Mars']}
    yValues={['Nitrogen', 'Oxygen', 'Hydrogen', 'Other']}
    xLabel={'Planet'}
    yLabel={'Atmospheric Makeup'}
  />
);
