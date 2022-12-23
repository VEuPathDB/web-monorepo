import React, { useState } from 'react';
import { Meta } from '@storybook/react/types-6-0';
import PlotLegend from '../../components/plotControls/PlotLegend';
import PlotGradientLegend, {
  PlotLegendGradientProps,
} from '../../components/plotControls/PlotGradientLegend';
import ScatterPlot, { ScatterPlotProps } from '../../plots/ScatterPlot';
import { min, max, lte, gte } from 'lodash';
import {
  dataSetSequentialGradient,
  dataSetSequentialDiscrete,
  processInputData,
} from '../plots/ScatterPlot.storyData';
import {
  gradientSequentialColorscaleMap,
  gradientDivergingColorscaleMap,
} from '../../types/plots/addOns';

export default {
  title: 'Colors/Gradient Sequential',
  component: PlotLegend,
} as Meta;

// set some default props
const plotWidth = 500;
const plotHeight = 400;
// let plotWidth = 350;
// let plotHeight = 250;
const independentAxisLabel = 'independent axis label';
const dependentAxisLabel = 'dependent axis label';
const plotTitle = '';
const independentValueType = 'number';
const dependentValueType = 'number';

const { dataSetProcess: dataSetProcessSequentialGradient } = processInputData(
  dataSetSequentialGradient,
  'scatterplot',
  'markers',
  'number',
  'number',
  false
);

const [yMin, yMax] = [
  min(dataSetProcessSequentialGradient.series[0].y),
  max(dataSetProcessSequentialGradient.series[0].y),
];

// gradient colorscale legend
const gradientLegendProps = {
  legendMax: max(dataSetProcessSequentialGradient.series[0].x),
  legendMin: min(dataSetProcessSequentialGradient.series[0].x),
  gradientColorscaleType: 'sequential',
  // MUST be odd! Probably should be a clever function of the box size
  // and font or something...
  nTicks: 5,
  showMissingness: false,
  legendTitle: 'legend',
};

// custom legend with scatterplot gradient colorscale
export const SequentialContinuous = () => {
  return (
    <div style={{ padding: 15 }}>
      <PlotLegend
        type="colorscale"
        {...(gradientLegendProps as PlotLegendGradientProps)}
      />
      <ScatterPlot
        data={dataSetProcessSequentialGradient}
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
      />
    </div>
  );
};

// discretized version of sequential colormap
const vocabularyEquidistant = ['1', '2', '3', '4', '5', '6', '7'];
const { dataSetProcess: dataSetProcessSequentialDiscrete } = processInputData(
  dataSetSequentialDiscrete,
  'scatterplot',
  'markers',
  'number',
  'number',
  false
);

export const SequentialDiscrete = () => {
  const legendItems = vocabularyEquidistant.map((label) => {
    return {
      label,
      marker: 'square',
      markerColor: gradientSequentialColorscaleMap(
        vocabularyEquidistant.indexOf(label) /
          (vocabularyEquidistant.length - 1)
      ),
      hasData: true,
      group: 1,
      rank: 1,
    };
  });
  return (
    <div style={{ padding: 15 }}>
      <PlotLegend
        type="list"
        legendItems={legendItems}
        checkedLegendItems={vocabularyEquidistant}
        // onCheckedLegendItemsChange={setCheckedLegendItems}
        // legendTitle={variableDisplayWithUnit(xAxisVariable)}
        showOverlayLegend={true}
      />
      <ScatterPlot
        data={dataSetProcessSequentialDiscrete}
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
        // margin={{l: 50, r: 10, b: 20, t: 10}}
        // add legend title
        legendTitle={'legend title example'}
        independentValueType={'number'}
        dependentValueType={'number'}
      />
    </div>
  );
};

// discretized version of sequential colormap
const vocabularyNonUniform = ['1', '2', '5', '6', '7', '18', '20'];
let dataSetSequentialDiscreteNonUniform = dataSetSequentialDiscrete;

// Replace a few values in the original data so that we have non-equidistant values.
dataSetSequentialDiscreteNonUniform.scatterplot.data[0].seriesGradientColorscale?.forEach(
  (val, index, arr) => {
    val === 3 ? (arr[index] = 18) : val === 4 ? (arr[index] = 20) : val;
  }
);

const {
  dataSetProcess: dataSetProcessSequentialDiscreteNonUniform,
} = processInputData(
  dataSetSequentialDiscreteNonUniform,
  'scatterplot',
  'markers',
  'number',
  'number',
  false
);

export const SequentialDiscreteNonUniformSpacing = () => {
  const legendItems = vocabularyNonUniform.map((label) => {
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
  return (
    <div style={{ padding: 15 }}>
      <PlotLegend
        type="list"
        legendItems={legendItems}
        checkedLegendItems={vocabularyNonUniform}
        // onCheckedLegendItemsChange={setCheckedLegendItems}
        // legendTitle={variableDisplayWithUnit(xAxisVariable)}
        showOverlayLegend={true}
      />
      <ScatterPlot
        data={dataSetProcessSequentialDiscreteNonUniform}
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
        // margin={{l: 50, r: 10, b: 20, t: 10}}
        // add legend title
        legendTitle={'legend title example'}
        independentValueType={'number'}
        dependentValueType={'number'}
      />
    </div>
  );
};

/**
 * To Dos
 * 1. 7 is arbitrary. Link the numbers better between here and scatterplotstorydata or something
 * 2. Add another plot to discrete version. Maybe line or box
 * 3. Improve documentation.
 * 4. Add nice titles and things
 */
