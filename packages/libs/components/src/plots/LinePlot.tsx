import { useMemo, useState } from 'react';
import { makePlotlyPlotComponent, PlotProps } from './PlotlyPlot';
import { Layout, Shape } from 'plotly.js';
import { NumberOrDateRange } from '../types/general';
import { isArrayOfNumbersOrNulls } from '../types/guards';
import { zip } from 'lodash';
// add axis range control truncation
import {
  LinePlotData,
  OrientationAddon,
  OrientationDefault,
  AxisTruncationAddon,
  independentAxisLogScaleAddon,
  independentAxisLogScaleDefault,
  DependentAxisLogScaleAddon,
  DependentAxisLogScaleDefault,
  LinePlotDataSeries,
} from '../types/plots';
// import truncation util functions
import { extendAxisRangeForTruncations } from '../utils/extended-axis-range-truncations';
import { truncationLayoutShapes } from '../utils/truncation-layout-shapes';
import { tickSettings } from '../utils/tick-settings';

// is it possible to have this interface extend ScatterPlotProps?
// or would we need some abstract layer, w scatter and line both as equal children below it?
// add axis range control
export interface LinePlotProps
  extends PlotProps<LinePlotData>,
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

const EmptyLinePlotData: LinePlotData = {
  series: [],
};

/**
 * This component is much like ScatterPlot, but where the X-axis may be binned and
 * the mode 'markers' is unavailable.
 */
