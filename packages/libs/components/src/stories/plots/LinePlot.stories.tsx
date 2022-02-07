import { Story, Meta } from '@storybook/react/types-6-0';
import LinePlot, { LinePlotProps } from '../../plots/LinePlot';
import { FacetedData, LinePlotData } from '../../types/plots';
import FacetedLinePlot from '../../plots/facetedPlots/FacetedLinePlot';

export default {
  title: 'Plots/LinePlot',
  component: LinePlot,
} as Meta;

const dataSet = {
  series: [
    {
      x: [0, 2, 5, 8, 12],
      y: [4, 8, 3, 12, 11],
      name: 'Cats',
    },
    {
      x: [0, 2, 5, 8, 12],
      y: [6, 11, 4, 10, 13],
      name: 'Dogs',
    },
  ],
};

const errorBarData = {
  series: [
    {
      ...dataSet.series[0],
      yErrorBarUpper: [5, 9, 5, 14, 12.5],
      yErrorBarLower: [3, 6, 1, 10, 9.5],
    },
    {
      ...dataSet.series[1],
      yErrorBarUpper: [7, 12, 6, 12, 14.5],
      yErrorBarLower: [5, 10, 2, 8, 11.5],
    },
  ],
};

const Template: Story<LinePlotProps> = (args) => <LinePlot {...args} />;
export const Basic = Template.bind({});
Basic.args = {
  data: dataSet,
  dependentAxisLabel: 'Awesomeness',
  independentAxisLabel: 'Age',
  legendTitle: 'Animal',
  title: 'Awesomeness of animals',
};

export const ErrorBars = Template.bind({});
ErrorBars.args = {
  data: errorBarData,
  dependentAxisLabel: 'Awesomeness with error bars',
  independentAxisLabel: 'Age',
  legendTitle: 'Animal',
  title: 'Awesomeness of animals',
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
  title: 'Awesomeness of animals',
};

/**
 * FACETING
 */

const facetedData: FacetedData<LinePlotData> = {
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
      label: 'space',
      data: dataSet,
    },
    {
      label: 'volcano',
      data: dataSet,
    },
    {
      label: 'underwater',
      data: dataSet,
    },
    {
      label: 'imaginary',
    },
    {
      label: 'No data',
    },
  ],
};

interface FacetedStoryProps {
  data: FacetedData<LinePlotData>;
  componentProps: LinePlotProps;
  modalComponentProps: LinePlotProps;
}

const FacetedTemplate: Story<FacetedStoryProps> = ({
  data,
  componentProps,
  modalComponentProps,
}) => (
  <FacetedLinePlot
    data={data}
    componentProps={componentProps}
    modalComponentProps={modalComponentProps}
  />
);

export const Faceted = FacetedTemplate.bind({});
Faceted.args = {
  data: facetedData,
  componentProps: {
    title: 'indoor and outdoor pets',
    containerStyles: {
      width: 300,
      height: 300,
      border: '1px solid #dadada',
    },
  },
  modalComponentProps: {
    containerStyles: {
      width: '85%',
      height: '100%',
      margin: 'auto',
    },
  },
};
