import { useMemo } from 'react';
import { makePlotlyPlotComponent, PlotProps } from './PlotlyPlot';
// truncation
import {
  XYPlotData,
  OrientationAddon,
  OrientationDefault,
  AxisTruncationAddon,
} from '../types/plots';
// add Shape for truncation
import { Layout, Shape } from 'plotly.js';
import { NumberOrDateRange } from '../types/general';

// import truncation util functions
import { extendAxisRangeForTruncations } from '../utils/extended-axis-range-truncations';
import { truncationLayoutShapes } from '../utils/truncation-layout-shapes';

export interface XYPlotProps
  extends PlotProps<XYPlotData>,
    // truncation
    OrientationAddon,
    AxisTruncationAddon {
  /** x-axis range: required for confidence interval - not really */
  independentAxisRange?: NumberOrDateRange;
  /** y-axis range: required for confidence interval */
  dependentAxisRange?: NumberOrDateRange;
  /** x-axis label */
  independentAxisLabel?: string;
  /** y-axis label */
  dependentAxisLabel?: string;
  /** independentValueType */
  independentValueType?:
    | 'string'
    | 'number'
    | 'date'
    | 'longitude'
    | 'category';
  /** dependentValueType */
  dependentValueType?: 'string' | 'number' | 'date' | 'longitude' | 'category';
  // TO DO
  // opacity?
}

const EmptyXYPlotData: XYPlotData = {
  series: [],
};

/**
 * This component handles several plots such as marker, line, confidence interval,
 * density, and combinations of plots like marker + line + confidence interval
 */
const XYPlot = makePlotlyPlotComponent('XYPlot', (props: XYPlotProps) => {
  const {
    data = EmptyXYPlotData,
    independentAxisRange,
    dependentAxisRange,
    independentAxisLabel,
    dependentAxisLabel,
    independentValueType,
    dependentValueType,
    // truncation
    orientation = OrientationDefault,
    axisTruncationConfig,
    ...restProps
  } = props;

  // truncation axis range
  const standardIndependentAxisRange = independentAxisRange;
  const extendedIndependentAxisRange = extendAxisRangeForTruncations(
    standardIndependentAxisRange,
    axisTruncationConfig?.independentAxis,
    independentValueType === 'date' ? 'date' : 'number'
  );

  // truncation
  const standardDependentAxisRange = dependentAxisRange;
  const extendedDependentAxisRange = extendAxisRangeForTruncations(
    standardDependentAxisRange,
    axisTruncationConfig?.dependentAxis,
    dependentValueType === 'date' ? 'date' : 'number'
  );

  // make rectangular layout shapes for truncated axis/missing data
  const truncatedAxisHighlighting:
    | Partial<Shape>[]
    | undefined = useMemo(() => {
    if (data.series.length > 0) {
      const filteredTruncationLayoutShapes = truncationLayoutShapes(
        orientation,
        standardIndependentAxisRange, // send undefined for independentAxisRange
        standardDependentAxisRange,
        extendedIndependentAxisRange, // send undefined for independentAxisRange
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
    hovermode: 'closest',
    xaxis: {
      title: independentAxisLabel,
      // truncation
      range: data.series.length
        ? [extendedIndependentAxisRange?.min, extendedIndependentAxisRange?.max]
        : undefined,
      zeroline: false, // disable yaxis line
      // make plot border
      mirror: true,
      // date or number type (from variable.type)
      type: independentValueType === 'date' ? 'date' : undefined,
      tickfont: data.series.length ? {} : { color: 'transparent' },
    },
    yaxis: {
      title: dependentAxisLabel,
      // with the truncated axis, negative values need to be checked for log scale
      range: data.series.length
        ? [extendedDependentAxisRange?.min, extendedDependentAxisRange?.max]
        : undefined,
      zeroline: false, // disable xaxis line
      // make plot border
      mirror: true,
      // date or number type (from variable.type)
      type: dependentValueType === 'date' ? 'date' : undefined,
      tickfont: data.series.length ? {} : { color: 'transparent' },
    },
    // add truncatedAxisHighlighting for layout.shapes
    shapes: truncatedAxisHighlighting,
  };

  return {
    data: data.series,
    layout,
    ...restProps,
  };
});

export default XYPlot;
