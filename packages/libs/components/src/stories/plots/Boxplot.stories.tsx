import React from 'react';
import { Meta, Story } from '@storybook/react';
import Boxplot, { BoxplotProps } from '../../plots/Boxplot';
import { FacetedData, BoxplotData } from '../../types/plots';
import FacetedBoxplot from '../../plots/facetedPlots/FacetedBoxplot';

export default {
  title: 'Plots/Boxplot',
  component: Boxplot,
  argTypes: {
    opacity: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.1,
      },
    },
  },
} as Meta;

// using partial dataset from GEMSCC0002-1; X: Floor material; Y: Sleeping rooms in dwelling; Overlay: Country
const singleData = {
  series: [
    {
      lowerfence: [1, 1, 5, 1, 1],
      upperfence: [7, 6, 5, 1, 6],
      median: [3, 4, 5, 1, 2],
      mean: [3.0877, 3.6, 5, 1, 2.1914],
      boxmean: true,
      q1: [2, 2, 5, 1, 1],
      q3: [4, 5, 5, 1, 3],
      name: 'Bangladesh',
      label: [
        'Finished floor; cement',
        'Finished floor; ceramic tile',
        'Finished floor; vinyl of asphalt strips',
        'Natural floor; dung',
        'Natural floor; earth/sand',
      ],
      outliers: [
        [8, 8, 8, 8, 8, 8, 10, 8, 9, 10, 10, 8, 10],
        [],
        [],
        [],
        [7, 7, 8, 7, 7, 9, 7, 7, 7, 7, 7, 8, 7, 7, 8, 7, 8, 8, 7, 7, 7, 8, 9],
      ],
    },
  ],
};

const multipleData = {
  series: [
    {
      lowerfence: [1, 1, 5, 1, 1],
      upperfence: [7, 6, 5, 1, 6],
      median: [3, 4, 5, 1, 2],
      mean: [3.0877, 3.6, 5, 1, 2.1914],
      q1: [2, 2, 5, 1, 1],
      q3: [4, 5, 5, 1, 3],
      name: 'Bangladesh',
      label: [
        'Finished floor; cement',
        'Finished floor; ceramic tile',
        'Finished floor; vinyl of asphalt strips',
        'Natural floor; dung',
        'Natural floor; earth/sand',
      ],
      outliers: [
        [8, 8, 8, 8, 8, 8, 10, 8, 9, 10, 10, 8, 10],
        [],
        [],
        [],
        [7, 7, 8, 7, 7, 9, 7, 7, 7, 7, 7, 8, 7, 7, 8, 7, 8, 8, 7, 7, 7, 8, 9],
      ],
    },
    {
      lowerfence: [1, 1, 1, 1, 1, 4, 1],
      upperfence: [3, 5, 1, 3, 5, 4, 1],
      median: [1, 2, 1, 1, 2, 4, 1],
      mean: [1.57, 2.1111, 1, 1.3145, 2.3571, 4, 1],
      q1: [1, 1, 1, 1, 1, 4, 1],
      q3: [2, 3, 1, 2, 3.75, 4, 1],
      name: 'India',
      boxpoints: 'outliers',
      label: [
        'Finished floor; cement',
        'Finished floor; ceramic tile',
        'Finished floor; vinyl of asphalt strips',
        'Natural floor; earth/sand',
        'Other, specify',
        'Rudimentary floor; palm/bamboo',
        'Rudimentary floor; wood planks',
      ],
      outliers: [
        [
          4,
          4,
          4,
          5,
          4,
          7,
          4,
          4,
          6,
          6,
          4,
          5,
          4,
          4,
          5,
          5,
          4,
          4,
          4,
          5,
          9,
          4,
          4,
          4,
          4,
        ],
        [],
        [],
        [4, 4],
        [],
        [],
        [],
      ],
    },
    {
      lowerfence: [1, 1, 2, 1, 1, 1],
      upperfence: [2, 3, 2, 1, 3, 3],
      q1: [1, 1, 2, 1, 1, 1],
      q3: [1.5, 2, 2, 1, 2, 2],
      median: [1, 2, 2, 1, 1, 1],
      mean: [1.2857, 1.7223, 2, 1, 1.5342, 1.5131],
      name: 'Kenya',
      label: [
        'Finished floor; carpet',
        'Finished floor; cement',
        'Finished floor; ceramic tile',
        'Finished floor; vinyl of asphalt strips',
        'Natural floor; dung',
        'Natural floor; earth/sand',
      ],
      outliers: [
        [],
        [5, 5, 5, 4, 4, 4, 5, 4, 5, 4, 4, 6, 4, 5, 4, 4, 4],
        [],
        [],
        [4, 4, 4, 4, 21, 4, 5, 4, 4],
        [8, 4, 4, 5, 4, 4, 4, 4, 4],
      ],
    },
  ],
};