const LinePlot = makePlotlyPlotComponent('LinePlot', (props: LinePlotProps) => {
  const {
    data = EmptyLinePlotData,
    independentAxisRange,
    dependentAxisRange,
    independentAxisLabel,
    dependentAxisLabel,
    independentValueType,
    dependentValueType,
    // add axis range control truncation
    orientation = OrientationDefault,
    axisTruncationConfig,
    independentAxisLogScale = independentAxisLogScaleDefault,
    dependentAxisLogScale = DependentAxisLogScaleDefault,
    ...restProps
  } = props;

  // const [markerHoverMode, setMarkerHoverMode] = useState<'closest' | 'x'>('closest');
  const [markerHoverMode, setMarkerHoverMode] = useState<'closest' | 'x'>('x');

  const onHoverHandler = (
    event: Plotly.PlotMouseEvent
  ): LinePlotDataSeries[] => {
    const hoveredMarkerIndex = event.points[0].pointIndex;
    const hoveredData = event.points[0];
    const overlappingDataMarkers = data.series.filter(
      (d) =>
        d.x[hoveredMarkerIndex] === hoveredData.x &&
        d.y[hoveredMarkerIndex] === hoveredData.y
    );
    return overlappingDataMarkers;
  };

  // add axis range control truncation axis range
  const standardIndependentAxisRange = independentAxisRange;
  const extendedIndependentAxisRange = extendAxisRangeForTruncations(
    standardIndependentAxisRange,
    axisTruncationConfig?.independentAxis,
    independentValueType === 'date' ? 'date' : 'number',
    true, // addPadding
    independentAxisLogScale
  );

  // truncation
  const standardDependentAxisRange = dependentAxisRange;
  const extendedDependentAxisRange = extendAxisRangeForTruncations(
    standardDependentAxisRange,
    axisTruncationConfig?.dependentAxis,
    dependentValueType === 'date' ? 'date' : 'number',
    true, // addPadding
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
    // hovermode: 'closest',
    hovermode: markerHoverMode,
    xaxis: {
      title: independentAxisLabel,
      // add axis range control truncation
      range: data.series.length
        ? [
            extendedIndependentAxisRange?.min,
            extendedIndependentAxisRange?.max,
          ].map((val) =>
            independentAxisLogScale && val != null
              ? Math.log10(val as number)
              : val
          )
        : undefined,
      zeroline: false, // disable line at 0 value
      // make plot border
      mirror: true,
      // date or number type (from variable.type)
      type:
        independentValueType === 'date'
          ? 'date'
          : independentAxisLogScale
          ? 'log'
          : undefined,
      tickfont: data.series.length ? {} : { color: 'transparent' },
      ...tickSettings(
        independentAxisLogScale,
        extendedIndependentAxisRange,
        independentValueType
      ),
    },
    yaxis: {
      title: dependentAxisLabel,
      // add axis range control
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
      zeroline: false, // disable line at 0 value
      // make plot border
      mirror: true,
      // date or number type (from variable.type)
      type:
        dependentValueType === 'date'
          ? 'date'
          : dependentAxisLogScale
          ? 'log'
          : undefined,
      tickfont: data.series.length ? {} : { color: 'transparent' },
      ...tickSettings(
        dependentAxisLogScale,
        extendedDependentAxisRange,
        dependentValueType
      ),
    },
    // axis range control: add truncatedAxisHighlighting for layout.shapes
    shapes: truncatedAxisHighlighting,
  };

  // Convert upper and lower error bar data from absolute to relative
  // requires BOTH yErrorBarUpper and yErrorBarLower to be non-empty
  // and the same length as each other and the series.y array
  // Only number data is handled presently.
  // Default Plotly hover info is to show the relative +/- amounts.
  // Can change this if QA/Outreach don't like it.
  const plotlyData = useMemo(
    () =>
      data.series
        .map((series) => {
          if (series.yErrorBarLower?.length && series.yErrorBarUpper?.length) {
            if (
              series.yErrorBarLower.length === series.y.length &&
              series.yErrorBarLower.length === series.y.length
            ) {
              if (
                isArrayOfNumbersOrNulls(series.yErrorBarUpper) &&
                isArrayOfNumbersOrNulls(series.yErrorBarLower) &&
                isArrayOfNumbersOrNulls(series.y)
              ) {
                const yvals = series.y; // this is only to help TS
                return {
                  ...series,
                  error_y: {
                    type: 'data',
                    visible: 'true',
                    array: series.yErrorBarUpper.map((upperValue, index) => {
                      const yval = yvals[index];
                      return upperValue != null && yval != null
                        ? upperValue - yval
                        : null;
                    }),
                    arrayminus: series.yErrorBarLower.map(
                      (lowerValue, index) => {
                        const yval = yvals[index];
                        return lowerValue != null && yval != null
                          ? yval - lowerValue
                          : null;
                      }
                    ),
                  },
                };
              } else {
                console.log(
                  'WARNING: date-based error bars not yet implemented for LinePlot'
                );
                return series;
              }
            } else {
              throw new Error(
                "yErrorBarUpper and/or yErrorBarLower don't have the same number of values as the main data"
              );
            }
          } else {
            return series;
          }
        })
        // now do another map to sort out the mouseover/tooltip text

        // NOTE: unfortunately the newlines do not render.  Newlines can be added to the
        // 'hovertemplate' but from there I don't think we can access arbitrary values,
        // such as 'upper', 'lower' and 'n'
        .map((series) => ({
          ...series,
          hovertemplate: '%{text}',
          text: zip(
            series.binLabel ?? [],
            (series.x ?? []).map(String),
            (series.y ?? []).map(String),
            (series.yErrorBarLower ?? []).map(String),
            (series.yErrorBarUpper ?? []).map(String),
            series.extraTooltipText ?? []
          ).map(([binLabel, x, y, lower, upper, xtra]) => {
            const CI =
              lower != null && upper != null
                ? ` (95% CI: ${lower} - ${upper})`
                : '';
            // use <br> instead of \n for line break
            return `x: ${binLabel ?? x}<br>y: ${y}${CI}<br>${xtra}`;
          }),
        })),
    [data.series]
  );

  return {
    data: plotlyData,
    layout,
    ...restProps,
    onHoverHandler,
  };
});

export default LinePlot;
