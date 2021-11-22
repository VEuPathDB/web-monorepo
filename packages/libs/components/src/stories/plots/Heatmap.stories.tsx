import React from 'react';
import Heatmap, { HeatmapProps } from '../../plots/Heatmap';
import { Meta, Story } from '@storybook/react';
import { FacetedData, HeatmapData } from '../../types/plots';
import FacetedPlot from '../../plots/FacetedPlot';

export default {
  title: 'Plots/Heatmap',
  component: Heatmap,
  parameters: {
    redmine: 'https://redmine.apidb.org/issues/42052',
  },
} as Meta;

const Template: Story<HeatmapProps> = (args) => <Heatmap {...args} />;

const numericData = {
  xLabels: [1, 2, 3, 4],
  yLabels: [1, 2, 3],
  values: [
    [1, 20, 40, 30],
    [20, 0, 60, 15],
    [30, 60, 0, 50],
  ],
};

export const NumericAxes = Template.bind({});
NumericAxes.args = {
  data: numericData,
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
  showSpinner: false,
};

export const EmptyLoading = Template.bind({});
EmptyLoading.args = {
  showSpinner: true,
};

/**
 * FACETING
 */

const facetedData: FacetedData<HeatmapData> = {
  facets: [
    {
      label: 'Kenya',
      data: numericData,
    },
    {
      label: 'Zimbabwe',
      data: numericData,
    },
    {
      label: 'South Africa',
      data: numericData,
    },
    {
      label: 'Wakanda',
    },
    {
      label: 'No data',
    },
  ],
};

interface FacetedStoryProps {
  data: FacetedData<HeatmapData>;
  props: HeatmapProps;
}

const FacetedTemplate: Story<FacetedStoryProps> = ({ data, props }) => (
  <FacetedPlot<HeatmapData, HeatmapProps>
    data={data}
    component={Heatmap}
    props={props}
  />
);

export const Faceted = FacetedTemplate.bind({});
Faceted.args = {
  data: facetedData,
  props: {
    title: 'Number of children vs Number of pets (faceted)',
    containerStyles: {
      width: 300,
      height: 300,
      border: '1px solid #dadada',
    },
  },
};
