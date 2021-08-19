import React from 'react';
import { Meta, Story } from '@storybook/react';
import MosaicPlot, { MosaicPlotProps } from '../../plots/MosaicPlot';

export default {
  title: 'Plots/Mosaic',
  component: MosaicPlot,
} as Meta;

const Template: Story<MosaicPlotProps> = (args) => <MosaicPlot {...args} />;

const defaults: Partial<MosaicPlotProps> = {
  showColumnLabels: true,
  displayLegend: true,
  interactive: false,
};

export const TwoByTwo = Template.bind({});
TwoByTwo.args = {
  ...defaults,
  data: {
    values: [
      [40, 15],
      [10, 25],
    ],
    independentLabels: ['Men', 'Women'],
    dependentLabels: ['Died', 'Survived'],
  },
  independentAxisLabel: 'Sex',
  dependentAxisLabel: 'Status',
  colors: ['orange', 'blue'],
  title: 'Sex & Status Mosaic',
};

export const TwoByThree = Template.bind({});
TwoByThree.args = {
  ...defaults,
  data: {
    values: [
      [45, 15, 20],
      [10, 45, 20],
    ],
    independentLabels: ['Rabbit', 'Cat', 'Dog'],
    dependentLabels: ['Positive', 'Negative'],
  },
  independentAxisLabel: 'Animal',
  dependentAxisLabel: 'Rabies',
  showColumnLabels: false,
  displayLegend: false,
};

export const FourByThree = Template.bind({});
FourByThree.args = {
  ...defaults,
  data: {
    values: [
      [52, 15, 35],
      [15, 40, 50],
      [20, 15, 7],
      [22, 30, 10],
    ],
    independentLabels: ['Mercury', 'Venus', 'Mars'],
    dependentLabels: ['Nitrogen', 'Oxygen', 'Hydrogen', 'Other'],
  },
  independentAxisLabel: 'Planet',
  dependentAxisLabel: 'Atmospheric makeup',
  title: 'Sex & Status Mosaic',
  interactive: true,
};

export const EmptyData = Template.bind({});
EmptyData.args = {};

export const EmptyDataLoading = Template.bind({});
EmptyDataLoading.args = {
  showSpinner: true,
};
