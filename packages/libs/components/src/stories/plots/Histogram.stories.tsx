import React, { useEffect, useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import {
  NumberRange,
  NumberOrDateRange,
  NumberOrTimeDelta,
  TimeDelta,
} from '../../types/general';

import Histogram, { HistogramProps } from '../../plots/Histogram';
import HistogramControls from '../../components/plotControls/HistogramControls';
import AxisRangeControl from '../../components/plotControls/AxisRangeControl';
import { binDailyCovidStats } from '../api/covidData';
import { binGithubEventDates } from '../api/githubDates';
import {
  HistogramData,
  AxisTruncationConfig,
  FacetedData,
} from '../../types/plots';
import FacetedHistogram from '../../plots/facetedPlots/FacetedHistogram';

export default {
  title: 'Plots/Histogram',
  component: Histogram,
} as Meta;

const TemplateWithMinimalControls: Story<Omit<HistogramProps, 'data'>> = (
  args
) => {
  const [data, setData] = useState<HistogramData>();
  const [binWidth, setBinWidth] = useState<number>(500);
  const [loading, setLoading] = useState<boolean>(true);

  const handleBinWidthChange = async (newBinWidth: NumberOrTimeDelta) => {
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

export const NoTitleFullWidth = TemplateWithMinimalControls.bind({});
NoTitleFullWidth.args = {
  containerStyles: {},
  spacingOptions: {
    marginTop: 20,
    marginBottom: 20,
  },
  interactive: false,
};

const TemplateWithSelectedRangeControls: Story<Omit<HistogramProps, 'data'>> = (
  args
) => {
  const [data, setData] = useState<HistogramData>();
  const [binWidth, setBinWidth] = useState<number>(500);
  const [selectedRange, setSelectedRange] = useState<NumberOrDateRange>();
  const [loading, setLoading] = useState<boolean>(true);
  const [independentAxisRange, setIndependentAxisRange] =
    useState<NumberOrDateRange>();

  const handleBinWidthChange = async (newBinWidth: NumberOrTimeDelta) => {
    if (newBinWidth > 0) {
      setBinWidth(newBinWidth as number);
    }
  };

  const handleSelectedRangeChange = async (newRange?: NumberOrDateRange) => {
    setSelectedRange(newRange);
  };

  const handleIndependentAxisRangeChange = async (
    newRange?: NumberOrDateRange
  ) => {
    setIndependentAxisRange(newRange);
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
        independentAxisRange={independentAxisRange}
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
      <AxisRangeControl
        label="Manual x-range control (you can only set it wider than data range)"
        range={independentAxisRange}
        onRangeChange={handleIndependentAxisRangeChange}
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

const TemplateWithSelectedDateRangeControls: Story<
  Omit<HistogramProps, 'data'>
> = (args) => {
  const [data, setData] = useState<HistogramData>();
  const [selectedRange, setSelectedRange] = useState<NumberOrDateRange>();
  const [loading, setLoading] = useState<boolean>(true);
  const [independentAxisRange, setIndependentAxisRange] =
    useState<NumberOrDateRange>();
  const [binWidth, setBinWidth] = useState<NumberOrTimeDelta>({
    value: 1,
    unit: 'month',
  });
  const unit = (binWidth as TimeDelta).unit;

  const handleSelectedRangeChange = async (newRange?: NumberOrDateRange) => {
    setSelectedRange(newRange);
  };

  const handleUnitChange = async (newUnit: string) => {
    const oldValue: number = (binWidth as TimeDelta).value;
    const newValue = newUnit === 'week' ? oldValue * 4 : oldValue / 4;
    setBinWidth({ value: Math.floor(Math.max(1, newValue)), unit: newUnit });
  };

  const handleBinWidthChange = async (newBinWidth: NumberOrTimeDelta) =>
    setBinWidth(newBinWidth);

  const handleIndependentAxisRangeChange = async (
    newRange?: NumberOrDateRange
  ) => {
    setIndependentAxisRange(newRange);
  };

  // keep `data` up to date
  useEffect(() => {
    setLoading(true);
    binGithubEventDates({
      url: 'https://api.github.com/users/VEuPathDB/repos?sort=created',
      unit: unit === 'week' ? 'week' : 'month', // just to get round type issue
      binWidth: binWidth as TimeDelta,
    }).then((data) => {
      setData(data);
      setLoading(false);
    });
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
        selectedRange={selectedRange}
        onSelectedRangeChange={handleSelectedRangeChange}
        independentAxisRange={independentAxisRange}
      />
      <div style={{ height: 25 }} />
      <HistogramControls
        valueType="date"
        selectedRange={selectedRange}
        onSelectedRangeChange={handleSelectedRangeChange}
        binWidth={binWidth}
        onBinWidthChange={handleBinWidthChange}
        binWidthRange={
          unit === 'month'
            ? { min: 1, max: 12, unit: 'month' }
            : { min: 1, max: 52, unit: 'week' }
        }
        selectedUnit={unit}
        availableUnits={['week', 'month']}
        onSelectedUnitChange={handleUnitChange}
      />
      <AxisRangeControl
        label="Manual x-range control (you can only set it wider than data range)"
        range={independentAxisRange}
        onRangeChange={handleIndependentAxisRangeChange}
        valueType="date"
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

export const EmptyData: Story<HistogramProps> = (args) => (
  <Histogram {...args} />
);
EmptyData.args = {
  containerStyles: {
    height: '400px',
    width: '800px',
  },
  barLayout: 'stack',
  orientation: 'vertical',
};

export const EmptyDataLoading: Story<HistogramProps> = (args) => (
  <Histogram {...args} />
);
EmptyDataLoading.args = {
  ...EmptyData.args,
  showSpinner: true,
};

const TemplateStaticWithRangeControls: Story<HistogramProps> = (args) => {
  const [dependentAxisRange, setDependentAxisRange] = useState<NumberRange>();
  const [independentAxisRange, setIndependentAxisRange] =
    useState<NumberOrDateRange>();

  const [axisTruncationConfig, setAxisTruncationConfig] =
    useState<AxisTruncationConfig>({});

  const handleDependentAxisRangeChange = async (
    newRange?: NumberOrDateRange
  ) => {
    setDependentAxisRange(newRange as NumberRange);
  };

  const handleIndependentAxisRangeChange = async (
    newRange?: NumberOrDateRange
  ) => {
    setIndependentAxisRange(newRange);
  };

  // here we figure out if any of the axes are truncated
  useEffect(() => {
    if (args.data == null) {
      setAxisTruncationConfig({});
      return;
    }

    const allBins = args.data.series.flatMap((series) => series.bins);

    // if min is to the right of more than one binStart
    // then it's left-truncated. (Histogram now adjusts the x-range to include partially cut off bins.)
    const leftTruncated =
      independentAxisRange?.min != null &&
      allBins.filter((bin) => independentAxisRange.min >= bin.binStart).length >
        1;

    // if max is to the left of more than one binEnd
    // then it's right-truncated. (Histogram now adjusts the x-range to include partially cut off bins.)
    const rightTruncated =
      independentAxisRange?.max != null &&
      allBins.filter((bin) => independentAxisRange.max <= bin.binEnd).length >
        1;

    // filter to keep only bins that would be kept on the x-axis
    const xFilteredBins = allBins.filter(
      (bin) =>
        (independentAxisRange?.min == null ||
          bin.binEnd > independentAxisRange?.min) &&
        (independentAxisRange?.max == null ||
          bin.binStart < independentAxisRange?.max)
    );

    const topTruncated =
      dependentAxisRange?.max != null &&
      xFilteredBins.filter((bin) => bin.value > dependentAxisRange.max).length >
        0;

    const bottomTruncated =
      dependentAxisRange?.min != null &&
      xFilteredBins.filter((bin) => bin.value < dependentAxisRange.min).length >
        0;

    setAxisTruncationConfig({
      independentAxis: { min: leftTruncated, max: rightTruncated },
      dependentAxis: { min: bottomTruncated, max: topTruncated },
    });
  }, [args.data, dependentAxisRange, independentAxisRange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Histogram
        {...args}
        axisTruncationConfig={axisTruncationConfig}
        independentAxisRange={independentAxisRange}
        dependentAxisRange={dependentAxisRange}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}
      >
        <AxisRangeControl
          label="Y-Axis Range"
          range={dependentAxisRange}
          onRangeChange={handleDependentAxisRangeChange}
        />
        <AxisRangeControl
          label="X-Axis Range"
          range={independentAxisRange}
          onRangeChange={handleIndependentAxisRangeChange}
        />
      </div>
    </div>
  );
};

const staticData = {
  series: [
    {
      name: 'penguins',
      // added 0 for testing purpose
      bins: [0, 42, 11, 99, 23, 7, 9].map((num, index) => ({
        binStart: index + 1,
        binEnd: index + 2,
        binLabel: `${index + 1} to ${index + 2}`,
        value: num,
      })),
    },
  ],
};

export const StaticDataWithRangeControls = TemplateStaticWithRangeControls.bind(
  {}
);
StaticDataWithRangeControls.args = {
  data: staticData,
  interactive: true,
};

export const ShowValues = TemplateStaticWithRangeControls.bind({});
ShowValues.args = {
  data: {
    series: [
      {
        name: 'penguins',
        // added 0 for testing purpose
        bins: [0, 42, 11, 99, 23, 7, 9].map((num, index) => ({
          binStart: index + 1,
          binEnd: index + 2,
          binLabel: `${index + 1} to ${index + 2}`,
          value: num / 10,
        })),
      },
    ],
  },
  interactive: true,
  showValues: true,
};

/**
 * FACETING
 */

const facetedData: FacetedData<HistogramData> = {
  facets: [
    {
      label: 'Emperor',
      data: staticData,
    },
    {
      label: 'Gentoo',
      data: staticData,
    },
    {
      label: 'Rockhopper',
      data: staticData,
    },
    {
      label: 'African',
      data: staticData,
    },
    {
      label: 'Madagascar',
    },
    {
      label: 'No data',
      data: staticData,
    },
  ],
};

interface FacetedStoryProps {
  data: FacetedData<HistogramData>;
  componentProps: HistogramProps;
  modalComponentProps: HistogramProps;
}

const FacetedTemplate: Story<FacetedStoryProps> = ({
  data,
  componentProps,
  modalComponentProps,
}) => (
  <FacetedHistogram
    data={data}
    componentProps={componentProps}
    modalComponentProps={modalComponentProps}
  />
);

export const Faceted = FacetedTemplate.bind({});
Faceted.args = {
  data: facetedData,
  componentProps: {
    title: 'Penguins',
    containerStyles: {
      width: 300,
      height: 300,
      border: '1px solid #dadada',
    },
  },
  modalComponentProps: {
    containerStyles: {
      width: '85%',
      height: '100%',
      margin: 'auto',
    },
  },
};