// X: breastfed; Y: enrollment year data
// I think the enrollment year's type should be date (classified as number in data though)
const yearData = {
  series: [
    {
      lowerfence: [2007, 2007, 2007],
      upperfence: [2011, 2011, 2011],
      q1: [2008, 2008, 2008],
      q3: [2010, 2010, 2010],
      median: [2009, 2009, 2009],
      mean: [2008.8639, 2009.0816, 2009.0021],
      name: 'Data',
      label: ['Exclusively breastfed', 'Not breastfed', 'Partially breastfed'],
      outliers: [[], [], []],
    },
  ],
};

// set initial props
const plotWidth = '100%';
const plotHeight = 450;
// let plotWidth = 350;
// let plotHeight = 250;
const plotTitle = 'Boxplot examples';
const orientation = 'vertical';

export const singleDataset = () => {
  return (
    <Boxplot
      data={singleData.series}
      // width/height props are replaced with containerStyles
      containerStyles={{
        width: plotWidth,
        height: plotHeight,
      }}
      title={plotTitle}
      orientation={orientation}
      independentAxisLabel={'Floor material'}
      dependentAxisLabel={'Sleeping rooms in dwelling'}
      // show/hide independent/dependent axis tick label
      showIndependentAxisTickLabel={true}
      showDependentAxisTickLabel={true}
      showMean={true}
      // staticPlot is changed to interactive
      interactive={true}
      displayLegend={singleData.series.length > 1}
      displayLibraryControls={false}
    />
  );
};

export const multipleDataset = () => {
  return (
    <Boxplot
      data={multipleData.series}
      // width/height props are replaced with containerStyles
      containerStyles={{
        width: plotWidth,
        height: plotHeight,
      }}
      title={plotTitle}
      orientation={orientation}
      independentAxisLabel={'Floor material'}
      dependentAxisLabel={'Sleeping rooms in dwelling'}
      // show/hide independent/dependent axis tick label
      showIndependentAxisTickLabel={true}
      showDependentAxisTickLabel={true}
      showMean={true}
      // staticPlot is changed to interactive
      interactive={true}
      displayLegend={multipleData.series.length > 1}
      displayLibraryControls={false}
    />
  );
};

export const yearDataset = () => {
  return (
    <Boxplot
      data={yearData.series}
      // width height is replaced with containerStyles
      containerStyles={{
        width: plotWidth,
        height: plotHeight,
      }}
      title={plotTitle}
      orientation={orientation}
      independentAxisLabel={'Breastfed'}
      dependentAxisLabel={'Enrollment year'}
      // show/hide independent/dependent axis tick label
      showIndependentAxisTickLabel={true}
      showDependentAxisTickLabel={true}
      showMean={true}
      // staticPlot is changed to interactive
      interactive={true}
      displayLegend={multipleData.series.length > 1}
      displayLibraryControls={false}
      // margin is replaced with spacingOptions
      spacingOptions={{
        marginTop: 100,
        marginRight: 100,
        marginBottom: 100,
        marginLeft: 100,
      }}
      legendTitle={'Legend title example'}
      // this will be like findVariable(vizConfig.yAxisVariable)?.type at viz
      dependentValueType={'date'}
    />
  );
};

const Template = (args: any) => <Boxplot {...args} />;

export const EmptyLoading: Story<BoxplotProps> = Template.bind({});
EmptyLoading.argTypes = storyArgTypes(
  (EmptyLoading.args = {
    showSpinner: true,
    containerStyles: {
      width: '600px',
      height: '400px',
    },
  })
);

// adding storybook control
export const WithStorybookControl: Story<any> = Template.bind({});

