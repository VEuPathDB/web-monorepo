import { Story, Meta } from '@storybook/react/types-6-0';
import Barplot from '../../plots/Barplot';

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

// set initial props
const plotWidth = 1000;
const plotHeight = 600;
// let plotWidth = 350;
// let plotHeight = 250;
const plotTitle = 'Barplot';
const orientation = 'vertical';
const barLayout = 'overlay';

export const Basic = () => {
  return (
    <Barplot
      data={dataSet}
      width={plotWidth}
      height={plotHeight}
      // title={plotTitle}
      orientation={orientation}
      // check this option later
      barLayout={barLayout}
      independentAxisLabel={'Independent axis name'}
      dependentAxisLabel={'Dependent axis name'}
      // show/hide independent/dependent axis tick label
      showIndependentAxisTickLabel={true}
      showDependentAxisTickLabel={true}
      staticPlot={false}
      displayLegend={true}
      displayLibraryControls={true}
      // margin={{l: 50, r: 10, b: 20, t: 10}}
    />
  );
};

export const EmptyData = () => {
  return (
    <Barplot
      data={{ series: [] }}
      width={plotWidth}
      height={plotHeight}
      // title={plotTitle}
      orientation={orientation}
      // check this option later
      barLayout={barLayout}
      independentAxisLabel={'Independent axis name'}
      dependentAxisLabel={'Dependent axis name'}
      staticPlot={false}
      displayLegend={true}
      displayLibraryControls={true}
      // margin={{l: 50, r: 10, b: 20, t: 10}}
    />
  );
};

// adding storybook control
const Template = (args: any) => <Barplot {...args} />;
export const WithStorybookControl: Story<any> = Template.bind({});

// set default values for args that use default storybook control
WithStorybookControl.args = {
  data: dataSet,
  width: plotWidth,
  height: plotHeight,
  orientation: orientation,
  barLayout: barLayout,
  independentAxisLabel: 'Independent axis name',
  dependentAxisLabel: 'Dependent axis name',
};
