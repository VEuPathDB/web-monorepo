import React from 'react';
import { Meta, Story } from '@storybook/react'
import Boxplot, {Props} from '../plots/Boxplot';
import stats from 'stats-lite';
import _ from 'lodash';

export default {
  title: 'Boxplot',
  component: Boxplot
} as Meta;

const Template = (args : Props) => <Boxplot {...args} />;

const catRawData = [ 8, 26, 28, 19, 28, 20, 50, 38, 35, 32, 31, 25, 22, 21, 25, 22 ];
const catData = summaryStats(catRawData);
const catMean = stats.mean(catRawData);

const dogRawData = [ 20, 60, 61, 77, 72, 50, 61, 80, 88, 120, 130, 131, 129, 67, 77, 87, 66, 69, 74, 56, 68 ];
const dogData = summaryStats(dogRawData);
const dogMean = stats.mean(dogRawData);

export const Basic : Story<Props> = Template.bind({});
Basic.argTypes = storyArgTypes(
  Basic.args = {
    data: [ {...catData, label: 'cats'},
	    {...dogData, label: 'dogs'} ]
});

export const NoOutliersGiven : Story<Props> = Template.bind({});
NoOutliersGiven.argTypes = storyArgTypes(
  NoOutliersGiven.args = {
    data: [ {...catData, label: 'cats', outliers: []},
	    {...dogData, label: 'dogs', outliers: []} ]
});

export const WithMean : Story<Props> = Template.bind({});
WithMean.argTypes = storyArgTypes(
  WithMean.args = {
    data: [ {...catData, label: 'cats', mean: catMean},
	    {...dogData, label: 'dogs', mean: dogMean} ],
    defaultShowMean: true
});

const outdoorTemperatureRawData = [ -25, -10, -5, -3, 0, 1, 2, 6, 7, 17, 18, 25, 33 ];
const outdoorTemperatureData = summaryStats(outdoorTemperatureRawData);

export const BelowZero : Story<Props> = Template.bind({});
BelowZero.argTypes = storyArgTypes(
  BelowZero.args = {
    data: [ {...outdoorTemperatureData, label: 'outdoor temperature'} ]
});

export const NoWhiskers : Story<Props> = Template.bind({});
NoWhiskers.argTypes = storyArgTypes(
  NoWhiskers.args = {
    data: [ {...outdoorTemperatureData,
	     lowerWhisker: undefined,
	     upperWhisker: undefined, label: 'outdoor temperature'} ]
});

const indoorTemperatureRawData = [ 15, 17, 20, 21, 21, 21, 21, 23, 22, 25 ];
const indoorTemperatureData = summaryStats(indoorTemperatureRawData);

export const YAxisLabel : Story<Props> = Template.bind({});
YAxisLabel.argTypes = storyArgTypes(
  YAxisLabel.args = {
    data: [ {...outdoorTemperatureData, label: 'outdoor'},
	    {...indoorTemperatureData, label: 'indoor'} ],
    yAxisLabel: "temperature, °C"
});

export const XAndYAxisLabel : Story<Props> = Template.bind({});
XAndYAxisLabel.argTypes = storyArgTypes(
  XAndYAxisLabel.args = {
    data: [ {...catData, label: 'cats'}, {...dogData, label: 'dogs'} ],
    xAxisLabel: "domestic animal",
    yAxisLabel: "height, cm"
});

export const FixedYAxisRange : Story<Props> = Template.bind({});
FixedYAxisRange.argTypes = storyArgTypes(
  FixedYAxisRange.args = {
    data: [ {...outdoorTemperatureData, label: 'outdoor'}, {...indoorTemperatureData, label: 'indoor'} ],
    yAxisLabel: "temperature, °C",
    xAxisLabel: "location",
    defaultYAxisRange: [-50,50]
});

export const FixedTooSmallYAxisRange : Story<Props> = Template.bind({});
FixedTooSmallYAxisRange.argTypes = storyArgTypes(
  FixedTooSmallYAxisRange.args = {
    data: [ {...outdoorTemperatureData, label: 'outdoor'}, {...indoorTemperatureData, label: 'indoor'} ],
    yAxisLabel: "temperature, °C",
    xAxisLabel: "location",
    defaultYAxisRange: [-10,10]
});

export const Horizontal : Story<Props> = Template.bind({});
Horizontal.argTypes = storyArgTypes(
  Horizontal.args = {
    data: [ {...catData, label: 'cats'}, {...dogData, label: 'dogs'} ],
    xAxisLabel: "domestic animal",
    yAxisLabel: "height, cm",
    defaultOrientation: "horizontal"
});

export const HorizontalLongLabels : Story<Props> = Template.bind({});
HorizontalLongLabels.argTypes = storyArgTypes(
  HorizontalLongLabels.args = {
    data: [ {...catData, label: 'hungry domestic cats'}, {...dogData, label: 'sleepy domestic dogs'} ],
    xAxisLabel: "type of domestic animal",
    yAxisLabel: "height, cm",
    defaultOrientation: "horizontal"
});

