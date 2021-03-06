import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { NumericRange } from '../../types/general';

import Histogram, { HistogramProps } from '../../plots/Histogram';
import {
  DARK_GRAY,
  LIGHT_BLUE,
  LIGHT_GREEN,
  MEDIUM_GRAY,
} from '../../constants/colors';
import usePlotControls from '../../hooks/usePlotControls';
import HistogramControls from '../../components/plotControls/HistogramControls';
import { binDailyCovidStats } from '../api/covidData';
import { HistogramData } from '../../types/plots';

export default {
  title: 'Plots/Histogram',
  component: Histogram,
} as Meta;

const defaultActions = {
  onSelectedRangeChange: (newRange: NumericRange) => {
    console.log(`made a selection of ${newRange.min} to ${newRange.max}`);
  },
};

const TemplateWithControls: Story<
  HistogramProps & {
    binWidthRange?: [number, number];
    binWidthStep?: number;
    throwSampleErrors: boolean;
    includeExtraDirectives: boolean;
  }
> = (args, { loaded: { apiData } }) => {
  const plotControls = usePlotControls<HistogramData>({
    data: apiData,
    onSelectedUnitChange: async ({ selectedUnit }) => {
      return await binDailyCovidStats(
        undefined,
        selectedUnit,
        args.throwSampleErrors,
        args.includeExtraDirectives
      );
    },
    histogram: {
      binWidthRange: args.binWidthRange,
      binWidthStep: args.binWidthStep,
      onBinWidthChange: async ({ binWidth, selectedUnit }) => {
        return await binDailyCovidStats(
          binWidth,
          selectedUnit,
          args.throwSampleErrors,
          args.includeExtraDirectives
        );
      },
    },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Histogram
        {...args}
        {...plotControls}
        {...plotControls.histogram}
        {...defaultActions}
      />
      <div style={{ height: 25 }} />
      <HistogramControls
        label="Histogram Controls"
        {...plotControls}
        {...plotControls.histogram}
        containerStyles={{
          maxWidth: args.width - 25,
          marginLeft: 25,
        }}
      />
    </div>
  );
};

export const BinWidthRangeGeneratedFromData = TemplateWithControls.bind({});
BinWidthRangeGeneratedFromData.args = {
  title: 'Some Current Covid Data in U.S. States',
  height: 400,
  width: 1000,
};

// @ts-ignore
BinWidthRangeGeneratedFromData.loaders = [
  async () => ({
    apiData: await binDailyCovidStats(2000),
  }),
];

export const OverrideBinWidthRangeAndStep = TemplateWithControls.bind({});
OverrideBinWidthRangeAndStep.args = {
  title: 'Some Current Covid Data in U.S. States',
  height: 400,
  width: 1000,
  binWidthRange: [2000, 10000],
  binWidthStep: 1000,
};

// @ts-ignore
OverrideBinWidthRangeAndStep.loaders = [
  async () => ({
    apiData: await binDailyCovidStats(2000),
  }),
];

export const BackendProvidedBinWidthRangeAndStep = TemplateWithControls.bind(
  {}
);
BackendProvidedBinWidthRangeAndStep.args = {
  title: 'Some Current Covid Data in U.S. States',
  height: 400,
  width: 1000,
  includeExtraDirectives: true,
};

// @ts-ignore
BackendProvidedBinWidthRangeAndStep.loaders = [
  async () => ({
    apiData: await binDailyCovidStats(1000, undefined, false, true),
  }),
];

const TemplateWithSelectedRangeControls: Story<
  HistogramProps & {
    binWidthRange?: [number, number];
    binWidthStep?: number;
    throwSampleErrors: boolean;
    includeExtraDirectives: boolean;
  }
> = (args, { loaded: { apiData } }) => {
  const [selectedRange, setSelectedRange] = useState<NumericRange>();

  const handleSelectedRange = (newRange: NumericRange) => {
    console.log(
      `The story got a new range from ${newRange.min} to ${newRange.max}`
    );
    setSelectedRange(newRange);
  };

  const plotControls = usePlotControls<HistogramData>({
    data: apiData,
    onSelectedUnitChange: async ({ selectedUnit }) => {
      return await binDailyCovidStats(
        undefined,
        selectedUnit,
        args.throwSampleErrors,
        args.includeExtraDirectives
      );
    },
    histogram: {
      binWidthRange: args.binWidthRange,
      binWidthStep: args.binWidthStep,
      onBinWidthChange: async ({ binWidth, selectedUnit }) => {
        return await binDailyCovidStats(
          binWidth,
          selectedUnit,
          args.throwSampleErrors,
          args.includeExtraDirectives
        );
      },
    },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Histogram
        {...args}
        {...plotControls}
        {...plotControls.histogram}
        selectedRange={selectedRange}
        onSelectedRangeChange={handleSelectedRange}
      />
      <div style={{ height: 25 }} />
      <HistogramControls
        label="Histogram Controls"
        {...plotControls}
        {...plotControls.histogram}
        containerStyles={{
          maxWidth: args.width - 25,
          marginLeft: 25,
        }}
      />
    </div>
  );
};

export const RangeSelection = TemplateWithSelectedRangeControls.bind({});
RangeSelection.args = {
  title: 'Some Current Covid Data in U.S. States',
  height: 400,
  width: 1000,
};

//@ts-ignore
RangeSelection.loaders = [
  async () => ({
    apiData: await binDailyCovidStats(1000),
  }),
];

// export const SharedControlsMultiplePlots: Story<HistogramProps> = (
//   args,
//   { loaded: { apiData } }
// ) => {
//   const plotControls = usePlotControls<HistogramData>({
//     data: apiData,
//     histogram: {
//       binWidthRange: [2000, 10000],
//       binWidthStep: 1000,
//       onBinWidthChange: async (width) => {
//         return await binDailyCovidStats(width);
//       },
//     },
//   });

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column' }}>
//       <div style={{ display: 'flex' }}>
//         <Histogram
//           title='New Cases'
//           height={args.height}
//           width={args.width / 2}
//           {...plotControls}
//           {...plotControls.histogram}
//           data={{
//             ...plotControls.data,
//             series: plotControls.data.series.filter(
//               (series) => series.name === 'New Cases'
//             ),
//           }}
//           {...defaultActions}
//         />
//         <Histogram
//           title='Current Hospitalizations'
//           height={args.height}
//           width={args.width / 2}
//           {...plotControls}
//           {...plotControls.histogram}
//           data={{
//             ...plotControls.data,
//             series: plotControls.data.series.filter(
//               (series) => series.name === 'Current Hospitalizations'
//             ),
//           }}
//           {...defaultActions}
//         />
//       </div>
//       <div style={{ height: 25 }} />
//       <HistogramControls
//         label='Histogram Controls'
//         {...plotControls}
//         {...plotControls.histogram}
//         containerStyles={{ maxWidth: args.width }}
//       />
//     </div>
//   );
// };

// // @ts-ignore
// SharedControlsMultiplePlots.loaders = [
//   async () => ({
//     apiData: await binDailyCovidStats(2000),
//   }),
// ];

// SharedControlsMultiplePlots.args = {
//   height: 500,
//   width: 1000,
// };

// export const Single = Template.bind({});
// Single.storyName = 'One Data Series';
// Single.args = {
//   height: 500,
//   width: 1000,
//   data: singleSeriesMock,
//   binWidth: 2,
// };

// export const SingleDateSeries = Template.bind({});
// SingleDateSeries.storyName = 'One Date Based Series';
// SingleDateSeries.args = {
//   height: 500,
//   width: 1000,
//   data: dateSeriesMock,
// };

// export const TwoDataSeries = Template.bind({});
// TwoDataSeries.storyName = 'Two Data Series';
// TwoDataSeries.args = {
//   height: 500,
//   width: 1000,
//   data: doubleSeriesMock,
//   binWidth: 2,
// };

// export const StackedBars = Template.bind({});
// StackedBars.args = {
//   ...TwoDataSeries.args,
//   barLayout: 'stack',
// };

// export const PlotTitle = Template.bind({});
// PlotTitle.args = {
//   ...TwoDataSeries.args,
//   title: 'A Fancy Plot Title',
// };

// export const CustomAxesLabels = Template.bind({});
// CustomAxesLabels.args = {
//   ...TwoDataSeries.args,
//   title: 'Custom Axes Labels',
//   independentAxisLabel: 'Number of Items Ordered (Binned)',
//   dependentAxisLabel: 'Count of Orders',
// };

// export const HorizontalOrientation = Template.bind({});
// HorizontalOrientation.args = {
//   ...TwoDataSeries.args,
//   orientation: 'horizontal',
//   title: 'Horizontal Plot with Title',
// };

// export const CustomBarOpacity = Template.bind({});
// CustomBarOpacity.args = {
//   ...TwoDataSeries.args,
//   opacity: 0.25,
//   title: 'Custom Bar Opacity',
// };

// export const CustomColors = Template.bind({});
// CustomColors.args = {
//   ...TwoDataSeries.args,
//   backgroundColor: DARK_GRAY,
//   gridColor: MEDIUM_GRAY,
//   textColor: 'white',
//   title: 'Custom Background, Text, and Grid Colors',
// };
