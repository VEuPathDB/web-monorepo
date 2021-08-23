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
      value: 55,
      label: 'Complete for x, y, & strata',
    },
    {
      value: 77,
      label: 'Complete for x & y',
    },
  ],
  bars: [
    {
      name: 'total',
      value: [200],
      label: [''],
    },
    {
      name: 'subset',
      value: [123],
      label: [''],
    },
  ],
};

const Template: Story<BirdsEyePlotProps> = (args: any) => (
  <BirdsEyePlot {...args} />
);
export const Basic = Template.bind({});
Basic.args = {
  data: dataSet,
};

export const EmptyLoading = Template.bind({});
EmptyLoading.args = {
  showSpinner: true,
};
