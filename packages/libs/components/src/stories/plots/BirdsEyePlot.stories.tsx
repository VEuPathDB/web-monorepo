import { Story, Meta } from '@storybook/react/types-6-0';
import BirdsEyePlot, { BirdsEyePlotProps } from '../../plots/BirdsEyePlot';
import { BirdsEyePlotData } from '../../types/plots';

export default {
  title: 'Plots/Birds-Eye',
  component: BirdsEyePlot,
} as Meta;

const dataSet: BirdsEyePlotData = {
  brackets: [
    {
      value: 77,
      label: 'Complete for x & y',
    },
    {
      value: 55,
      label: 'Complete for x, y, & strata',
    },
  ],
  bars: [
    {
      name: 'total',
      value: [200],
      label: [''],
      color: 'gray',
    },
    {
      name: 'subset',
      value: [123],
      label: [''],
      color: 'red',
    },
  ],
};

const containerStyles = {
  height: '250px',
  width: '500px',
  border: '2px solid yellow',
};

const Template: Story<BirdsEyePlotProps> = (args: any) => (
  <BirdsEyePlot {...args} />
);
export const Basic = Template.bind({});
Basic.args = {
  data: dataSet,
  interactive: true,
  dependentAxisLabel: 'Mermaids',
  containerStyles,
};

export const EmptyLoading = Template.bind({});
EmptyLoading.args = {
  showSpinner: true,
  containerStyles,
};
