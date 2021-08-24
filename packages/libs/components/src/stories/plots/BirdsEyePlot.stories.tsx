import { Story, Meta } from '@storybook/react/types-6-0';
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
      color: gray,
    },
    {
      name: 'subset',
      value: [123],
      label: [''],
      color: red,
    },
  ],
};

const containerStyles = {
  height: '150px',
  width: '500px',
  border: '2px solid yellow',
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
  interactive: true,
  dependentAxisLabel: 'Mermaids',
  containerStyles,
  spacingOptions,
};

export const EmptyLoading = Template.bind({});
EmptyLoading.args = {
  showSpinner: true,
  containerStyles,
};
