import { Meta } from '@storybook/react/types-6-0';
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

// A collection of stories for viewing our categorical colormaps
export default {
  title: 'Colors/Categorical',
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

const { dataSetProcess: dataSetProcessCategoricalOveraly } = processInputData(
  dataSetCategoricalOverlay,
  'scatterplot',
  'markers',
  independentValueType,
  dependentValueType,
  false
);

const [yMin, yMax] = [
  min(dataSetProcessCategoricalOveraly.series[0].y),
  max(dataSetProcessCategoricalOveraly.series[0].y),
];

const vocabulary = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// Showcase categorical colormap.
export const DefaultCategorical = () => {
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
  return (
    <div style={{ padding: 15 }}>
      <PlotLegend
        type="list"
        legendItems={legendItems}
        checkedLegendItems={vocabulary}
        showOverlayLegend={true}
      />
      <ScatterPlot
        data={dataSetProcessCategoricalOveraly}
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
        displayLegend={true}
        displayLibraryControls={true}
        independentValueType={'number'}
        dependentValueType={'number'}
      />
    </div>
  );
};

// Showcase ordinal categorical colormap.
export const Ordinal = () => {
  const legendItems = vocabulary.map((label) => {
    return {
      label,
      marker: 'square',
      markerColor: ColorPaletteOrdinal[vocabulary.indexOf(label)],
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
        checkedLegendItems={vocabulary}
        showOverlayLegend={true}
      />
      <ScatterPlot
        data={dataSetProcessCategoricalOveraly}
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
        displayLegend={true}
        displayLibraryControls={true}
        independentValueType={'number'}
        dependentValueType={'number'}
      />
    </div>
  );
};

// To Dos
// 1. Scatter with categorical map
// ... that's it??
