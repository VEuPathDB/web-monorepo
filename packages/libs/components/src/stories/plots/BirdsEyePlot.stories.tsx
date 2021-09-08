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
      value: 77,
      label: 'Has data for axis variables',
    },
    {
      value: 55,
      label: 'Has data for axis & stratification variables',
    },
  ],
  bars: [
    // total comes first, or the subset is hidden
    {
      name: 'Total',
      value: [200],
      label: [''],
      color: gray,
    },
    {
      name: 'Subset',
      value: [123],
      label: [''],
      color: red,
    },
  ],
};

// We don't need to set the height here
// (the BirdsEyePlot component hardcodes it for you)
const containerStyles: CSSProperties = {
  width: '500px',
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
};

export const EmptyLoading = Template.bind({});
EmptyLoading.args = {
  showSpinner: true,
  containerStyles,
};
