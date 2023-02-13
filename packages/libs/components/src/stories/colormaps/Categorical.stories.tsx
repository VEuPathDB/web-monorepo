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

interface TemplateProps {
  data: VEuPathDBScatterPlotData;
  plotLegendProps: PlotLegendProps;
  nPoints: number;
}

// Template for these colormap stories. Show a scatterplot with overlay, as well as legend so we can see the colormap.
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
  //   const trimmedDatasetCategorical = {
  //     ...datasetProcessCategorical,
  //     // Being lazy with types here, Ann return to this and fix
  //     series: datasetProcessCategorical.series.map(({x, y, ...rest}: any) => ({x: x.slice(), y: y.slice(), ...rest})),
  //  };
  for (
    let index = 0;
    index < datasetProcessCategorical.series.length;
    index++
  ) {
    datasetProcessCategorical.series[
      index
    ].x = datasetProcessCategorical.series[index].x.slice(
      0,
      Math.ceil(args.nPoints / datasetProcessCategorical.series.length)
    );
    datasetProcessCategorical.series[
      index
    ].y = datasetProcessCategorical.series[index].y.slice(
      0,
      Math.ceil(args.nPoints / datasetProcessCategorical.series.length)
    );
  }

  const [yMin, yMax] = [
    min(datasetProcessCategorical.series[0].y),
    max(datasetProcessCategorical.series[0].y),
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
        data={datasetProcessCategorical}
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

const legendItems = vocabulary.map((label) => {
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

// Showcase ordinal categorical colormap.

const ordinalLegendItems = vocabulary.map((label) => {
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
