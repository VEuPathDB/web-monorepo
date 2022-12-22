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
  processInputData,
} from '../plots/ScatterPlot.storyData';

export default {
  title: 'Colors/Gradient Sequential',
  component: PlotLegend,
} as Meta;

// Data
interface VEuPathDBScatterPlotData {
  scatterplot: {
    data: Array<{
      seriesX?: number[] | string[]; // perhaps string[] is better despite Date format, e.g., ISO format?
      seriesY?: number[] | string[]; // will y data have a Date?
      smoothedMeanX?: number[] | string[]; // perhaps string[] is better despite Date format, e.g., ISO format?
      smoothedMeanY?: number[]; // will y data have a date string? Nope, number only
      smoothedMeanSE?: number[];
      bestFitLineX?: number[] | string[];
      bestFitLineY?: number[];
      seriesGradientColorscale?: number[] | string[];
    }>;
  };
}

let seriesX = [];
for (let index = 0; index < 50; index++) {
  seriesX.push(index.toString());
}
let seriesY = [];
for (let index = 0; index < 50; index++) {
  seriesY.push(Math.random().toString());
}

const { dataSetProcess: dataSetProcessSequentialGradient } = processInputData(
  dataSetSequentialGradient,
  'scatterplot',
  'markers',
  'number',
  'number',
  false
);

// Var
// set some default props
const plotWidth = 500;
const plotHeight = 400;
// let plotWidth = 350;
// let plotHeight = 250;
const independentAxisLabel = 'independent axis label';
const dependentAxisLabel = 'dependent axis label';
const plotTitle = '';
const [yMin, yMax] = [
  min(dataSetProcessSequentialGradient.series[0].y),
  max(dataSetProcessSequentialGradient.series[0].y),
];
const independentValueType = 'number';
const dependentValueType = 'number';

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
export const SequentialDiscrete = () => {
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
        // margin={{l: 50, r: 10, b: 20, t: 10}}
        // add legend title
        legendTitle={'legend title example'}
        independentValueType={'number'}
        dependentValueType={'number'}
      />
    </div>
  );
};
