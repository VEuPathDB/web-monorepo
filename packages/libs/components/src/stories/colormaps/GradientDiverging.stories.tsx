// A collection of stories for viewing our Diverging Gradient Colormap
import { Story, Meta } from '@storybook/react/types-6-0';
import PlotLegend from '../../components/plotControls/PlotLegend';
import { PlotLegendGradientProps } from '../../components/plotControls/PlotGradientLegend';
import ScatterPlot from '../../plots/ScatterPlot';
import { min, max } from 'lodash';
import {
  dataSetDivergingGradient,
  dataSetSequentialDiscrete,
  processInputData,
} from '../plots/ScatterPlot.storyData';
import { gradientDivergingColorscaleMap } from '../../types/plots/addOns';
import { VEuPathDBScatterPlotData } from '../plots/ScatterPlot.storyData';
import { PlotLegendProps } from '../../components/plotControls/PlotLegend';
import { rgb, lab } from 'd3-color';

export default {
  title: 'Colors/Gradient Diverging',
  component: ScatterPlot,
  argTypes: {
    nPoints: {
      control: { type: 'range', min: 5, max: 300, step: 5 },
    },
  },
} as Meta;

// set some default props
const plotWidth = 500;
const plotHeight = 400;
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
  dataSetProcessGradient.series[0].seriesGradientColorscale = dataSetProcessGradient.series[0].seriesGradientColorscale?.slice(
    0,
    args.nPoints
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

// Showcase the continuous version of the diverging gradient colormap. Overlay values are drawn from
// a continuous distribution

// Setup gradient colorscale legend
const gradientLegendProps = {
  legendMax: max(
    dataSetDivergingGradient.scatterplot.data[0]
      .seriesGradientColorscale as number[]
  ),
  legendMin: min(
    dataSetDivergingGradient.scatterplot.data[0]
      .seriesGradientColorscale as number[]
  ),
  gradientColorscaleType: 'divergent',
  // MUST be odd!
  nTicks: 5,
  showMissingness: false,
  legendTitle: 'legend',
};

export const Continuous = Template.bind({});
Continuous.args = {
  data: dataSetDivergingGradient,
  plotLegendProps: {
    type: 'colorscale',
    ...(gradientLegendProps as PlotLegendGradientProps),
  },
  nPoints: 120,
};

// Showcase discretized version of the diverging gradient colormap. For this story,
// the overlay var is a low cardinality, equidistant set of integers.
const vocabularyEquidistant = ['3', '2', '1', '0', '-1', '-2', '-3'];

// Modify the sequential version since it already has the integers
let dataSetDivergingDiscrete: VEuPathDBScatterPlotData = JSON.parse(
  JSON.stringify(dataSetSequentialDiscrete)
);
dataSetDivergingDiscrete.scatterplot.data[0].seriesGradientColorscale?.forEach(
  (val, index, arr) => {
    arr[index] = Number(val) - 4;
  }
);

let legendItems = vocabularyEquidistant.map((label) => {
  console.log(
    rgb(
      lab(
        gradientDivergingColorscaleMap(
          +label / max(vocabularyEquidistant.map(Number))!
        )
      ).darker()
    )
  );
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

export const Discrete = Template.bind({});
Discrete.args = {
  data: dataSetDivergingDiscrete,
  plotLegendProps: {
    type: 'list',
    legendItems: legendItems,
    checkedLegendItems: vocabularyEquidistant,
    showOverlayLegend: true,
  },
  nPoints: 120,
};

// Showcase discretized version of the diverging gradient colormap. For this story,
// the overlay var is a low cardinality variable with non-uniform spacing between neighboring values.
const vocabularyNonUniform = ['-10', '-9.2', '-1', '0', '1.1', '3', '27'];
legendItems = vocabularyNonUniform.map((label) => {
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

// Replace a few values in the original data so that we have values that are not uniform from their neighbors.
let dataSetDivergingDiscreteNonUniform: VEuPathDBScatterPlotData = JSON.parse(
  JSON.stringify(dataSetDivergingDiscrete)
);
dataSetDivergingDiscreteNonUniform.scatterplot.data[0].seriesGradientColorscale?.forEach(
  (val, index, arr) => {
    arr[index] = (+val) ** 3;
  }
);

export const DiscreteNonUniform = Template.bind({});
DiscreteNonUniform.args = {
  data: dataSetDivergingDiscreteNonUniform,
  plotLegendProps: {
    type: 'list',
    legendItems: legendItems,
    checkedLegendItems: vocabularyNonUniform,
    showOverlayLegend: true,
  },
  nPoints: 120,
};
