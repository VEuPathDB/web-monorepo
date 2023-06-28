import React, { useEffect, useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import LinePlot, { LinePlotProps } from '../../plots/LinePlot';
import { FacetedData, LinePlotData } from '../../types/plots';
import FacetedLinePlot from '../../plots/facetedPlots/FacetedLinePlot';
import AxisRangeControl from '../../components/plotControls/AxisRangeControl';
import { NumberOrDateRange } from '../../types/general';
import { Toggle } from '@veupathdb/coreui';
import { LinePlotDataSeries } from '../../types/plots';

export default {
  title: 'Plots/LinePlot',
  component: LinePlot,
} as Meta;

const modeValue: LinePlotDataSeries['mode'] = 'lines+markers';

const dataSet = {
  series: [
    {
      x: [0, 2, 5, 8, 12],
      y: [4, 8, 3, 12, 11],
      name: 'Cats',
    },
    {
      x: [0, 2, 5, 8, 12],
      y: [6, 11, 4, 10, 13],
      name: 'Dogs',
    },
  ],
};

const errorBarData = {
  series: [
    {
      ...dataSet.series[0],
      yErrorBarUpper: [5, 9, 5, 14, 12.5],
      yErrorBarLower: [3, 6, 1, 10, 9.5],
      binLabel: ['[0,2)', '[2,5)', '[5,8)', '[8,12)', '[12,15)'],
      sampleSize: [5, 60, 43, 22, 11, 99],
    },
    {
      ...dataSet.series[1],
      yErrorBarUpper: [7, 12, 6, 12, 14.5],
      yErrorBarLower: [5, 10, 2, 8, 11.5],
      binLabel: ['[0,2)', '[2,5)', '[5,8)', '[8,12)', '[12,15)'],
      sampleSize: [11, 22, 33, 44, 55, 66],
    },
  ],
};

const markerTooltipData = {
  series: [
    {
      ...dataSet.series[0],
      extraTooltipText: ['n: 1', 'n: 2', 'n: 3', 'n: 4', 'n: 5'],
      mode: modeValue,
    },
    {
      x: [0, 2, 5, 8, 12],
      y: [6, 8, 4, 10, 11],
      name: 'Dogs',
      extraTooltipText: ['n: 5', 'n: 4', 'n: 3', 'n: 2', 'n: 1'],
      mode: modeValue,
    },
    {
      x: [0, 2, 5, 8, 12],
      y: [12, 10, 6, 1, 11],
      name: 'Turtles',
      extraTooltipText: ['n: 3', 'n: 6', 'n: 9', 'n: 12', 'n: 15'],
      mode: modeValue,
    },
  ],
};

const Template: Story<LinePlotProps> = (args) => <LinePlot {...args} />;
export const Basic = Template.bind({});
Basic.args = {
  data: dataSet,
  dependentAxisLabel: 'Awesomeness',
  independentAxisLabel: 'Age',
  legendTitle: 'Animal',
  title: 'Awesomeness of animals',
  interactive: true,
};

export const ErrorBars = Template.bind({});
ErrorBars.args = {
  data: errorBarData,
  dependentAxisLabel: 'Awesomeness with error bars',
  independentAxisLabel: 'Age',
  legendTitle: 'Animal',
  title: 'Awesomeness of animals',
};

export const EmptyData = Template.bind({});
EmptyData.args = {
  dependentAxisLabel: 'Dependent axis label',
  independentAxisLabel: 'Independent axis label',
};

export const EmptyDataLoading = Template.bind({});
EmptyDataLoading.args = {
  dependentAxisLabel: 'Dependent axis label',
  independentAxisLabel: 'Independent axis label',
  showSpinner: true,
};

export const NoDataOverlay = Template.bind({});
NoDataOverlay.args = {
  dependentAxisLabel: 'Dependent axis label',
  independentAxisLabel: 'Independent axis label',
  showNoDataOverlay: true,
  title: 'Awesomeness of animals',
};

export const MarkerTooltips = Template.bind({});
MarkerTooltips.args = {
  data: markerTooltipData,
  dependentAxisLabel: 'Awesomeness',
  independentAxisLabel: 'Age',
  legendTitle: 'Animal',
  title: 'Awesomeness of animals',
  interactive: true,
};

/**
 * FACETING
 */

const facetedData: FacetedData<LinePlotData> = {
  facets: [
    {
      label: 'indoors',
      data: dataSet,
    },
    {
      label: 'outdoors',
      data: dataSet,
    },
    {
      label: 'space',
      data: dataSet,
    },
    {
      label: 'volcano',
      data: dataSet,
    },
    {
      label: 'underwater',
      data: dataSet,
    },
    {
      label: 'imaginary',
    },
    {
      label: 'No data',
    },
  ],
};

interface FacetedStoryProps {
  data: FacetedData<LinePlotData>;
  componentProps: LinePlotProps;
  modalComponentProps: LinePlotProps;
}

const FacetedTemplate: Story<FacetedStoryProps> = ({
  data,
  componentProps,
  modalComponentProps,
}) => (
  <FacetedLinePlot
    data={data}
    componentProps={componentProps}
    modalComponentProps={modalComponentProps}
  />
);

export const Faceted = FacetedTemplate.bind({});
Faceted.args = {
  data: facetedData,
  componentProps: {
    title: 'indoor and outdoor pets',
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

// testing log scale
const dataSetLog = {
  series: [
    {
      x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      y: [33, 36, 35, 37, 35, 34, 35, 36, 33, 37, 35],
      name: 'data',
    },
  ],
};

const TemplateWithSelectedRangeControls: Story<Omit<LinePlotProps, 'data'>> = (
  args
) => {
  const [dependentAxisRange, setDependentAxisRange] = useState<
    NumberOrDateRange | undefined
  >({ min: 1, max: 80 });
  const [dependentAxisLogScale, setDependentAxisLogScale] =
    useState<boolean | undefined>(false);

  const handleDependentAxisRangeChange = async (
    newRange?: NumberOrDateRange
  ) => {
    setDependentAxisRange(newRange);
  };

  const onDependentAxisLogScaleChange = async (value?: boolean) => {
    setDependentAxisLogScale(value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <LinePlot
        data={dataSetLog}
        {...args}
        dependentAxisRange={dependentAxisRange}
        dependentAxisLogScale={dependentAxisLogScale}
      />
      <Toggle
        label={`Log scale ${
          dependentAxisLogScale ? 'on (excludes values \u{2264} 0)' : 'off'
        }`}
        value={dependentAxisLogScale ?? false}
        onChange={onDependentAxisLogScaleChange}
        styleOverrides={{ container: { marginLeft: '5em' } }}
      />
      <div style={{ height: 25 }} />
      <AxisRangeControl
        label="Y-axis range control"
        range={dependentAxisRange}
        onRangeChange={handleDependentAxisRangeChange}
        containerStyles={{ marginLeft: '5em' }}
      />
    </div>
  );
};

export const LogScale = TemplateWithSelectedRangeControls.bind({});
LogScale.args = {
  containerStyles: {
    height: '450px',
    width: '750px',
  },
};

// testing svg text (tooltip) for a dependent axis label with html tags
export const YAxisLabelWithHtml: Story<Omit<LinePlotProps, 'data'>> = (
  args
) => {
  return (
    <LinePlot
      data={undefined}
      {...args}
      dependentAxisLabel={
        '<b><i>Arithmetic mean:</i></b><br /> Plasmodium asexual stages, by microscopy result'
      }
    />
  );
};

YAxisLabelWithHtml.args = {
  containerStyles: {
    height: '450px',
    width: '750px',
  },
};

// test data for dateDataFormat
const dateData = {
  series: [
    {
      x: ['2017-01-01', '2018-01-01', '2019-01-01'],
      y: [0.5285, 0.5058, 0.4205],
      binLabel: [
        '2017-01-01 - 2018-01-01',
        '2018-01-01 - 2019-01-01',
        '2019-01-01 - 2020-01-01',
      ],
      yErrorBarUpper: [0.5399, 0.5158, 0.4364],
      yErrorBarLower: [0.517, 0.4959, 0.4046],
      extraTooltipText: ['n: 3880/7342', 'n: 4932/9750', 'n: 1556/3700'],
      name: 'Data',
      mode: 'lines+markers',
      opacity: 0.7,
      marker: {
        color: 'rgb(136,34,85)',
        symbol: 'circle',
      },
      line: {
        color: 'rgb(136,34,85)',
        shape: 'linear',
      },
    },
  ],
  binWidthSlider: {
    valueType: 'date',
    binWidth: {
      value: 1,
      unit: 'year',
    },
    binWidthRange: {
      min: 1,
      max: 2,
      unit: 'year',
    },
    binWidthStep: 1,
  },
};

// testing date data format, especially year
export const dateDataFormat: Story<LinePlotProps> = (args: any) => {
  return (
    <LinePlot
      data={dateData}
      dependentAxisLabel={
        '<b><i>Arithmetic mean:</i></b><br /> Plasmodium asexual stages, by microscopy result'
      }
      interactive={true}
      independentValueType={'date'}
      {...args}
    />
  );
};

dateDataFormat.args = {
  containerStyles: {
    height: '450px',
    width: '750px',
  },
};

// mockup data for testing lineplot with marginal histogram
const trace1 = {
  x: [0, 0.2, 0.35, 0.6, 0.8, 1.0],
  y: [1.5, 1, 1.3, 0.7, 0.8, 0.9],
  mode: modeValue,
  name: 'data1',
  marker: {
    color: 'rgb(0, 0, 255)',
  },
};

const trace2 = {
  x: [0, 0.2, 0.35, 0.6, 0.8, 1.0],
  y: [1, 2, 1.3, 0.5, 1.5, 0.75],
  mode: modeValue,
  name: 'data2',
  marker: {
    color: 'rgb(255, 0, 0)',
  },
};

let x1 = [];
let x2 = [];
const arrayLength = 500;
for (var i = 0; i < arrayLength; i++) {
  x1[i] = Math.random();
  x2[i] = Math.random();
}

const trace3 = {
  x: x1,
  y: new Array(arrayLength).fill(0),
  type: 'histogram',
  name: 'data1',
  marker: {
    color: 'rgb(0, 0, 255)',
  },
  // set mode to be undefined for marginal histogram
  mode: undefined,
  // set different yaxis for marginal histogram
  yaxis: 'y2',
};

const trace4 = {
  x: x2,
  y: new Array(arrayLength).fill(0),
  type: 'histogram',
  name: 'data2',
  marker: {
    color: 'rgb(255, 0, 0)',
  },
  // set mode to be undefined for marginal histogram
  mode: undefined,
  // set different yaxis for marginal histogram
  yaxis: 'y2',
};

const lineMarginalHistogramData = {
  series: [trace1, trace2, trace3, trace4],
};

export const LineMarginalHistogram: Story<LinePlotProps> = (args: any) => {
  return (
    <LinePlot
      data={lineMarginalHistogramData}
      independentAxisLabel={'X'}
      dependentAxisLabel={'Y'}
      interactive={true}
      displayLegend={false}
      displayLibraryControls={false}
      containerStyles={{
        height: '450px',
        width: '750px',
      }}
      // show marginal histogram
      showMarginalHistogram={true}
      // marginal histogram size [0, 1]: default is 0.2 (20 %)
      marginalHistogramSize={0.2}
    />
  );
};

// testing xVariable: date with overlay variable
// GEMS1 Case Control; x: Birth date; y: Weight; overlay: Age group at enrollment
const LineMarginalHistogramDateData = {
  series: [
    {
      x: [
        '2006-01-01',
        '2007-01-01',
        '2008-01-01',
        '2009-01-01',
        '2010-01-01',
        '2011-01-01',
      ],
      y: [8.8136, 7.524, 7.26, 7.3144, 6.9045, 4.225],
      binLabel: [
        '2006-01-01 - 2007-01-01',
        '2007-01-01 - 2008-01-01',
        '2008-01-01 - 2009-01-01',
        '2009-01-01 - 2010-01-01',
        '2010-01-01 - 2011-01-01',
        '2011-01-01 - 2012-01-01',
      ],
      yErrorBarUpper: [9.2893, 7.5617, 7.2938, 7.3488, 6.9695, 4.666],
      yErrorBarLower: [8.338, 7.4864, 7.2263, 7.28, 6.8395, 3.784],
      binSampleSize: [
        {
          N: 22,
        },
        {
          N: 5939,
        },
        {
          N: 8210,
        },
        {
          N: 7545,
        },
        {
          N: 2192,
        },
        {
          N: 4,
        },
      ],
      name: '0-11 months',
      mode: modeValue,
      opacity: 0.7,
      marker: {
        color: 'rgb(136,34,85)',
        symbol: 'circle',
      },
    },
    {
      x: [
        '2006-01-01',
        '2007-01-01',
        '2008-01-01',
        '2009-01-01',
        '2010-01-01',
        '2011-01-01',
      ],
      y: [22, 5939, 8210, 7545, 2192, 4],
      width: [
        31536000000, 31536000000, 31622400000, 31536000000, 31536000000,
        31536000000,
      ],
      name: '0-11 months',
      type: 'bar',
      offset: 0,
      marker: {
        color: 'rgb(136,34,85)',
      },
      // set mode to be undefined for marginal histogram
      mode: undefined,
      yaxis: 'y2',
    },
    {
      x: [
        '2005-01-01',
        '2006-01-01',
        '2007-01-01',
        '2008-01-01',
        '2009-01-01',
        '2010-01-01',
      ],
      y: [9.92, 9.4077, 9.2462, 9.1636, 8.8453, 8.6031],
      binLabel: [
        '2005-01-01 - 2006-01-01',
        '2006-01-01 - 2007-01-01',
        '2007-01-01 - 2008-01-01',
        '2008-01-01 - 2009-01-01',
        '2009-01-01 - 2010-01-01',
        '2010-01-01 - 2011-01-01',
      ],
      yErrorBarUpper: [10.819, 9.468, 9.2853, 9.2004, 8.8973, 9.02],
      yErrorBarLower: [9.021, 9.3473, 9.207, 9.1268, 8.7933, 8.1863],
      binSampleSize: [
        {
          N: 5,
        },
        {
          N: 2903,
        },
        {
          N: 6887,
        },
        {
          N: 6783,
        },
        {
          N: 3259,
        },
        {
          N: 32,
        },
      ],
      name: '12-23 months',
      mode: modeValue,
      opacity: 0.7,
      marker: {
        color: 'rgb(136,204,238)',
        symbol: 'circle',
      },
    },
    {
      x: [
        '2005-01-01',
        '2006-01-01',
        '2007-01-01',
        '2008-01-01',
        '2009-01-01',
        '2010-01-01',
      ],
      y: [5, 2903, 6887, 6783, 3259, 32],
      width: [
        31536000000, 31536000000, 31536000000, 31622400000, 31536000000,
        31536000000,
      ],
      name: '12-23 months',
      type: 'bar',
      offset: 0,
      marker: {
        color: 'rgb(136,204,238)',
      },
      // set mode to be undefined for marginal histogram
      mode: undefined,
      yaxis: 'y2',
    },
    {
      x: [
        '2003-01-01',
        '2004-01-01',
        '2005-01-01',
        '2006-01-01',
        '2007-01-01',
        '2008-01-01',
        '2009-01-01',
      ],
      y: [14.6723, 13.7814, 12.6861, 11.7939, 11.3007, 10.9864, 10.2267],
      binLabel: [
        '2003-01-01 - 2004-01-01',
        '2004-01-01 - 2005-01-01',
        '2005-01-01 - 2006-01-01',
        '2006-01-01 - 2007-01-01',
        '2007-01-01 - 2008-01-01',
        '2008-01-01 - 2009-01-01',
        '2009-01-01 - 2010-01-01',
      ],
      yErrorBarUpper: [
        14.9122, 13.9133, 12.764, 11.8511, 11.3585, 11.1436, 10.9616,
      ],
      yErrorBarLower: [
        14.4324, 13.6495, 12.6082, 11.7368, 11.2429, 10.8293, 9.4917,
      ],
      binSampleSize: [
        {
          N: 278,
        },
        {
          N: 1286,
        },
        {
          N: 3184,
        },
        {
          N: 5046,
        },
        {
          N: 3831,
        },
        {
          N: 1704,
        },
        {
          N: 15,
        },
      ],
      name: '24-59 months',
      mode: modeValue,
      opacity: 0.7,
      marker: {
        color: 'rgb(153,153,51)',
        symbol: 'circle',
      },
    },
    {
      x: [
        '2003-01-01',
        '2004-01-01',
        '2005-01-01',
        '2006-01-01',
        '2007-01-01',
        '2008-01-01',
        '2009-01-01',
      ],
      y: [278, 1286, 3184, 5046, 3831, 1704, 15],
      width: [
        31536000000, 31622400000, 31536000000, 31536000000, 31536000000,
        31622400000, 31536000000,
      ],
      name: '24-59 months',
      type: 'bar',
      offset: 0,
      marker: {
        color: 'rgb(153,153,51)',
      },
      // set mode to be undefined for marginal histogram
      mode: undefined,
      yaxis: 'y2',
    },
  ],
};

export const LineMarginalHistogramDate: Story<LinePlotProps> = (args: any) => {
  return (
    <LinePlot
      data={LineMarginalHistogramDateData}
      independentValueType={'date'}
      independentAxisLabel={'X'}
      dependentAxisLabel={'Y'}
      interactive={true}
      displayLegend={false}
      displayLibraryControls={false}
      containerStyles={{
        height: '450px',
        width: '750px',
      }}
      // show marginal histogram
      showMarginalHistogram={true}
      // marginal histogram size [0, 1]: default is 0.2 (20 %)
      marginalHistogramSize={0.2}
    />
  );
};
