import { Meta } from '@storybook/react/types-6-0';
import PlotLegend from '../../components/plotControls/PlotLegend';
import PlotGradientLegend, {
  PlotLegendGradientProps,
} from '../../components/plotControls/PlotGradientLegend';
import ScatterPlot from '../../plots/ScatterPlot';
import { min, max } from 'lodash';
import {
  dataSetDivergingGradient,
  dataSetSequentialDiscrete,
  processInputData,
} from '../plots/ScatterPlot.storyData';
import { gradientDivergingColorscaleMap } from '../../types/plots/addOns';
import { VEuPathDBScatterPlotData } from '../plots/ScatterPlot.storyData';

// A collection of stories for viewing our Diverging Gradient Colormap
export default {
  title: 'Colors/Gradient Diverging',
  component: PlotLegend,
} as Meta;

// set some default props
const plotWidth = 500;
const plotHeight = 400;
const independentAxisLabel = 'independent axis label';
const dependentAxisLabel = 'dependent axis label';
const plotTitle = '';
const independentValueType = 'number';
const dependentValueType = 'number';

const { dataSetProcess: dataSetProcessDivergingGradient } = processInputData(
  dataSetDivergingGradient,
  'scatterplot',
  'markers',
  'number',
  'number',
  false
);

const [yMin, yMax] = [
  min(dataSetProcessDivergingGradient.series[0].y),
  max(dataSetProcessDivergingGradient.series[0].y),
];

// gradient colorscale legend
const gradientLegendProps = {
  legendMax: max(dataSetProcessDivergingGradient.series[0].y),
  legendMin: min(dataSetProcessDivergingGradient.series[0].y),
  gradientColorscaleType: 'divergent',
  // MUST be odd!
  nTicks: 5,
  showMissingness: false,
  legendTitle: 'legend',
};

// Showcase Diverging gradient colormap.
export const DivergingContinuous = () => {
  return (
    <div style={{ padding: 15 }}>
      <PlotLegend
        type="colorscale"
        {...(gradientLegendProps as PlotLegendGradientProps)}
      />
      <ScatterPlot
        data={dataSetProcessDivergingGradient}
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

// Showcase discretized version of the diverging gradient colormap. For this story,
// the overlay var is a low cardinality, equidistant set of integers.
const vocabularyEquidistant = ['-3', '-2', '-1', '0', '1', '2', '3'];
// Modify the sequential version since it already has the integers
let dataSetDivergingDiscrete: VEuPathDBScatterPlotData = JSON.parse(
  JSON.stringify(dataSetSequentialDiscrete)
);
dataSetDivergingDiscrete.scatterplot.data[0].seriesGradientColorscale?.forEach(
  (val, index, arr) => {
    arr[index] = Number(val) - 4;
  }
);

const { dataSetProcess: dataSetProcessDivergingDiscrete } = processInputData(
  dataSetDivergingDiscrete,
  'scatterplot',
  'markers',
  'number',
  'number',
  false
);

export const DivergingDiscrete = () => {
  const legendItems = vocabularyEquidistant.map((label) => {
    return {
      label,
      marker: 'square',
      markerColor: gradientDivergingColorscaleMap(
        +label / max(vocabularyEquidistant.map(Number))!
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
        // legendTitle={variableDisplayWithUnit(xAxisVariable)}
        showOverlayLegend={true}
      />
      <ScatterPlot
        data={dataSetProcessDivergingDiscrete}
        independentAxisLabel={independentAxisLabel}
        dependentAxisLabel={dependentAxisLabel}
        // not to use independentAxisRange
        // independentAxisRange={[xMin, xMax]}
        dependentAxisRange={{
          min: min(dataSetProcessDivergingDiscrete.series[0].y) as string,
          max: max(dataSetProcessDivergingDiscrete.series[0].y) as string,
        }}
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
        // add legend title
        legendTitle={'legend title example'}
        independentValueType={'number'}
        dependentValueType={'number'}
      />
    </div>
  );
};

// Showcase discretized version of the sequential gradient colormap. For this story,
// the overlay var is a low cardinality variable with non-uniform spacing between neighboring values.

const vocabularyNonUniform = ['-27', '-8', '-1', '0', '1', '8', '27'];
// Replace a few values in the original data so that we have values that are not equidistant from their neighbors.
let dataSetDivergingDiscreteNonUniform = dataSetDivergingDiscrete;
dataSetDivergingDiscreteNonUniform.scatterplot.data[0].seriesGradientColorscale?.forEach(
  (val, index, arr) => {
    arr[index] = (+val) ** 3;
  }
);
console.log(dataSetDivergingDiscreteNonUniform);

const {
  dataSetProcess: dataSetProcessDivergingDiscreteNonUniform,
} = processInputData(
  dataSetDivergingDiscreteNonUniform,
  'scatterplot',
  'markers',
  'number',
  'number',
  false
);

export const DivergingDiscreteNonUniformSpacing = () => {
  const legendItems = vocabularyNonUniform.map((label) => {
    return {
      label,
      marker: 'square',
      markerColor: gradientDivergingColorscaleMap(
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
        // legendTitle={variableDisplayWithUnit(xAxisVariable)}
        showOverlayLegend={true}
      />
      <ScatterPlot
        data={dataSetProcessDivergingDiscreteNonUniform}
        independentAxisLabel={independentAxisLabel}
        dependentAxisLabel={dependentAxisLabel}
        // not to use independentAxisRange
        // independentAxisRange={[xMin, xMax]}
        dependentAxisRange={{
          min: min(dataSetProcessDivergingDiscrete.series[0].y) as string,
          max: max(dataSetProcessDivergingDiscrete.series[0].y) as string,
        }}
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
