import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import Histogram, { HistogramProps } from '../plots/Histogram';
import {
  DARK_GRAY,
  LIGHT_BLUE,
  LIGHT_GREEN,
  MEDIUM_GRAY,
} from '../constants/colors';
import usePlotControls from '../hooks/usePlotControls';
import HistogramControls from '../components/plotControls/HistogramControls';
import { binDailyCovidStats } from './api/covidData';
import { HistogramData } from '../types/plots';

import { action } from '@storybook/addon-actions'; // BM: temp/debugging - should not depend on storybook here!

export default {
  title: 'In Development/Histogram',
  component: Histogram,
} as Meta;

const singleSeriesMock: HistogramData = [
  {
    name: 'Tacos',
    color: LIGHT_GREEN,
    bins: [
      {
        binStart: 0,
        count: 10,
      },
      {
        binStart: 2,
        count: 14,
      },
      {
        binStart: 4,
        count: 3,
      },
      {
        binStart: 6,
        count: 5,
      },
    ],
  },
];

const doubleSeriesMock: HistogramData = [
  ...singleSeriesMock,
  {
    name: 'Pizzas',
    color: LIGHT_BLUE,
    bins: [
      {
        binStart: 4,
        count: 16,
      },
      {
        binStart: 6,
        count: 7,
      },
      {
        binStart: 8,
        count: 4,
      },
      {
        binStart: 10,
        count: 2,
      },
    ],
  },
];

const dateSeriesMock: HistogramData = [
  {
    name: 'Vaccinations',
    color: LIGHT_BLUE,
    bins: [
      {
        binStart: '2020-01-01',
        binLabel: '2020-01-01',
        count: 16000,
      },
      {
        binStart: '2020-01-08',
        binLabel: '2020-01-08',
        count: 54000,
      },
      {
        binStart: '2020-01-15',
        binLabel: '2020-01-15',
        count: 72000,
      },
      {
        binStart: '2020-01-22',
        binLabel: '2020-01-22',
        count: 90000,
      },
      {
        binStart: '2020-01-29',
        binLabel: '2020-01-29',
        count: 74000,
      },
      {
        binStart: '2020-02-05',
        binLabel: '2020-02-05',
        count: 103400,
      },
      {
        binStart: '2020-02-12',
        binLabel: '2020-02-12',
        count: 95999,
      },
      {
        binStart: '2020-02-13',
        binLabel: '2020-02-13',
        count: 125367,
      },
    ],
  },
];

const defaultActions = {
  onSelected: action('made a selection')
};

const Template: Story<HistogramProps> = (args) => <Histogram {...args} {...defaultActions} />;

