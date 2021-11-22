import React from 'react';
import { Meta, Story } from '@storybook/react';
import MosaicPlot, { MosaicPlotProps } from '../../plots/MosaicPlot';
import { FacetedData, MosaicData } from '../../types/plots';
import FacetedPlot from '../../plots/FacetedPlot';

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
  showColumnLabels: false,
  displayLegend: false,
};

const fourByThreeData = {
  values: [
    [52, 15, 35],
    [15, 40, 50],
    [20, 15, 7],
    [22, 30, 10],
  ],
  independentLabels: ['Mercury', 'Venus', 'Mars'],
  dependentLabels: ['Nitrogen', 'Oxygen', 'Hydrogen', 'Other'],
};

export const FourByThree = Template.bind({});
FourByThree.args = {
  ...defaults,
  data: fourByThreeData,
  independentAxisLabel: 'Planet',
  dependentAxisLabel: 'Atmospheric makeup',
  interactive: true,
};

export const EmptyData = Template.bind({});
EmptyData.args = {};

export const EmptyDataLoading = Template.bind({});
EmptyDataLoading.args = {
  showSpinner: true,
};

/**
 * FACETING
 */

const facetedData: FacetedData<MosaicData> = {
  facets: [
    {
      label: '10 bya',
    },
    {
      label: '4.5 bya',
      data: fourByThreeData,
    },
    {
      label: '2 bya',
      data: fourByThreeData,
    },
    {
      label: 'Today',
      data: fourByThreeData,
    },
    {
      label: 'No data',
    },
  ],
};

interface FacetedStoryProps {
  data: FacetedData<MosaicData>;
  props: MosaicPlotProps;
}

const FacetedTemplate: Story<FacetedStoryProps> = ({ data, props }) => (
  <FacetedPlot<MosaicData, MosaicPlotProps>
    data={data}
    component={MosaicPlot}
    props={props}
  />
);

export const Faceted = FacetedTemplate.bind({});
Faceted.args = {
  data: facetedData,
  props: {
    title: 'Atmospheric makeup of planets over time',
    containerStyles: {
      width: 300,
      height: 300,
      border: '1px solid #dadada',
    },
  },
};
