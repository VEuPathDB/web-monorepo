import React from 'react';
import { Meta, Story } from '@storybook/react';
import MosaicPlot, { MosaicPlotProps } from '../../plots/MosaicPlot';
import { FacetedData, MosaicPlotData } from '../../types/plots';
import FacetedMosaicPlot from '../../plots/facetedPlots/FacetedMosaicPlot';

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

const tenByTwelveData = {
  values: [
    [84, 97, 78, 24, 100, 55, 74, 62, 4, 5],
    [90, 45, 72, 48, 7, 56, 70, 88, 1, 68],
    [23, 42, 15, 39, 33, 16, 15, 90, 5, 51],
    [7, 87, 30, 61, 32, 73, 48, 100, 6, 53],
    [99, 92, 61, 97, 9, 85, 2, 45, 77, 16],
    [26, 41, 20, 39, 11, 34, 32, 4, 72, 67],
    [77, 71, 93, 45, 10, 20, 62, 93, 90, 79],
    [60, 82, 93, 27, 8, 23, 75, 15, 84, 57],
    [21, 36, 3, 89, 78, 98, 64, 31, 59, 57],
    [4, 41, 71, 97, 84, 46, 40, 96, 1, 9],
    [44, 40, 99, 87, 19, 70, 67, 65, 27, 84],
    [70, 28, 2, 83, 43, 83, 43, 19, 55, 50],
  ],
  independentLabels: [
    '2010',
    '2011',
    '2012',
    '2013',
    '2014',
    '2015',
    '2016',
    '2017',
    '2018',
    '2019',
  ],
  dependentLabels: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
};

export const TenByTwelve = Template.bind({});
TenByTwelve.args = {
  ...defaults,
  data: tenByTwelveData,
  independentAxisLabel: 'Year',
  dependentAxisLabel: 'Month',
  interactive: true,
  containerStyles: {
    height: 750,
    width: 750,
  },
};

const realData = {
  values: [
    [771, 794, 635, 820, 411, 589, 517],
    [769, 587, 726, 818, 376, 605, 522],
    [759, 795, 826, 820, 385, 722, 520],
    [787, 714, 496, 820, 402, 560, 521],
    [773, 692, 676, 819, 395, 620, 518],
  ],
  independentLabels: [
    'Bangladesh',
    'India',
    'Kenya',
    'Mali',
    'Mozambique',
    'Pakistan',
    'The Gambia',
  ],
  dependentLabels: ['0', '1', '2', '3', '4'],
  pValue: 5.5703e-15,
  degreesFreedom: 24,
  chisq: 121.3516,
  completeCases: [
    {
      variableDetails: { variableId: 'ENVO_00000009', entityId: 'PCO_0000024' },
      completeCases: 22567,
    },
    {
      variableDetails: {
        variableId: 'EUPATH_0000143',
        entityId: 'PCO_0000024',
      },
      completeCases: 22560,
    },
  ],
  completeCasesAllVars: 22560,
  completeCasesAxesVars: 22560,
};

export const RealData = Template.bind({});
RealData.args = {
  ...defaults,
  data: realData,
  independentAxisLabel: 'Country',
  dependentAxisLabel: 'Household wealth index, categorical',
  interactive: true,
  containerStyles: {
    width: 750,
    height: 450,
    marginLeft: '0.75rem',
    border: '1px solid #dedede',
    boxShadow: '1px 1px 4px #00000066',
  },
  displayLibraryControls: false,
  showSpinner: false,
  displayLegend: false,
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

const facetedData: FacetedData<MosaicPlotData> = {
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
  data: FacetedData<MosaicPlotData>;
  componentProps: MosaicPlotProps;
  modalComponentProps: MosaicPlotProps;
}

const FacetedTemplate: Story<FacetedStoryProps> = ({
  data,
  componentProps,
  modalComponentProps,
}) => (
  <FacetedMosaicPlot
    data={data}
    componentProps={componentProps}
    modalComponentProps={modalComponentProps}
  />
);

export const Faceted = FacetedTemplate.bind({});
Faceted.args = {
  data: facetedData,
  componentProps: {
    title: 'Atmospheric makeup of planets over time',
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

// test long axis label for both X and Y axes
export const TwoByTwoLongAxisLabel = Template.bind({});
TwoByTwoLongAxisLabel.args = {
  ...defaults,
  data: {
    values: [
      [40, 15],
      [10, 25],
    ],
    independentLabels: ['Men', 'Women'],
    dependentLabels: ['Died', 'Survived'],
  },
  independentAxisLabel:
    'Weight-for-length or -height z-score, using median weight and median length or height',
  dependentAxisLabel: 'Diarrhea case during the last 7 days, caregiver report',
  colors: ['orange', 'blue'],
};
