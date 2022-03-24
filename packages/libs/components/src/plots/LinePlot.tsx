import { useMemo } from 'react';
import { makePlotlyPlotComponent, PlotProps } from './PlotlyPlot';
import { LinePlotData } from '../types/plots';
import { Layout } from 'plotly.js';
import { NumberOrDateRange } from '../types/general';
import { isArrayOfNumbersOrNulls } from '../types/guards';
import { zip } from 'lodash';

// is it possible to have this interface extend ScatterPlotProps?
// or would we need some abstract layer, w scatter and line both as equal children below it?
export interface LinePlotProps extends PlotProps<LinePlotData> {
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
    ...restProps
  } = props;

  const layout: Partial<Layout> = {
    hovermode: 'closest',
    xaxis: {
      title: independentAxisLabel,
      range: [independentAxisRange?.min, independentAxisRange?.max], // set this for better display: esp. for CI plot
      zeroline: false, // disable line at 0 value
      // make plot border
      mirror: true,
      // date or number type (from variable.type)
      type: independentValueType === 'date' ? 'date' : undefined,
      tickfont: data.series.length ? {} : { color: 'transparent' },
    },
    yaxis: {
      title: dependentAxisLabel,
      range: [dependentAxisRange?.min, dependentAxisRange?.max], // set this for better display: esp. for CI plot
      zeroline: false, // disable line at 0 value
      // make plot border
      mirror: true,
      // date or number type (from variable.type)
      type: dependentValueType === 'date' ? 'date' : undefined,
      tickfont: data.series.length ? {} : { color: 'transparent' },
    },
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
            return `x: ${binLabel ?? x}\ny: ${y}${CI}\n${xtra}`;
          }),
        })),
    [data.series]
  );

  return {
    data: plotlyData,
    layout,
    ...restProps,
  };
});

export default LinePlot;
