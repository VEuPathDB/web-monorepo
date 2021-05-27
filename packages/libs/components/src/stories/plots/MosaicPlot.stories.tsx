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
    independentValues={['Men', 'Women']}
    dependentValues={['Died', 'Survived']}
    independentLabel={'Sex'}
    dependentLabel={'Status'}
    colors={['orange', 'blue']}
    title="Sex & Status Mosaic"
    titleSize={20}
  />
);

export const TwoByThree = () => (
  <MosaicPlot
    data={[
      [45, 15, 20],
      [10, 45, 20],
    ]}
    independentValues={['Rabbit', 'Cat', 'Dog']}
    dependentValues={['Positive', 'Negative']}
    independentLabel={'Animal'}
    dependentLabel={'Rabies'}
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
    independentValues={['Mercury', 'Venus', 'Mars']}
    dependentValues={['Nitrogen', 'Oxygen', 'Hydrogen', 'Other']}
    independentLabel={'Planet'}
    dependentLabel={'Atmospheric Makeup'}
  />
);

export const EmptyData = () => (
  <MosaicPlot
    data={[[]]}
    independentValues={[]}
    dependentValues={[]}
    independentLabel={''}
    dependentLabel={''}
  />
);
