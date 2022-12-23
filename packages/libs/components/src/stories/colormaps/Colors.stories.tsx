import { Meta } from '@storybook/react/types-6-0';
import PlotLegend from '../../components/plotControls/PlotLegend';
import PlotGradientLegend, {
  PlotLegendGradientProps,
} from '../../components/plotControls/PlotGradientLegend';
import ScatterPlot from '../../plots/ScatterPlot';
import { min, max } from 'lodash';
import {
  dataSetSequentialGradient,
  dataSetSequentialDiscrete,
  processInputData,
} from '../plots/ScatterPlot.storyData';
import {
  gradientSequentialColorscaleMap,
  gradientDivergingColorscaleMap,
} from '../../types/plots/addOns';

// A collection of stories for viewing our Sequential Gradient Colormap
export default {
  title: 'Colors/Gradient Sequential',
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
  // MUST be odd!
  nTicks: 5,
  showMissingness: false,
  legendTitle: 'legend',
};

// Showcase sequential gradient colormap.
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

// Showcase discretized version of the sequential gradient colormap. For this story,
// the overlay var is a low cardinality, equidistant set of integers.
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

// Showcase discretized version of the sequential gradient colormap. For this story,
// the overlay var is a low cardinality variable with non-uniform spacing between neighboring values.
const vocabularyNonUniform = ['1', '2', '5', '6', '7', '18', '20'];

// Replace a few values in the original data so that we have values that are not equidistant from their neighbors.
let dataSetSequentialDiscreteNonUniform = dataSetSequentialDiscrete;
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
