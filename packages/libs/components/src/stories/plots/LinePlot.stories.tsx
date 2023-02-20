import React, { useEffect, useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import LinePlot, { LinePlotProps } from '../../plots/LinePlot';
import { FacetedData, LinePlotData } from '../../types/plots';
import FacetedLinePlot from '../../plots/facetedPlots/FacetedLinePlot';
import AxisRangeControl from '../../components/plotControls/AxisRangeControl';
import {
  NumberRange,
  NumberOrDateRange,
  NumberOrTimeDelta,
  TimeDelta,
} from '../../types/general';
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
  const [dependentAxisLogScale, setDependentAxisLogScale] = useState<
    boolean | undefined
  >(false);

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
