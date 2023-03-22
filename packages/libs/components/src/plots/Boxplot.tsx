import React, { useMemo } from 'react';
// add Shape for truncation
import { Layout, Shape } from 'plotly.js';
import { PlotParams } from 'react-plotly.js';
import { makePlotlyPlotComponent, PlotProps } from './PlotlyPlot';
import {
  BoxplotData,
  OpacityAddon,
  OpacityDefault,
  OrientationAddon,
  OrientationDefault,
  // truncation
  AxisTruncationAddon,
} from '../types/plots';
import { NumberOrDateRange } from '../types/general';
import { uniq, flatMap, at } from 'lodash';
// util functions for handling long tick labels with ellipsis
import { axisTickLableEllipsis } from '../utils/axis-tick-label-ellipsis';

// import truncation util functions
import { NumberRange } from '../types/general';
import { extendAxisRangeForTruncations } from '../utils/extended-axis-range-truncations';
import { truncationLayoutShapes } from '../utils/truncation-layout-shapes';

export interface BoxplotProps
  extends PlotProps<BoxplotData>,
    OrientationAddon,
    OpacityAddon,
    // truncation
    AxisTruncationAddon {
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

const Boxplot = makePlotlyPlotComponent('Boxplot', (props: BoxplotProps) => {
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
    // truncation
    axisTruncationConfig,
    ...restProps
  } = props;

  // set tick label Length for ellipsis
  const maxIndependentTickLabelLength = 20;

  // get the order of the provided category values (labels shown along x-axis)
  // get them in the given order, and trivially unique-ify them, if traces have different values
  // this will also be used as tooltip text for axis tick labels
  const categoryOrder = useMemo(() => uniq(flatMap(plotData, (d) => d.label)), [
    plotData,
  ]);

  // change categoriOrder to have ellipsis
  const categoryOrderEllipsis = useMemo(
    () => axisTickLableEllipsis(categoryOrder, maxIndependentTickLabelLength),
    [plotData, categoryOrder]
  );

  const [independentAxisName, dependentAxisName] =
    orientation === 'vertical' ? ['x', 'y'] : ['y', 'x'];

  // zero length test looks redundant, but it is to prevent the
  // .concat(...) applied after the .map(...)
  const data: PlotParams['data'] =
    plotData.length === 0
      ? []
      : plotData
          .map((d) => {
            // part 1 of the hack to avoid showing empty boxes as lines on the zero line
            // using the d.median array, find the indices of non-null values
            // we will use this to filter out only the "good" values of q1, q3, lowerfence etc
            const definedDataIndices = d.median
              .map((median, index) => (median != null ? index : undefined))
              .filter((x) => x != null) as number[];

            const orientationDependentProps: any = {
              // mapping data based on categoryOrder and categoryOrderEllipsis
              [independentAxisName]: at(d.label, definedDataIndices).map(
                (d: string) => {
                  const foundIndexValue = categoryOrder.findIndex(
                    (element: string) => element === d
                  );
                  return categoryOrderEllipsis[foundIndexValue];
                }
              ),
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
              mean:
                d.mean !== null ? at(d.mean, definedDataIndices) : undefined,
              boxmean: d.mean !== null && showMean,
              q1: at(d.q1, definedDataIndices),
              q3: at(d.q3, definedDataIndices),
              // name is used as legend
              name: d.name,
              showlegend: d.name ? true : false,
              boxpoints: d.rawData && showRawData ? 'all' : 'outliers',
              jitter: 0.1, // should be dependent on the number of datapoints...?
              marker: {
                opacity: opacity,
                color: d.borderColor,
                symbol: d.outlierSymbol ?? 'circle-open',
              },
              line: {
                width: 1,
                color: d.borderColor,
              },
              fillcolor: d.color,
              ...orientationDependentProps,
              type: 'box',
              // `offsetgroup` somehow ensures that an overlay value with no data at all will
              // still be shown as a gap in the boxplots shown above a single x tick.
              // offsetgroup: d.name,
            };
          }) // part 2 of the hack:
          // the following is required because Plotly's 'categoryorder/categoryarray' props do not
          // introduce "empty" bars/boxes at the beginning or end of the x-axis
          .concat({
            // use categoriOrderEllipsis instead of categoryOrder to have ellipsis
            [independentAxisName]: categoryOrderEllipsis,
            [dependentAxisName]: categoryOrderEllipsis.map(() => 0),
            type: 'bar',
            hoverinfo: 'none',
            showlegend: false,
          });

  const dependentAxis = orientation === 'vertical' ? 'yaxis' : 'xaxis';
  const independentAxis = orientation === 'vertical' ? 'xaxis' : 'yaxis';

  // truncation
  const standardDependentAxisRange = dependentAxisRange;
  const extendedDependentAxisRange = extendAxisRangeForTruncations(
    standardDependentAxisRange,
    axisTruncationConfig?.dependentAxis,
    // for now, handle number only
    'number',
    true // addPadding
  ) as NumberRange | undefined;

  // make rectangular layout shapes for truncated axis/missing data
  const truncatedAxisHighlighting:
    | Partial<Shape>[]
    | undefined = useMemo(() => {
    if (data.length > 0) {
      const filteredTruncationLayoutShapes = truncationLayoutShapes(
        orientation,
        undefined, // send undefined for independentAxisRange
        standardDependentAxisRange,
        undefined, // send undefined for independentAxisRange
        extendedDependentAxisRange,
        axisTruncationConfig
      );

      return filteredTruncationLayoutShapes;
    } else {
      return [];
    }
  }, [
    standardDependentAxisRange,
    extendedDependentAxisRange,
    orientation,
    data,
    axisTruncationConfig,
  ]);

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
      type: 'category',
      // part 3 of the hack:
      categoryorder: 'array',
      // for boxplot, this should also be changed to have ellipsis!
      // use categoriOrderEllipsis instead of categoryOrder to have ellipsis
      categoryarray: categoryOrderEllipsis,
    },
    [dependentAxis]: {
      automargin: true,
      showline: true,
      rangemode: 'tozero' as const,
      title: dependentAxisLabel,
      // truncation
      // with the truncated axis, negative values need to be checked for log scale
      range: data.length
        ? [extendedDependentAxisRange?.min, extendedDependentAxisRange?.max]
        : undefined,
      tickfont: data.length ? {} : { color: 'transparent' },
      showticklabels: showDependentAxisTickLabel,
      // type: 'date' is required for y-axis date case like enrollment year
      // but not working properly as it is classified as number at data
      type: dependentValueType === 'date' ? 'date' : undefined,
    },
    // don't forget this for multiple datasets
    boxmode: 'group',
    // add truncatedAxisHighlighting for layout.shapes
    shapes: truncatedAxisHighlighting,
  };

  return {
    data,
    layout,
    // original independent axis tick labels for tooltip
    storedIndependentAxisTickLabel: categoryOrder,
    ...restProps,
  };
});

export default Boxplot;