const TemplateWithControls: Story<HistogramProps> = (
  args,
  { loaded: { apiData } }
) => {
  const plotControls = usePlotControls<HistogramData>({
    data: apiData,
    availableUnits: ['single items', 'dozens'],
    initialSelectedUnit: 'single items',
    histogram: {
      binWidthRange: [2000, 10000],
      binWidthStep: 1000,
      initialBinWidth: 2000,
      onBinWidthChange: async (width) => {
        return await binDailyCovidStats(width);
      },
    },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Histogram
        {...args}
        data={plotControls.data}
        opacity={plotControls.opacity}
        orientation={plotControls.orientation}
        layout={plotControls.barLayout}
        binWidth={plotControls.histogram.binWidth}
        {...defaultActions}
      />
      <div style={{ height: 25 }} />
      <HistogramControls
        label='Histogram Controls'
        displayLegend={plotControls.displayLegend}
        onDisplayLegendChange={plotControls.toggleDisplayLegend}
        availableUnits={plotControls.availableUnits}
        selectedUnit={plotControls.selectedUnit}
        onSelectedUnitChange={plotControls.setSelectedUnit}
        barLayout={plotControls.barLayout}
        onBarLayoutChange={plotControls.setBarLayout}
        opacity={plotControls.opacity}
        onOpacityChange={plotControls.setOpacity}
        orientation={plotControls.orientation}
        onOrientationChange={plotControls.toggleOrientation}
        containerStyles={{ maxWidth: 600 }}
        binWidth={plotControls.histogram.binWidth}
        binWidthRange={plotControls.histogram.binWidthRange}
        binWidthStep={plotControls.histogram.binWidthStep}
        onBinWidthChange={plotControls.histogram.setBinWidth}
        errorManagement={plotControls.errorManagement}
      />
    </div>
  );
};

export const SingleWithControls = TemplateWithControls.bind({});
SingleWithControls.args = {
  title: 'Some Current Covid Data in U.S. States',
  height: 400,
  width: 1000,
};

// @ts-ignore
SingleWithControls.loaders = [
  async () => ({
    apiData: await binDailyCovidStats(2000),
  }),
];

export const SharedControlsMultiplePlots: Story<HistogramProps> = (
  args,
  { loaded: { apiData } }
) => {
  const plotControls = usePlotControls<HistogramData>({
    data: apiData,
    availableUnits: ['single items', 'dozens'],
    initialSelectedUnit: 'single items',
    histogram: {
      binWidthRange: [2000, 10000],
      binWidthStep: 1000,
      initialBinWidth: 2000,
      onBinWidthChange: async (width) => {
        return await binDailyCovidStats(width);
      },
    },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex' }}>
        <Histogram
          title='New Cases'
          height={args.height}
          width={args.width / 2}
          data={plotControls.data.filter(
            (series) => series.name === 'New Cases'
          )}
          opacity={plotControls.opacity}
          orientation={plotControls.orientation}
          layout={plotControls.barLayout}
          binWidth={plotControls.histogram.binWidth}
	  {...defaultActions}
        />
        <Histogram
          title='Current Hospitalizations'
          height={args.height}
          width={args.width / 2}
          data={plotControls.data.filter(
            (series) => series.name === 'Current Hospitalizations'
          )}
          opacity={plotControls.opacity}
          orientation={plotControls.orientation}
          layout={plotControls.barLayout}
          binWidth={plotControls.histogram.binWidth}
	  {...defaultActions}
        />
      </div>
      <div style={{ height: 25 }} />
      <HistogramControls
        label='Histogram Controls'
        displayLegend={plotControls.displayLegend}
        onDisplayLegendChange={plotControls.toggleDisplayLegend}
        availableUnits={plotControls.availableUnits}
        selectedUnit={plotControls.selectedUnit}
        onSelectedUnitChange={plotControls.setSelectedUnit}
        barLayout={plotControls.barLayout}
        onBarLayoutChange={plotControls.setBarLayout}
        opacity={plotControls.opacity}
        onOpacityChange={plotControls.setOpacity}
        orientation={plotControls.orientation}
        onOrientationChange={plotControls.toggleOrientation}
        containerStyles={{ width: 500 }}
        binWidth={plotControls.histogram.binWidth}
        binWidthRange={plotControls.histogram.binWidthRange}
        binWidthStep={plotControls.histogram.binWidthStep}
        onBinWidthChange={plotControls.histogram.setBinWidth}
        errorManagement={plotControls.errorManagement}
      />
    </div>
  );
};

// @ts-ignore
SharedControlsMultiplePlots.loaders = [
  async () => ({
    apiData: await binDailyCovidStats(2000),
  }),
];

SharedControlsMultiplePlots.args = {
  height: 500,
  width: 1000,
};

export const Single = Template.bind({});
Single.storyName = 'One Data Series';
Single.args = {
  height: 500,
  width: 1000,
  data: singleSeriesMock,
  binWidth: 2,
};

export const SingleDateSeries = Template.bind({});
SingleDateSeries.storyName = 'One Date Based Series';
SingleDateSeries.args = {
  height: 500,
  width: 1000,
  data: dateSeriesMock,
};

export const TwoDataSeries = Template.bind({});
TwoDataSeries.storyName = 'Two Data Series';
TwoDataSeries.args = {
  height: 500,
  width: 1000,
  data: doubleSeriesMock,
  binWidth: 2,
};

export const StackedBars = Template.bind({});
StackedBars.args = {
  ...TwoDataSeries.args,
  layout: 'stack',
};

export const PlotTitle = Template.bind({});
PlotTitle.args = {
  ...TwoDataSeries.args,
  title: 'A Fancy Plot Title',
};

export const CustomAxesLabels = Template.bind({});
CustomAxesLabels.args = {
  ...TwoDataSeries.args,
  title: 'Custom Axes Labels',
  independentAxisLabel: 'Number of Items Ordered (Binned)',
  dependentAxisLabel: 'Count of Orders',
};

export const HorizontalOrientation = Template.bind({});
HorizontalOrientation.args = {
  ...TwoDataSeries.args,
  orientation: 'horizontal',
  title: 'Horizontal Plot with Title',
};

export const CustomBarOpacity = Template.bind({});
CustomBarOpacity.args = {
  ...TwoDataSeries.args,
  opacity: 0.25,
  title: 'Custom Bar Opacity',
};

export const CustomColors = Template.bind({});
CustomColors.args = {
  ...TwoDataSeries.args,
  backgroundColor: DARK_GRAY,
  gridColor: MEDIUM_GRAY,
  textColor: 'white',
  title: 'Custom Background, Text, and Grid Colors',
};
