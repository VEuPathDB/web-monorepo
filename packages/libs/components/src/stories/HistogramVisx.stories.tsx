import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import Histogram, {
  HistogramProps,
  HistogramData,
} from '../plots/HistogramVisx';
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
  title: 'In Development/Histogram (Visx Prototype)',
  component: Histogram,
} as Meta;

const singleSeriesMock: HistogramData<number> = [
  {
    seriesName: 'Tacos',
    seriesColor: LIGHT_GREEN,
    data: [
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

const doubleSeriesMock: HistogramData<number> = [
  ...singleSeriesMock,
  {
    seriesName: 'Pizzas',
    seriesColor: LIGHT_BLUE,
    data: [
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

const Template: Story<HistogramProps> = (args) => <Histogram {...args} />;

export const Single = Template.bind({});
Single.storyName = 'One Numeric Series';
Single.args = { height: 400, width: 800, events: true, data: singleSeriesMock };

export const TwoNumericSeries = Template.bind({});
TwoNumericSeries.storyName = 'Two Numeric Series';
TwoNumericSeries.args = {
  height: 400,
  width: 800,
  events: true,
  data: doubleSeriesMock,
};

export const BackgroundGrid = Template.bind({});
BackgroundGrid.args = {
  ...TwoNumericSeries.args,
  displayGrid: true,
};

export const PlotTitle = Template.bind({});
PlotTitle.args = {
  ...TwoNumericSeries.args,
  displayGrid: true,
  title: 'A Fancy Plot Title',
};

export const WithLegend = Template.bind({});
WithLegend.args = {
  ...TwoNumericSeries.args,
  displayGrid: true,
  displayLegend: true,
  title: 'A Fancy Plot with Legend',
};

export const HorizontalOrientation = Template.bind({});
HorizontalOrientation.args = {
  ...TwoNumericSeries.args,
  displayGrid: true,
  displayLegend: true,
  orientation: 'horizontal',
  title: 'Horizontal Plot with Legend & Grid',
};

export const GradientBackground = Template.bind({});
GradientBackground.args = {
  ...PlotTitle.args,
  title: 'A Fancy Plot Title on Gradient Background',
  titleColor: 'rgba(0, 0, 0, .4)',
  displayGrid: false,
  backgroundGradientColors: [LIGHT_YELLOW, LIGHT_GRAY],
};
