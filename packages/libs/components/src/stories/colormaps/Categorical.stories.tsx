import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import PlotLegend from '../../components/plotControls/PlotLegend';
import ScatterPlot from '../../plots/ScatterPlot';
import { min, max } from 'lodash';
import {
  dataSetCategoricalOverlay,
  processInputData,
} from '../plots/ScatterPlot.storyData';
import {
  ColorPaletteDefault,
  ColorPaletteOrdinal,
} from '../../types/plots/addOns';
import { VEuPathDBScatterPlotData } from '../plots/ScatterPlot.storyData';
import { PlotLegendProps } from '../../components/plotControls/PlotLegend';
import SliderWidget, {
  SliderWidgetProps,
} from '../../components/widgets/Slider';
import { LegendItemsProps } from '../../components/plotControls/PlotListLegend';

// A collection of stories for vieweing our categorical colormaps
export default {
  title: 'Colors/Categorical',
  component: ScatterPlot,
  argTypes: {
    nPoints: {
      control: { type: 'range', min: 5, max: 300, step: 5 },
    },
  },
} as Meta;

// set some default props
const plotWidth = 1000;
const plotHeight = 600;
const independentAxisLabel = 'independent axis label';
const dependentAxisLabel = 'dependent axis label';

// Create a template for the categorical colormap stories.
// Show a scatterplot with overlay, as well as legend so we can see the colormap.
interface TemplateProps {
  data: VEuPathDBScatterPlotData;
  plotLegendProps: PlotLegendProps;
  nPoints: number;
}

const Template: Story<TemplateProps> = (args) => {
  const { dataSetProcess: datasetProcessCategorical } = processInputData(
    args.data,
    'scatterplot',
    'markers',
    'number',
    'number',
    false,
    ColorPaletteDefault
  );

  // Reduce the input data to only approximately nPoints points. There will be multiple series so we have to
  // slice each series at nPoints/nSeries.
  const trimmedDatasetProcess = {
    ...datasetProcessCategorical,
    series: datasetProcessCategorical.series.map(({ x, y, ...rest }: any) => ({
      x: x.slice(
        0,
        Math.ceil(args.nPoints / datasetProcessCategorical.series.length)
      ),
      y: y.slice(
        0,
        Math.ceil(args.nPoints / datasetProcessCategorical.series.length)
      ),
      ...rest,
    })),
  };

  // Find the y axis min and max
  const [yMin, yMax] = [
    min(trimmedDatasetProcess.series[0].y),
    max(trimmedDatasetProcess.series[0].y),
  ];

  // Opacity slider state
  const [markerBodyOpacity, setMarkerBodyOpacity] = useState(1);

  // Opacity slider coloring
  const opacityColorSpecProps: SliderWidgetProps['colorSpec'] = {
    type: 'gradient',
    tooltip: '#aaa',
    knobColor: '#aaa',
    trackGradientStart: '#fff',
    trackGradientEnd: '#000',
  };

  // For each colormap, show the legend, an example plot, and our opacity slider.
  return (
    <div
      style={{
        padding: 25,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
      }}
    >
      <PlotLegend {...args.plotLegendProps} />
      <SliderWidget
        minimum={0}
        maximum={1}
        step={0.05}
        value={1}
        debounceRateMs={250}
        onChange={(newValue: number) => {
          setMarkerBodyOpacity(newValue);
        }}
        containerStyles={{
          height: 100,
          width: 425,
          marginLeft: 75,
        }}
        showLimits={true}
        label={'Marker opacity'}
        disabled={false}
        colorSpec={opacityColorSpecProps}
      />
      <ScatterPlot
        data={trimmedDatasetProcess}
        independentAxisLabel={independentAxisLabel}
        dependentAxisLabel={dependentAxisLabel}
        // not to use independentAxisRange
        // independentAxisRange={[xMin, xMax]}
        dependentAxisRange={{ min: yMin as string, max: yMax as string }}
        // title={Scatter with Colormap}
        // width height is replaced with containerStyles
        containerStyles={{
          width: plotWidth,
          height: plotHeight,
        }}
        // staticPlot is changed to interactive
        interactive={true}
        // check enable/disable legend and built-in controls
        displayLegend={false}
        displayLibraryControls={true}
        independentValueType={'number'}
        dependentValueType={'number'}
        markerBodyOpacity={markerBodyOpacity}
      />
    </div>
  );
};

// Showcase default categorical colormap.

const vocabulary = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const legendItems: LegendItemsProps[] = vocabulary.map((label) => {
  return {
    label,
    marker: 'square',
    markerColor: ColorPaletteDefault[vocabulary.indexOf(label)],
    hasData: true,
    group: 1,
    rank: 1,
  };
});

export const Default = Template.bind({});
Default.args = {
  data: dataSetCategoricalOverlay,
  plotLegendProps: {
    type: 'list',
    legendItems: legendItems,
    checkedLegendItems: vocabulary,
    showOverlayLegend: true,
  },
  nPoints: 120,
};

// Showcase ordinal categorical colormap. (Ordinal colormap itself still a work in progress)

const ordinalLegendItems: LegendItemsProps[] = vocabulary.map((label) => {
  return {
    label,
    marker: 'square',
    markerColor: ColorPaletteOrdinal[vocabulary.indexOf(label)],
    hasData: true,
    group: 1,
    rank: 1,
  };
});

export const Ordinal = Template.bind({});
Ordinal.args = {
  data: dataSetCategoricalOverlay,
  plotLegendProps: {
    type: 'list',
    legendItems: ordinalLegendItems,
    checkedLegendItems: vocabulary,
    showOverlayLegend: true,
  },
  nPoints: 120,
};
