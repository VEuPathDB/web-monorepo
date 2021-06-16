import React, { useEffect, useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import {
  NumberOrDateRange,
  TimeDeltaRange,
  NumberOrTimeDelta,
} from '../../types/general';

import Histogram, { HistogramProps } from '../../plots/Histogram';
import HistogramControls from '../../components/plotControls/HistogramControls';
import { binDailyCovidStats } from '../api/covidData';
import { binGithubEventDates } from '../api/githubDates';
import { HistogramData, EmptyHistogramData } from '../../types/plots';

export default {
  title: 'Plots/Histogram',
  component: Histogram,
} as Meta;

const TemplateWithMinimalControls: Story<Omit<HistogramProps, 'data'>> = (
  args
) => {
  const [data, setData] = useState<HistogramData>(EmptyHistogramData);
  const [binWidth, setBinWidth] = useState<number>(500);

  const handleBinWidthChange = async ({
    binWidth: newBinWidth,
  }: {
    binWidth: NumberOrTimeDelta;
  }) => {
    if (newBinWidth > 0) {
      setBinWidth(newBinWidth as number);
    }
  };

  // keep `data` up to date
  useEffect(() => {
    binDailyCovidStats(binWidth).then((data) => setData(data));
  }, [binWidth]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Histogram data={data} {...args} />
      <div style={{ height: 25 }} />
      <HistogramControls
        label="Histogram Controls"
        valueType="number"
        binWidthRange={{ min: 100, max: 1000 }}
        binWidthStep={100}
        binWidth={binWidth}
        onBinWidthChange={handleBinWidthChange}
      />
    </div>
  );
};

export const SomeCovidData = TemplateWithMinimalControls.bind({});
SomeCovidData.args = {
  title: 'Some Current Covid Data in U.S. States',
  containerStyles: {
    height: '400px',
    width: '800px',
  },
};

export const NoTitle = TemplateWithMinimalControls.bind({});
NoTitle.args = {
  containerStyles: {
    height: '400px',
    width: '100%',
  },
  spacingOptions: {
    marginTop: 20,
    marginBottom: 20,
  },
};

const TemplateWithSelectedRangeControls: Story<Omit<HistogramProps, 'data'>> = (
  args
) => {
  const [data, setData] = useState<HistogramData>(EmptyHistogramData);
  const [binWidth, setBinWidth] = useState<number>(500);
  const [selectedRange, setSelectedRange] = useState<NumberOrDateRange>();

  const handleBinWidthChange = async ({
    binWidth: newBinWidth,
  }: {
    binWidth: NumberOrTimeDelta;
  }) => {
    if (newBinWidth > 0) {
      setBinWidth(newBinWidth as number);
    }
  };

  const handleSelectedRangeChange = async (newRange?: NumberOrDateRange) => {
    setSelectedRange(newRange);
  };

  // keep `data` up to date
  useEffect(() => {
    binDailyCovidStats(binWidth).then((data) => setData(data));
  }, [binWidth]);

  // report changes on the histogram's selected range.
  useEffect(() => {
    if (selectedRange) {
      console.log(
        `The story received a new range: ${selectedRange.min} to ${selectedRange.max}`
      );
    }
  }, [selectedRange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Histogram
        data={data}
        {...args}
        interactive={true}
        selectedRange={selectedRange}
        onSelectedRangeChange={handleSelectedRangeChange}
      />
      <div style={{ height: 25 }} />
      <HistogramControls
        label="Histogram Controls"
        valueType="number"
        binWidthRange={{ min: 100, max: 1000 }}
        binWidthStep={100}
        binWidth={binWidth}
        onBinWidthChange={handleBinWidthChange}
        selectedRange={selectedRange}
        onSelectedRangeChange={handleSelectedRangeChange}
      />
    </div>
  );
};

export const RangeSelection = TemplateWithSelectedRangeControls.bind({});
RangeSelection.args = {
  title: 'Some Current Covid Data in U.S. States',
  containerStyles: {
    height: '400px',
    width: '800px',
  },
};

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
  containerStyles: {
    height: '400px',
    width: '800px',
  },
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
  containerStyles: {
    height: '400px',
    width: '800px',
  },
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
  containerStyles: {
    height: '400px',
    width: '800px',
  },
  interactive: true,
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
      containerStyles={{
        height: '400px',
        width: '800px',
      }}
      barLayout="stack"
      orientation="horizontal"
    />
  );
};

export const EmptyDataLoading: Story = (args) => {
  return (
    <Histogram
      data={{ series: [] }}
      containerStyles={{
        height: '400px',
        width: '800px',
      }}
      barLayout="stack"
      orientation="horizontal"
      showSpinner={true}
    />
  );
};
