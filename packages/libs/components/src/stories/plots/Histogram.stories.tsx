import React, { useEffect } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import {
  NumberRange,
  NumberOrDateRange,
  TimeDeltaRange,
  TimeDelta,
} from '../../types/general';

import Histogram, { HistogramProps } from '../../plots/Histogram';
import usePlotControls from '../../hooks/usePlotControls';
import HistogramControls from '../../components/plotControls/HistogramControls';
import { binDailyCovidStats } from '../api/covidData';
import { binGithubEventDates } from '../api/githubDates';
import { HistogramData } from '../../types/plots';

export default {
  title: 'Plots/Histogram',
  component: Histogram,
} as Meta;

const defaultActions = {
  onSelectedRangeChange: (newRange?: NumberOrDateRange) => {
    console.log(`made a selection of ${newRange?.min} to ${newRange?.max}`);
  },
};

const TemplateWithControls: Story<
  HistogramProps & {
    binWidthRange?: NumberRange;
    binWidthStep?: number;
    throwSampleErrors: boolean;
    includeExtraDirectives: boolean;
  }
> = (args, { loaded: { apiData } }) => {
  const plotControls = usePlotControls<HistogramData>({
    data: apiData,
    onSelectedUnitChange: async (newUnit: string) => {
      return await binDailyCovidStats(
        undefined,
        newUnit,
        args.throwSampleErrors,
        args.includeExtraDirectives
      );
    },
    histogram: {
      binWidthRange: args.binWidthRange,
      binWidthStep: args.binWidthStep,
      onBinWidthChange: async ({ binWidth, selectedUnit }) => {
        return await binDailyCovidStats(
          binWidth as number,
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
        valueType="number"
        {...plotControls}
        {...plotControls.histogram}
        containerStyles={{
          maxWidth: `calc(${toCSSLength(args.width)} - 25px)`,
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

export const NoTitle = TemplateWithControls.bind({});
NoTitle.args = {
  height: 400,
  width: '100%',
  spacingOptions: {
    marginTop: 20,
    marginBottom: 20,
  },
};

// @ts-ignore
NoTitle.loaders = [
  async () => ({
    apiData: await binDailyCovidStats(2000),
  }),
];

export const OverrideBinWidthRangeAndStep = TemplateWithControls.bind({});
OverrideBinWidthRangeAndStep.args = {
  title: 'Some Current Covid Data in U.S. States',
  height: 400,
  width: 1000,
  binWidthRange: { min: 2000, max: 10000 },
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
    binWidthRange?: NumberRange;
    binWidthStep?: number;
    throwSampleErrors: boolean;
    includeExtraDirectives: boolean;
  }
> = (args, { loaded: { apiData } }) => {
  const plotControls = usePlotControls<HistogramData>({
    data: apiData,
    onSelectedUnitChange: async (newUnit: string) => {
      return await binDailyCovidStats(
        undefined,
        newUnit,
        args.throwSampleErrors,
        args.includeExtraDirectives
      );
    },
    histogram: {
      binWidthRange: args.binWidthRange,
      binWidthStep: args.binWidthStep,
      onBinWidthChange: async ({ binWidth, selectedUnit }) => {
        return await binDailyCovidStats(
          binWidth as number,
          selectedUnit,
          args.throwSampleErrors,
          args.includeExtraDirectives
        );
      },
      displaySelectedRangeControls: true,
    },
  });

  /**
   * Watch for changes on the histogram's selected range.
   * Includes the initial setting (derived from the data).
   */
  useEffect(() => {
    const newRange = plotControls.histogram.selectedRange;
    if (newRange) {
      console.log(
        `The story received a new range: ${newRange.min} to ${newRange.max}`
      );
    }
  }, [plotControls.histogram.selectedRange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Histogram {...args} {...plotControls} {...plotControls.histogram} />
      <div style={{ height: 25 }} />
      <HistogramControls
        label="Histogram Controls"
        {...plotControls}
        {...plotControls.histogram}
        containerStyles={{
          maxWidth: `calc(${toCSSLength(args.width)} - 25px)`,
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

// no controls
const SimpleDateTemplate: Story<HistogramProps> = (
  args,
  { loaded: { apiData } }
) => {
  return <Histogram {...args} data={apiData} />;
};

export const EventHoursNoControls = SimpleDateTemplate.bind({});
EventHoursNoControls.args = {
  title: 'Recent VEuPathDB github events',
  height: 400,
  width: 1000,
};

//@ts-ignore
EventHoursNoControls.loaders = [
  async () => ({
    apiData: await binGithubEventDates({
      numBins: 10,
      url: 'https://api.github.com/users/VEuPathDB/events?per_page=100',
      unit: 'hours',
    }),
  }),
];

export const RepoMonthsNoControls = SimpleDateTemplate.bind({});
RepoMonthsNoControls.args = {
  title: 'VEuPathDB github repo creation dates',
  height: 400,
  width: 1000,
};

//@ts-ignore
RepoMonthsNoControls.loaders = [
  async () => ({
    apiData: await binGithubEventDates({
      numBins: 10,
      url: 'https://api.github.com/users/VEuPathDB/repos?sort=created',
      unit: 'month',
    }),
  }),
];

const TemplateWithSelectedDateRangeControls: Story<
  HistogramProps & {
    binWidthRange?: TimeDeltaRange;
    binWidthStep?: number;
  }
> = (args, { loaded: { apiData } }) => {
  const plotControls = usePlotControls<HistogramData>({
    data: apiData,
    onSelectedUnitChange: async (newUnit: string) => {
      return await binGithubEventDates({
        url: 'https://api.github.com/users/VEuPathDB/repos?sort=created',
        unit: 'month',
        numBins: 10,
      });
    },
    histogram: {
      valueType: 'date',
      binWidthRange: args.binWidthRange,
      binWidthStep: args.binWidthStep,
      onBinWidthChange: async ({ binWidth, selectedUnit }) => {
        return await binGithubEventDates({
          url: 'https://api.github.com/users/VEuPathDB/repos?sort=created',
          unit: 'month',
          numBins: 10,
        });
      },
      displaySelectedRangeControls: true,
    },
  });

  /**
   * Watch for changes on the histogram's selected range.
   * Includes the initial setting (derived from the data).
   */
  useEffect(() => {
    const newRange = plotControls.histogram.selectedRange;
    if (newRange) {
      console.log(
        `The story received a new range: ${newRange.min} to ${newRange.max}`
      );
    }
  }, [plotControls.histogram.selectedRange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Histogram {...args} {...plotControls} {...plotControls.histogram} />
      <div style={{ height: 25 }} />
      <HistogramControls
        label="Histogram Controls"
        {...plotControls}
        {...plotControls.histogram}
        binWidthRange={{ min: 1, max: 12, unit: 'month' }}
        binWidthStep={1}
        selectedUnit={'month'}
        containerStyles={{
          maxWidth: `calc(${toCSSLength(args.width)} - 25px)`,
          marginLeft: 25,
        }}
      />
      <div>Note: bin width slider is known to be broken.</div>
    </div>
  );
};

// Dates with range selection
export const DateRangeSelection = TemplateWithSelectedDateRangeControls.bind(
  {}
);
DateRangeSelection.args = {
  title: 'VEuPathDB github repo creation dates',
  height: 400,
  width: 1000,
};

//@ts-ignore
DateRangeSelection.loaders = [
  async () => ({
    apiData: await binGithubEventDates({
      numBins: 10,
      url: 'https://api.github.com/users/VEuPathDB/repos?sort=created',
      unit: 'month',
    }),
  }),
];

export const EmptyData: Story = (args) => {
  return (
    <Histogram
      data={{ series: [] }}
      width="100vw"
      height="100vh"
      barLayout="stack"
      orientation="horizontal"
    />
  );
};

function toCSSLength(length: string | number): string {
  return typeof length === 'number' ? `${length}px` : length;
}
