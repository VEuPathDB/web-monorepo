import { Story, Meta } from '@storybook/react/types-6-0';
import Barplot, { BarplotProps } from '../../plots/Barplot';

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

const Template: Story<BarplotProps> = (args: any) => <Barplot {...args} />;
export const Basic = Template.bind({});
Basic.args = {
  data: dataSet,
  dependentAxisLabel: 'Awesomeness',
  independentAxisLabel: 'Animal',
  legendTitle: 'Domesticated',
  opacity: 0.75,
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