export const WithRawData : Story<Props> = Template.bind({});
WithRawData.argTypes = storyArgTypes(
  WithRawData.args = {
    data: [ {...catData, label: 'cats', rawData: catRawData}, {...dogData, label: 'dogs', rawData: dogRawData} ],
    defaultShowRawData: true,
    xAxisLabel: "domestic animal",
    yAxisLabel: "height, cm"
});

export const HorizontalWithRawData : Story<Props> = Template.bind({});
HorizontalWithRawData.argTypes = storyArgTypes(
  HorizontalWithRawData.args = {
    data: [ {...catData, label: 'cats', rawData: catRawData}, {...dogData, label: 'dogs', rawData: dogRawData} ],
    defaultShowRawData: true,
    xAxisLabel: "domestic animal",
    yAxisLabel: "height, cm",
    defaultOrientation: "horizontal"
});

export const HorizontalWithOneRawDataOneMean : Story<Props> = Template.bind({});
HorizontalWithOneRawDataOneMean.argTypes = storyArgTypes(
  HorizontalWithOneRawDataOneMean.args = {
    data: [ {...catData, label: 'cats with mean', mean: catMean},
	    {...dogData, label: 'dogs with raw', rawData: dogRawData} ],
    defaultShowRawData: true,
    defaultShowMean: true,
    xAxisLabel: "domestic animal",
    yAxisLabel: "height, cm",
    defaultOrientation: "horizontal"
});

export const TwoColors : Story<Props> = Template.bind({});
TwoColors.argTypes = storyArgTypes(
  TwoColors.args = {
    data: [ {...catData, label: 'cats', color: 'pink'},
	    {...dogData, label: 'dogs', color: 'purple'} ]
});


// even though the labels are correctly provided as strings
// Plotly is treating them as dates.
// Is this a bug or a feature?
export const NumberLabels : Story<Props> = Template.bind({});
NumberLabels.argTypes = storyArgTypes(
  NumberLabels.args = {
    data: [ {...catData, label: '1', color: 'silver'},
	    {...dogData, label: '2.5', color: 'silver'},
	    {...indoorTemperatureData, label: '5', color: 'silver'},
	    {...outdoorTemperatureData, label: '6', color: 'silver'} ]
});

// even though the labels are correctly provided as
// Plotly is treating them as numbers.
// Is this a bug or a feature?
export const DateLabels : Story<Props> = Template.bind({});
DateLabels.argTypes = storyArgTypes(
  DateLabels.args = {
    data: [ {...catData, label: '2002-03-04', color: 'silver'},
	    {...dogData, label: '2002-04-01', color: 'silver'},
	    {...indoorTemperatureData, label: '2002-04-24', color: 'silver'},
	    {...outdoorTemperatureData, label: '2002-04-30', color: 'silver'} ]
});

// These strings are ISO-8601 compliant to specify whole months
// but Plotly is doing strange things - mouse-over dates are the first of the correct month
// x-axis labels are the last day of the previous month - except the first trace!
// Even weirder is that if you switch it to horizontal mode the labels are completely correct:
// "Jun 2002", "May 2002" etc
export const MonthLabels : Story<Props> = Template.bind({});
MonthLabels.argTypes = storyArgTypes(
  MonthLabels.args = {
    data: [ {...catData, label: '2002-03', color: 'silver'},
	    {...dogData, label: '2002-04', color: 'silver'},
	    {...indoorTemperatureData, label: '2002-05', color: 'silver'},
	    {...outdoorTemperatureData, label: '2002-06', color: 'silver'} ]
});

// These strings are being interpreted as numbers, not dates.
// If we wanted to use Plotly's 'box select' tool this would be a problem,
// because the selected x range would not be date-based.
//
// Note that 'box select' is not showing up for any boxplots by default
// (even those with numeric-as-string x-axes)
//
// To fix this we could add layout.xaxis.type = 'date'
export const YearLabels : Story<Props> = Template.bind({});
YearLabels.argTypes = storyArgTypes(
  YearLabels.args = {
    data: [ {...catData, label: '2002', color: 'silver'},
	    {...dogData, label: '2003', color: 'silver'},
	    {...indoorTemperatureData, label: '2004', color: 'silver'},
	    {...outdoorTemperatureData, label: '2005', color: 'silver'} ]
});


function summaryStats(rawData : number[]) {
  const q1 = stats.percentile(rawData, 0.25);
  const median = stats.median(rawData);
  const q3 = stats.percentile(rawData, 0.75);
  const IQR = q3-q1;
  const lowerFence = q1 - 1.5*IQR;
  const upperFence = q3 + 1.5*IQR;
  const lowerWhisker = _.min(rawData.filter((x) => x >= lowerFence));
  const upperWhisker = _.max(rawData.filter((x) => x <= upperFence));

  const outliers = rawData.filter((x) => x < lowerFence || x > upperFence);

  return {
    q1, median, q3,
    lowerWhisker, upperWhisker, outliers
  }
}

function storyArgTypes(args : any) : any {
  return {
    defaultShowRawData: {
      control: {
	disable: args.data.filter((d : any) => d.rawData && d.rawData.length).length == 0
      }
    },
    defaultShowMean: {
      control: {
	disable: args.data.filter((d : any) => d.mean !== undefined).length == 0
      }
    },
  };
}

