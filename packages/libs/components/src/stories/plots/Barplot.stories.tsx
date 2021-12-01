import { Story, Meta } from '@storybook/react/types-6-0';
import Barplot, { BarplotProps } from '../../plots/Barplot';
import { FacetedData, BarplotData } from '../../types/plots';
import FacetedPlot from '../../plots/FacetedPlot';

export default {
  title: 'Plots/Barplot',
  component: Barplot,
} as Meta;

const dataSet = {
  series: [
    {
      label: ['dogs', 'cats', 'monkeys'],
      value: [20, 14, 23],
      name: 'Yes',
    },
    {
      label: ['dogs', 'cats', 'monkeys'],
      value: [12, 18, 29],
      name: 'No',
    },
  ],
};

const Template: Story<BarplotProps> = (args) => <Barplot {...args} />;
export const Basic = Template.bind({});
Basic.args = {
  data: dataSet,
  dependentAxisLabel: 'Awesomeness',
  independentAxisLabel: 'Animal',
  legendTitle: 'Domesticated',
  opacity: 0.75,
  title: 'Awesomeness of animals stratified by domestication',
};

export const EmptyData = Template.bind({});
EmptyData.args = {
  dependentAxisLabel: 'Dependent axis label',
  independentAxisLabel: 'Independent axis label',
};

export const EmptyDataLoading = Template.bind({});
EmptyDataLoading.args = {
  dependentAxisLabel: 'Dependent axis label',
  independentAxisLabel: 'Independent axis label',
  showSpinner: true,
};

export const NoDataOverlay = Template.bind({});
NoDataOverlay.args = {
  dependentAxisLabel: 'Dependent axis label',
  independentAxisLabel: 'Independent axis label',
  showNoDataOverlay: true,
  title: 'Awesomeness of animals stratified by domestication',
};

/**
 * FACETING
 */

const facetedData: FacetedData<BarplotData> = {
  facets: [
    {
      label: 'indoors',
      data: dataSet,
    },
    {
      label: 'outdoors',
      data: dataSet,
    },
    {
      label: 'indoors',
      data: dataSet,
    },
    {
      label: 'outdoors',
      data: dataSet,
    },
    {
      label: 'indoors',
      data: dataSet,
    },
    {
      label: 'outdoors',
    },
    {
      label: 'No data',
    },
  ],
};

interface FacetedStoryProps {
  data: FacetedData<BarplotData>;
  props: BarplotProps;
  modalProps: BarplotProps;
}

const FacetedTemplate: Story<FacetedStoryProps> = ({
  data,
  props,
  modalProps,
}) => (
  <FacetedPlot<BarplotData, BarplotProps>
    data={data}
    component={Barplot}
    props={props}
    modalProps={modalProps}
  />
);

export const Faceted = FacetedTemplate.bind({});
Faceted.args = {
  data: facetedData,
  props: {
    title: 'indoor and outdoor pets',
    containerStyles: {
      width: 300,
      height: 300,
      border: '1px solid #dadada',
    },
  },
  modalProps: {
    containerStyles: {
      width: 600,
      height: 400,
    },
  },
};
