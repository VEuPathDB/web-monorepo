import { Story, Meta } from '@storybook/react/types-6-0';
import PlotLegend from '../../components/plotControls/PlotLegend';
import { PlotLegendGradientProps } from '../../components/plotControls/PlotGradientLegend';
import ScatterPlot, { ScatterPlotProps } from '../../plots/ScatterPlot';
import { min, max } from 'lodash';
import {
  dataSetSequentialGradient,
  dataSetSequentialDiscrete,
  processInputData,
} from '../plots/ScatterPlot.storyData';
import { gradientSequentialColorscaleMap } from '../../types/plots/addOns';
import { VEuPathDBScatterPlotData } from '../plots/ScatterPlot.storyData';
import { PlotLegendProps } from '../../components/plotControls/PlotLegend';

// A collection of stories for viewing our Sequential Gradient Colormap
export default {
  title: 'Colors/Gradient Sequential',
  component: ScatterPlot,
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

// TODO ann make StoryProps

interface TemplateProps {
  data: VEuPathDBScatterPlotData;
  plotLegendProps: PlotLegendProps;
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

  const [yMin, yMax] = [
    min(dataSetProcessGradient.series[0].y),
    max(dataSetProcessGradient.series[0].y),
  ];

  return (
    <div style={{ padding: 15 }}>
      <PlotLegend {...args.plotLegendProps} />
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
      />
    </div>
  );
};

// Showcase the continuous version of the sequential gradient colormap. Overlay values are drawn from
// a continuous distribution
export const Continuous = Template.bind({});
Continuous.args = {
  data: dataSetSequentialGradient,
  plotLegendProps: {
    type: 'colorscale',
    ...(gradientLegendProps as PlotLegendGradientProps),
  },
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
};
