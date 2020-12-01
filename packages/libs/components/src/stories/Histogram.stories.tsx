import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import Histogram, { HistogramData, HistogramProps } from '../plots/Histogram';
import {
  DARK_GRAY,
  DARK_RED,
  DARK_YELLOW,
  LIGHT_BLUE,
  LIGHT_GRAY,
  LIGHT_GREEN,
  LIGHT_ORANGE,
  LIGHT_PURPLE,
  LIGHT_RED,
  LIGHT_YELLOW,
  MEDIUM_GRAY,
} from '../constants/colors';

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
        binEnd: 2,
        count: 10,
      },
      {
        binStart: 2,
        binEnd: 4,
        count: 14,
      },
      {
        binStart: 4,
        binEnd: 6,
        count: 3,
      },
      {
        binStart: 6,
        binEnd: 8,
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
        binEnd: 6,
        count: 16,
      },
      {
        binStart: 6,
        binEnd: 8,
        count: 7,
      },
      {
        binStart: 8,
        binEnd: 10,
        count: 4,
      },
      {
        binStart: 10,
        binEnd: 12,
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
        binEnd: '2020-01-07',
        count: 16000,
      },
      {
        binStart: '2020-01-08',
        binEnd: '2020-01-14',
        count: 54000,
      },
      {
        binStart: '2020-01-15',
        binEnd: '2020-01-21',
        count: 72000,
      },
      {
        binStart: '2020-01-22',
        binEnd: '2020-01-28',
        count: 90000,
      },
      {
        binStart: '2020-01-29',
        binEnd: '2020-02-04',
        count: 74000,
      },
      {
        binStart: '2020-02-05',
        binEnd: '2020-01-11',
        count: 103400,
      },
      {
        binStart: '2020-02-12',
        binEnd: '2020-02-18',
        count: 95999,
      },
      {
        binStart: '2020-02-13',
        binEnd: '2020-02-25',
        count: 125367,
      },
    ],
  },
];

const Template: Story<HistogramProps> = (args) => <Histogram {...args} />;

export const Single = Template.bind({});
Single.storyName = 'One Data Series';
Single.args = {
  height: 500,
  width: 1000,
  data: singleSeriesMock,
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
};

export const StackedBars = Template.bind({});
StackedBars.args = {
  ...TwoDataSeries.args,
  layout: 'stack',
};

export const GroupedBars = Template.bind({});
GroupedBars.args = {
  ...TwoDataSeries.args,
  layout: 'group',
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
  defaultOrientation: 'horizontal',
  title: 'Horizontal Plot with Title',
};

export const CustomBarOpacity = Template.bind({});
CustomBarOpacity.args = {
  ...TwoDataSeries.args,
  defaultOpacity: 0.25,
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
