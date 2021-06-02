import { Meta, Story } from '@storybook/react';
import BoxplotEDA, { BoxplotProps } from '../../plots/BoxplotEDA';

export default {
  title: 'Plots/Boxplot EDA',
  component: BoxplotEDA,
} as Meta;

const x = [
  'day 1',
  'day 1',
  'day 1',
  'day 1',
  'day 1',
  'day 1',
  'day 2',
  'day 2',
  'day 2',
  'day 2',
  'day 2',
  'day 2',
  'day 1',
  'day 2',
  'day 1',
  'day 2',
];

const x1 = [
  'day 2',
  'day 1',
  'day 2',
  'day 1',
  'day 2',
  'day 1',
  'day 2',
  'day 1',
  'day 2',
  'day 1',
  'day 2',
  'day 1',
  'day 2',
  'day 1',
  'day 1',
  'day 2',
  'day 2',
  'day 1',
  'day 2',
  'day 1',
  'day 1',
  'day 2',
];

const catx = [
  'day 1',
  'day 1',
  'day 1',
  'day 1',
  'day 1',
  'day 1',
  'day 2',
  'day 2',
  'day 2',
  'day 2',
  'day 2',
  'day 2',
  'day 1',
  'day 2',
  'day 1',
  'day 2',
];

const dogx = [
  'day 2',
  'day 1',
  'day 2',
  'day 1',
  'day 2',
  'day 1',
  'day 2',
  'day 1',
  'day 2',
  'day 1',
  'day 2',
  'day 1',
  'day 2',
  'day 1',
  'day 1',
  'day 2',
  'day 2',
  'day 1',
  'day 2',
  'day 1',
  'day 1',
  'day 2',
];

const catRawData = [
  8,
  26,
  28,
  19,
  28,
  20,
  50,
  38,
  35,
  32,
  31,
  25,
  22,
  21,
  25,
  22,
];

const dogRawData = [
  20,
  60,
  61,
  77,
  72,
  50,
  61,
  80,
  88,
  120,
  130,
  131,
  129,
  67,
  77,
  87,
  66,
  69,
  74,
  56,
  68,
];

const trace1 = {
  // seriesY: [0.2, 0.2, 0.6, 1.0, 0.5, 0.4, 0.2, 0.7, 0.9, 0.1, 0.5, 0.3, 3, -3],
  // seriesX: x,
  seriesY: catRawData,
  seriesX: catx,
  overlayVariableDetails: {
    variableId: 'PCO_0000024.EUPATH_0015019',
    entityId: 'PCO_0000024',
    value: 'No',
  },
};

const trace2 = {
  // seriesY: [0.6, 0.7, 0.3, 0.6, 0.0, 0.5, 0.7, 0.9, 0.5, 0.8, 0.7, 0.2, 3, -3],
  // seriesX: x1,
  seriesY: dogRawData,
  seriesX: dogx,
  overlayVariableDetails: {
    variableId: 'PCO_0000024.EUPATH_0015019',
    entityId: 'PCO_0000024',
    value: 'Yes',
  },
};

const data3 = [trace1, trace2];

//DKDK set initial props
const plotWidth = 1000;
const plotHeight = 600;
// let plotWidth = 350;
// let plotHeight = 250;
const plotTitle = 'Barplot';
const orientation = 'vertical';
const pointsValue = 'outliers';

export const BasicGroup = () => {
  return (
    <BoxplotEDA
      data={data3}
      width={plotWidth}
      height={plotHeight}
      title={plotTitle}
      orientation={orientation}
      points={pointsValue}
      //DKDK check this option later
      independentAxisLabel={'Independent axis name'}
      dependentAxisLabel={'Dependent axis name'}
      // show/hide independent/dependent axis tick label
      showIndependentAxisTickLabel={true}
      showDependentAxisTickLabel={true}
      showMean={false}
      staticPlot={false}
      displayLegend={data3.length > 1}
      displayLibraryControls={false}
      // margin={{l: 50, r: 10, b: 20, t: 10}}
    />
  );
};

export const EmptyData = () => {
  return (
    <BoxplotEDA
      data={[]}
      width={plotWidth}
      height={plotHeight}
      title={plotTitle}
      orientation={orientation}
      // orientation={'horizontal'}
      // points={pointsValue}
      // points={'all'}
      //DKDK check this option later
      independentAxisLabel={'Independent axis name'}
      dependentAxisLabel={'Dependent axis name'}
      showMean={false}
      staticPlot={false}
      displayLegend={data3.length > 1}
      displayLibraryControls={false}
      // margin={{l: 50, r: 10, b: 20, t: 10}}
    />
  );
};

//DKDK adding storybook control
const Template = (args: any) => <BoxplotEDA {...args} />;
export const WithStorybookControl: Story<any> = Template.bind({});

//DKDK set default values for args that use default storybook control
WithStorybookControl.args = {
  data: data3,
  width: plotWidth,
  height: plotHeight,
  orientation: orientation,
  points: pointsValue,
  showMean: true,
  independentAxisLabel: 'Independent axis name',
  dependentAxisLabel: 'Dependent axis name',
};