// set default values for args that use default storybook control
WithStorybookControl.argTypes = storyArgTypes(
  (WithStorybookControl.args = {
    data: singleData.series,
    // width: plotWidth,
    // height: plotHeight,
    orientation: orientation,
    showMean: true,
    interactive: true,
    displayLegend: true,
    displayLibraryControls: true,
    showSpinner: false,
    legendTitle: 'Legend title example',
    independentAxisLabel: 'Floor material',
    dependentAxisLabel: 'Sleeping rooms in dwelling',
    showIndependentAxisTickLabel: true,
    showDependentAxisTickLabel: true,
    containerStyles: {
      width: plotWidth,
      height: plotHeight,
    },
  })
);

const emptyCategoryData = {
  series: [
    {
      lowerfence: [undefined, 1, undefined, 1, 1],
      upperfence: [undefined, 6, undefined, 1, 6],
      median: [undefined, 4, undefined, 1, 2],
      mean: [undefined, 3.6, undefined, 1, 2.1914],
      boxmean: true,
      q1: [undefined, 2, undefined, 1, 1],
      q3: [undefined, 5, undefined, 1, 3],
      name: 'Bangladesh',
      label: [
        'Finished floor; cement',
        'Finished floor; ceramic tile',
        'Finished floor; vinyl of asphalt strips',
        'Natural floor; dung',
        'Natural floor; earth/sand',
      ],
      outliers: [
        [],
        [],
        [],
        [],
        [7, 7, 8, 7, 7, 9, 7, 7, 7, 7, 7, 8, 7, 7, 8, 7, 8, 8, 7, 7, 7, 8, 9],
      ],
    },
  ],
};

export const EmptyCategoryData: Story<any> = Template.bind({});
EmptyCategoryData.argTypes = storyArgTypes(
  (EmptyCategoryData.args = {
    data: emptyCategoryData.series,
    // width: plotWidth,
    // height: plotHeight,
    orientation: orientation,
    showMean: true,
    interactive: true,
    displayLegend: true,
    displayLibraryControls: true,
    showSpinner: false,
    legendTitle: 'Legend title example',
    independentAxisLabel: 'Floor material',
    dependentAxisLabel: 'Sleeping rooms in dwelling',
    showIndependentAxisTickLabel: true,
    showDependentAxisTickLabel: true,
    containerStyles: {
      width: plotWidth,
      height: plotHeight,
    },
  })
);

function storyArgTypes(args: any): any {
  if (args.data) {
    const pointTraceIndices = args.data
      .map((d: any, index: number) =>
        d.rawData || d.outliers.length ? index : -1
      )
      .filter((i: number) => i >= 0);
    return {
      // disable data control
      data: { control: { disable: true } },
      showRawData: {
        control: {
          disable:
            args.data.filter((d: any) => d.rawData && d.rawData.length)
              .length == 0,
        },
      },
      showMean: {
        control: {
          disable: args.data.filter((d: any) => d.mean != null).length == 0,
        },
      },
      opacity: {
        control: {
          disable: pointTraceIndices.length == 0,
        },
      },
      // no need to control dependentValueType
      dependentValueType: { control: { disable: true } },
    };
  }
}

/**
 * FACETING
 */

const facetedData: FacetedData<BoxplotData> = {
  facets: [
    {
      label: 'Low income',
      data: multipleData.series,
    },
    {
      label: 'Medium income',
      data: multipleData.series,
    },
    {
      label: 'High income',
      data: multipleData.series,
    },
    {
      label: 'Even higher income',
    },
    {
      label: 'No data',
    },
  ],
};

interface FacetedStoryProps {
  data: FacetedData<BoxplotData>;
  componentProps: BoxplotProps;
  modalComponentProps?: BoxplotProps;
}

const FacetedTemplate: Story<FacetedStoryProps> = ({
  data,
  componentProps,
  modalComponentProps,
}) => (
  <FacetedBoxplot
    data={data}
    componentProps={componentProps}
    modalComponentProps={modalComponentProps}
  />
);

export const Faceted = FacetedTemplate.bind({});
Faceted.args = {
  data: facetedData,
  componentProps: {
    title: 'Number of rooms (faceted)',
    containerStyles: {
      width: 300,
      height: 300,
      border: '1px solid #dadada',
    },
  },
};
