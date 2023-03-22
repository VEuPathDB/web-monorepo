import { Story, Meta } from '@storybook/react/types-6-0';
import { CSSProperties } from 'react';
import BirdsEyePlot, { BirdsEyePlotProps } from '../../plots/BirdsEyePlot';
import { BirdsEyePlotData } from '../../types/plots';

export default {
  title: 'Plots/Birds-Eye',
  component: BirdsEyePlot,
} as Meta;

const red = '#da7272';
const gray = '#aaaaaa';

const dataSet: BirdsEyePlotData = {
  brackets: [
    {
      label: 'Data for axes',
      value: 12031,
    },
    {
      label: 'Data for axes & strata',
      value: 9023,
    },
  ],
  bars: [
    // total comes first, or the subset is hidden
    {
      label: 'Total',
      value: 25873,
      color: gray,
    },
    {
      label: 'Subset',
      value: 20847,
      color: red,
    },
  ],
};

// We don't need to set the height here
// (the BirdsEyePlot component hardcodes it for you)
const containerStyles: CSSProperties = {
  width: '400px',
  height: '110px',
  border: '2px solid yellow', // obviously just for demo purposes
};

const spacingOptions = {
  marginTop: 5,
  marginBottom: 5,
  marginLeft: 5,
  marginRight: 5,
};

const Template: Story<BirdsEyePlotProps> = (args: any) => (
  <BirdsEyePlot {...args} />
);
export const Basic = Template.bind({});
Basic.args = {
  data: dataSet,
  dependentAxisLabel: 'Mermaids',
  containerStyles,
  spacingOptions,
  interactive: true,
};

const dataSetBig: BirdsEyePlotData = {
  brackets: [
    {
      label: 'Data for axes',
      value: 1203792,
    },
    {
      label: 'Data for axes & strata',
      value: 902393,
    },
  ],
  bars: [
    // total comes first, or the subset is hidden
    {
      label: 'Total',
      value: 2587374,
      color: gray,
    },
    {
      label: 'Subset',
      value: 2084765,
      color: red,
    },
  ],
};

export const BigNumbers = Template.bind({});
BigNumbers.args = {
  data: dataSetBig,
  dependentAxisLabel: 'Ants',
  containerStyles,
  spacingOptions,
  interactive: true,
};

const dataSetProblem: BirdsEyePlotData = {
  brackets: [
    {
      label: 'Data for axes',
      value: 4372,
    },
    {
      label: 'Data for axes & strata',
      value: 3393,
    },
  ],
  bars: [
    // total comes first, or the subset is hidden
    {
      label: 'Total',
      value: 40374,
      color: gray,
    },
    {
      label: 'Subset',
      value: 10765,
      color: red,
    },
  ],
};

const wideContainerStyles: CSSProperties = {
  width: '450px',
  height: '110px',
  border: '2px solid yellow', // obviously just for demo purposes
};

const wideSpacingOptions = {
  marginTop: 5,
  marginBottom: 5,
  marginLeft: 5,
  marginRight: 50,
};

export const ProblemPopup = Template.bind({});
ProblemPopup.args = {
  data: dataSetProblem,
  dependentAxisLabel: 'Foxes',
  containerStyles,
  spacingOptions,
  interactive: true,
};

export const ProblemPopupSolvedWithMargin = Template.bind({});
ProblemPopupSolvedWithMargin.args = {
  data: dataSetProblem,
  dependentAxisLabel: 'Foxes',
  containerStyles: wideContainerStyles,
  spacingOptions: wideSpacingOptions,
  interactive: true,
};

const dataSetOneBracket: BirdsEyePlotData = {
  brackets: [
    {
      label: 'Data for axes',
      value: 12031,
    },
  ],
  bars: [
    // total comes first, or the subset is hidden
    {
      label: 'Total',
      value: 25873,
      color: gray,
    },
    {
      label: 'Subset',
      value: 20847,
      color: red,
    },
  ],
};

export const OneBracket = Template.bind({});
OneBracket.args = {
  data: dataSetOneBracket,
  dependentAxisLabel: 'Earlobes',
  containerStyles,
  spacingOptions,
  interactive: true,
};

export const EmptyLoading = Template.bind({});
EmptyLoading.args = {
  showSpinner: true,
  containerStyles,
};
