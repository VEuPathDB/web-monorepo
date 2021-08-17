import React from 'react';
import { Layout } from 'plotly.js';
import { PlotParams } from 'react-plotly.js';
import PlotlyPlot, { PlotProps } from './PlotlyPlot';
import {
  BoxplotData,
  OpacityAddon,
  OpacityDefault,
  OrientationAddon,
  OrientationDefault,
  ColorPaletteAddon,
} from '../types/plots';
import { NumberOrDateRange } from '../types/general';
import { uniq, flatMap, at } from 'lodash';

export interface BoxplotProps
  extends PlotProps<BoxplotData>,
    OrientationAddon,
    OpacityAddon,
    ColorPaletteAddon {
  /** label for independent axis */
  independentAxisLabel?: string;
  /** label for the (typically) y-axis, e.g. Wealth */
  dependentAxisLabel?: string;
  /** set the range of the dependent axis (optional)  */
  dependentAxisRange?: NumberOrDateRange;
  /** show the rawData (if given) - optional */
  showRawData?: boolean;
  /** Show the mean as an extra dotted line in the box - optional */
  showMean?: boolean;
  /** show/hide independent axis tick label */
  showIndependentAxisTickLabel?: boolean;
  /** show/hide dependent axis tick label */
  showDependentAxisTickLabel?: boolean;
  /** dependentValueType: 'number' | 'date' */
  dependentValueType?: 'number' | 'date';
}
const EmptyBoxplotData: BoxplotData = [];

export default function Boxplot(props: BoxplotProps) {
  const {
    data: plotData = EmptyBoxplotData,
    showRawData,
    showMean,
    independentAxisLabel,
    dependentAxisLabel,
    dependentAxisRange,
    orientation = OrientationDefault,
    opacity = OpacityDefault,
    showIndependentAxisTickLabel = true,
    showDependentAxisTickLabel = true,
    dependentValueType = 'number',
    ...restProps
  } = props;

  // get the order of the provided category values (labels shown along x-axis)
  // get them in the given order, and trivially unique-ify them, if traces have different values
  const categoryOrder = uniq(flatMap(plotData, (d) => d.label));

  const [independentAxisName, dependentAxisName] =
    orientation === 'vertical' ? ['x', 'y'] : ['y', 'x'];

  const data: PlotParams['data'] = plotData
    .map((d) => {
      // part 1 of the hack to avoid showing empty boxes as lines on the zero line
      // using the d.median array, find the indices of non-null values
      // we will use this to filter out only the "good" values of q1, q3, lowerfence etc
      const definedDataIndices = d.median
        .map((median, index) => (median != null ? index : undefined))
        .filter((x) => x != null) as number[];

      const orientationDependentProps: any = {
        [independentAxisName]: at(d.label, definedDataIndices),
        [dependentAxisName]:
          d.rawData && showRawData
            ? at(d.rawData, definedDataIndices)
            : d.outliers?.length
            ? at(d.outliers, definedDataIndices)
            : [[null]],
      };

      // seems like plotly bug: y[0] or x[0] should not be empty array (e.g., with overlay variable)
      // see multipleData at story file (Kenya case)
      if (orientationDependentProps[dependentAxisName]?.[0].length === 0)
        orientationDependentProps[dependentAxisName][0] = [null];

      return {
        lowerfence: at(d.lowerfence, definedDataIndices),
        upperfence: at(d.upperfence, definedDataIndices),
        median: at(d.median, definedDataIndices),
        mean: d.mean !== null ? at(d.mean, definedDataIndices) : undefined,
        boxmean: d.mean !== null && showMean,
        q1: at(d.q1, definedDataIndices),
        q3: at(d.q3, definedDataIndices),
        // name is used as legend
        name: d.name,
        boxpoints: d.rawData && showRawData ? 'all' : 'outliers',
        jitter: 0.1, // should be dependent on the number of datapoints...?
        marker: {
          opacity: opacity,
          color: d.color,
        },
        ...orientationDependentProps,
        type: 'box',
        // `offsetgroup` somehow ensures that an overlay value with no data at all will
        // still be shown as a gap in the boxplots shown above a single x tick.
        offsetgroup: d.name,
      };
    }) // part 2 of the hack:
    // the following is required because Plotly's 'categoryorder/categoryarray' props do not
    // introduce "empty" bars/boxes at the beginning or end of the x-axis
    .concat({
      [independentAxisName]: categoryOrder,
      [dependentAxisName]: categoryOrder.map(() => 0),
      type: 'bar',
      hoverinfo: 'none',
      showlegend: false,
    });

  const dependentAxis = orientation === 'vertical' ? 'yaxis' : 'xaxis';
  const independentAxis = orientation === 'vertical' ? 'xaxis' : 'yaxis';

  const layout: Partial<Layout> = {
    [independentAxis]: {
      automargin: true,
      showgrid: false,
      zeroline: false,
      showline: false,
      title: independentAxisLabel,
      range: data.length ? undefined : [1, 5], // avoids x==0 line
      tickfont: data.length ? {} : { color: 'transparent' },
      showticklabels: showIndependentAxisTickLabel,
      // part 3 of the hack:
      categoryorder: 'array',
      categoryarray: categoryOrder,
    },
    [dependentAxis]: {
      automargin: true,
      showline: true,
      rangemode: 'tozero' as const,
      title: dependentAxisLabel,
      range: dependentAxisRange
        ? [dependentAxisRange?.min, dependentAxisRange?.max]
        : undefined,
      tickfont: data.length ? {} : { color: 'transparent' },
      showticklabels: showDependentAxisTickLabel,
      // type: 'date' is required for y-axis date case like enrollment year
      // but not working properly as it is classified as number at data
      type: dependentValueType === 'date' ? 'date' : undefined,
    },
    // don't forget this for multiple datasets
    boxmode: 'group',
  };

  return <PlotlyPlot data={data} layout={layout} {...restProps} />;
}
