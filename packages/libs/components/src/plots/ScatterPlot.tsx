import { useMemo } from 'react';
import { makePlotlyPlotComponent, PlotProps } from './PlotlyPlot';
// truncation
import {
  ScatterPlotData,
  OrientationAddon,
  OrientationDefault,
  AxisTruncationAddon,
  independentAxisLogScaleAddon,
  independentAxisLogScaleDefault,
  DependentAxisLogScaleAddon,
  DependentAxisLogScaleDefault,
} from '../types/plots';
// add Shape for truncation
import { Layout, Shape } from 'plotly.js';
import { NumberOrDateRange } from '../types/general';

// import truncation util functions
import { extendAxisRangeForTruncations } from '../utils/extended-axis-range-truncations';
import { truncationLayoutShapes } from '../utils/truncation-layout-shapes';
import { logScaleDtick } from '../utils/logscale-dtick';

export interface ScatterPlotProps
  extends PlotProps<ScatterPlotData>,
    // truncation
    OrientationAddon,
    independentAxisLogScaleAddon,
    DependentAxisLogScaleAddon,
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

const EmptyScatterPlotData: ScatterPlotData = {
  series: [],
};

/**
 * This component handles several plots such as marker, line, confidence interval,
 * density, and combinations of plots like marker + line + confidence interval
 */
const ScatterPlot = makePlotlyPlotComponent(
  'ScatterPlot',
  (props: ScatterPlotProps) => {
    const {
      data = EmptyScatterPlotData,
      independentAxisRange,
      dependentAxisRange,
      independentAxisLabel,
      dependentAxisLabel,
      independentValueType,
      dependentValueType,
      // truncation
      orientation = OrientationDefault,
      axisTruncationConfig,
      independentAxisLogScale = independentAxisLogScaleDefault,
      dependentAxisLogScale = DependentAxisLogScaleDefault,
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
      dependentValueType === 'date' ? 'date' : 'number',
      // adjust range for log scale
      'scatterplot',
      dependentAxisLogScale
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
          ? [
              extendedIndependentAxisRange?.min,
              extendedIndependentAxisRange?.max,
            ].map((val) =>
              independentAxisLogScale && val != null
                ? val <= 0
                  ? -0.1
                  : Math.log10(val as number)
                : val
            )
          : undefined,
        zeroline: false, // disable yaxis line
        // make plot border
        mirror: true,
        // date or number type (from variable.type): no log scale for date
        type:
          independentValueType === 'date'
            ? 'date'
            : independentAxisLogScale
            ? 'log'
            : undefined,
        tickfont: data.series.length ? {} : { color: 'transparent' },
        dtick: independentAxisLogScale
          ? logScaleDtick(extendedIndependentAxisRange)
          : undefined,
      },
      yaxis: {
        title: dependentAxisLabel,
        // with the truncated axis, negative values need to be checked for log scale
        range: data.series.length
          ? [
              extendedDependentAxisRange?.min,
              extendedDependentAxisRange?.max,
            ].map((val) =>
              dependentAxisLogScale && val != null
                ? Math.log10(val as number)
                : val
            )
          : undefined,
        // range: undefined,
        zeroline: false, // disable xaxis line
        // make plot border
        mirror: true,
        // date or number type (from variable.type): no log scale for date
        type:
          dependentValueType === 'date'
            ? 'date'
            : dependentAxisLogScale
            ? 'log'
            : undefined,
        tickfont: data.series.length ? {} : { color: 'transparent' },
        dtick: dependentAxisLogScale
          ? logScaleDtick(extendedDependentAxisRange)
          : undefined,
      },
      // add truncatedAxisHighlighting for layout.shapes
      shapes: truncatedAxisHighlighting,
    };

    return {
      data: data.series,
      layout,
      ...restProps,
    };
  }
);

export default ScatterPlot;
