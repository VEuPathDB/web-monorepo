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
  const [loading, setLoading] = useState<boolean>(true);

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
    setLoading(true);
    binDailyCovidStats(binWidth).then((data) => {
      setData(data);
      setLoading(false);
    });
    return () => setLoading(false);
  }, [binWidth]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Histogram data={data} {...args} showSpinner={loading} />
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
  const [loading, setLoading] = useState<boolean>(true);

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
    setLoading(true);
    binDailyCovidStats(binWidth).then((data) => {
      setData(data);
      setLoading(false);
    });
    return () => setLoading(false);
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
        showSpinner={loading}
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

// no controls, no spinner
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
      url: 'https://api.github.com/users/VEuPathDB/events?per_page=50',
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

const TemplateWithSelectedDateRangeControls: Story<Omit<
  HistogramProps,
  'data'
>> = (args) => {
  const [data, setData] = useState<HistogramData>(EmptyHistogramData);
  const [selectedRange, setSelectedRange] = useState<NumberOrDateRange>();
  const [loading, setLoading] = useState<boolean>(true);

  const handleSelectedRangeChange = async (newRange?: NumberOrDateRange) => {
    setSelectedRange(newRange);
  };

  // keep `data` up to date
  useEffect(() => {
    setLoading(true);
    binGithubEventDates({
      url: 'https://api.github.com/users/VEuPathDB/repos?sort=created',
      unit: 'month',
      numBins: 10,
    }).then((data) => {
      setData(data);
      setLoading(false);
    });
  }, []);

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
        showSpinner={loading}
        interactive={true}
        selectedRange={selectedRange}
        onSelectedRangeChange={handleSelectedRangeChange}
      />
      <div style={{ height: 25 }} />
      <HistogramControls
        label="Histogram Controls"
        valueType="date"
        selectedRange={selectedRange}
        onSelectedRangeChange={handleSelectedRangeChange}
      />
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
