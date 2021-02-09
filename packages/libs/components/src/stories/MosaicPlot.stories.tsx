import React from 'react';
import MosaicPlot from '../plots/MosaicPlot';

export default {
  title: 'MosaicPlot',
  component: MosaicPlot,
};

export const TwoByTwo = () => (
  <MosaicPlot
    data={[
      [40, 15],
      [10, 35],
    ]}
    exposureValues={['Men', 'Women']}
    outcomeValues={['Died', 'Survived']}
    exposureLabel={'Sex'}
    outcomeLabel={'Status'}
    widths={[40, 10]}
    colors={['orange', 'blue']}
  />
);

export const TwoByThree = () => (
  <MosaicPlot
    data={[
      [40, 15, 30],
      [10, 35, 20],
    ]}
    exposureValues={['Rabbit', 'Cat', 'Dog']}
    outcomeValues={['Positive', 'Negative']}
    exposureLabel={'Animal'}
    outcomeLabel={'Rabies'}
    widths={[40, 10, 25]}
    width={400}
    height={300}
    showLegend={false}
    showModebar={false}
  />
);

export const FourByThree = () => (
  <MosaicPlot
    data={[
      [50, 15, 35],
      [10, 40, 50],
      [20, 15, 5],
      [20, 30, 10],
    ]}
    exposureValues={['Mercury', 'Venus', 'Mars']}
    outcomeValues={['Nitrogen', 'Oxygen', 'Hydrogen', 'Other']}
    exposureLabel={'Planet'}
    outcomeLabel={'Atmospheric Makeup (%)'}
    widths={[10, 40, 50]}
  />
);
