// A collection of stories for viewing our Sequential Gradient Colormap
import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import PlotLegend from '../../components/plotControls/PlotLegend';
import { PlotLegendGradientProps } from '../../components/plotControls/PlotGradientLegend';
import ScatterPlot from '../../plots/ScatterPlot';
import { min, max } from 'lodash';
import {
  dataSetSequentialGradient,
  dataSetSequentialDiscrete,
  processInputData,
} from '../plots/ScatterPlot.storyData';
import { gradientSequentialColorscaleMap } from '../../types/plots/addOns';
import { VEuPathDBScatterPlotData } from '../plots/ScatterPlot.storyData';
import { PlotLegendProps } from '../../components/plotControls/PlotLegend';
import SliderWidget, {
  SliderWidgetProps,
} from '../../components/widgets/Slider';

// A collection of stories for viewing our Sequential Gradient Colormap
export default {
  title: 'Colors/Gradient Sequential',
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

interface TemplateProps {
  data: VEuPathDBScatterPlotData;
  plotLegendProps: PlotLegendProps;
  nPoints?: number;
}

// Template for these colormap stories. Show a scatterplot with overlay, as well as legend so we can see the colormap.
const Template: Story<TemplateProps> = (args) => {
  const { dataSetProcess: dataSetProcessGradient } = processInputData(
    args.data,
    'scatterplot',
    'markers',
    'number',
    'number',
    false
  );

  dataSetProcessGradient.series[0].x = dataSetProcessGradient.series[0].x.slice(
    0,
    args.nPoints
  );
  dataSetProcessGradient.series[0].y = dataSetProcessGradient.series[0].y.slice(
    0,
    args.nPoints
  );

  const [yMin, yMax] = [
    min(dataSetProcessGradient.series[0].y),
    max(dataSetProcessGradient.series[0].y),
  ];

  // Opacity slider state
  const [markerBodyOpacity, setMarkerBodyOpacity] = useState(0);

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
        value={0}
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
        data={dataSetProcessGradient}
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

// Showcase the continuous version of the sequential gradient colormap. Overlay values are drawn from
// a continuous distribution

// Setup gradient colorscale legend
const gradientLegendProps = {
  legendMax: max(
    dataSetSequentialGradient.scatterplot.data[0]
      .seriesGradientColorscale as number[]
  ),
  legendMin: min(
    dataSetSequentialGradient.scatterplot.data[0]
      .seriesGradientColorscale as number[]
  ),
  gradientColorscaleType: 'sequential',
  // MUST be odd!
  nTicks: 5,
  showMissingness: false,
  legendTitle: 'legend',
};

export const Continuous = Template.bind({});
Continuous.args = {
  data: dataSetSequentialGradient,
  plotLegendProps: {
    type: 'colorscale',
    ...(gradientLegendProps as PlotLegendGradientProps),
  },
  nPoints: 120,
};

// Showcase discretized version of the sequential gradient colormap. For this story,
// the overlay var is a low cardinality, equidistant set of integers.
const vocabularyEquidistant = ['1', '2', '3', '4', '5', '6', '7'];
let legendItems = vocabularyEquidistant.map((label) => {
  return {
    label,
    marker: 'square',
    markerColor: gradientSequentialColorscaleMap(
      vocabularyEquidistant.indexOf(label) / (vocabularyEquidistant.length - 1)
    ),
    hasData: true,
    group: 1,
    rank: 1,
  };
});

export const Discrete = Template.bind({});
Discrete.args = {
  data: dataSetSequentialDiscrete,
  plotLegendProps: {
    type: 'list',
    legendItems: legendItems,
    checkedLegendItems: vocabularyEquidistant,
    showOverlayLegend: true,
  },
  nPoints: 120,
};

// Showcase discretized version of the sequential gradient colormap. For this story,
// the overlay var is a low cardinality variable with non-uniform spacing between neighboring values.
const vocabularyNonUniform = ['1', '2', '5', '6', '7', '18', '20'];
legendItems = vocabularyNonUniform.map((label) => {
  return {
    label,
    marker: 'square',
    markerColor: gradientSequentialColorscaleMap(
      +label / (max(vocabularyNonUniform.map(Number))! - 1)
    ),
    hasData: true,
    group: 1,
    rank: 1,
  };
});

// Replace a few values in the original data so that we have values that are not uniform from their neighbors.
let dataSetSequentialDiscreteNonUniform: VEuPathDBScatterPlotData = JSON.parse(
  JSON.stringify(dataSetSequentialDiscrete)
);
dataSetSequentialDiscreteNonUniform.scatterplot.data[0].seriesGradientColorscale?.forEach(
  (val, index, arr) => {
    val === 3 ? (arr[index] = 18) : val === 4 ? (arr[index] = 20) : val;
  }
);

export const DiscreteNonUniform = Template.bind({});
DiscreteNonUniform.args = {
  data: dataSetSequentialDiscreteNonUniform,
  plotLegendProps: {
    type: 'list',
    legendItems: legendItems,
    checkedLegendItems: vocabularyNonUniform,
    showOverlayLegend: true,
  },
  nPoints: 120,
};
