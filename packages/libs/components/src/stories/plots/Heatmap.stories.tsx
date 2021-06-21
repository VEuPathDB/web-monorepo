import React from 'react';
import Heatmap, { HeatmapProps, EmptyHeatmapData } from '../../plots/Heatmap';
import { Meta, Story } from '@storybook/react';

export default {
  title: 'Plots/Heatmap',
  component: Heatmap,
  parameters: {
    redmine: 'https://redmine.apidb.org/issues/42052',
  },
} as Meta;

const Template: Story<HeatmapProps> = (args) => <Heatmap {...args} />;

export const NumericAxes = Template.bind({});
NumericAxes.args = {
  data: {
    xLabels: [1, 2, 3, 4],
    yLabels: [1, 2, 3],
    values: [
      [1, 20, 40, 30],
      [20, 0, 60, 15],
      [30, 60, 0, 50],
    ],
  },
  xAxisLabel: 'Number of pets',
  yAxisLabel: 'Number of children',
  showValues: false,
  title: 'Numeric heatmap',
  legendTitle: 'Count of households',
};

export const CategoricalAxes = Template.bind({});
CategoricalAxes.args = {
  data: {
    xLabels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    yLabels: ['Morning', 'Afternoon', 'Evening'],
    values: [
      [17, 10, 33, 58, 8],
      [20, 5, 63, 82, 30],
      [39, 67, 11, -5, 20],
    ],
  },
  showValues: true,
  title: 'Categorical heatmap',
  legendTitle: 'Temperature',
};

export const Empty = Template.bind({});
Empty.args = {
  data: EmptyHeatmapData,
  showSpinner: false,
};

export const EmptyLoading = Template.bind({});
EmptyLoading.args = {
  data: EmptyHeatmapData,
  showSpinner: true,
};
