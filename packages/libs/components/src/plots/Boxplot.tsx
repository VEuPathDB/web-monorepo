import React from 'react';
import { Layout } from 'plotly.js';
import PlotlyPlot, { PlotProps, ModebarDefault } from './PlotlyPlot';
import Spinner from '../components/Spinner';
import { NumberOrDateRange } from '../types/general';

export interface Props extends Omit<PlotProps, 'width' | 'height'> {
  data: {
    // number | string means number or date
    // this is based on current data API doc
    /** lower whisker/fence optional */
    lowerfence?: number[];
    /** upper whisker/fence optional */
    upperfence?: number[];
    /** lower quartile (bottom of box) */
    q1: number[];
    /** upper quartile (top of box) */
    q3: number[];
    /** median (middle line of box) */
    median: number[];
    /** mean (optional dotted line in box */
    mean?: number[];
    /** (x-axis) label for this box */
    label: string[];
    /** legend name */
    name?: string;
    /** color for this box */
    color?: string;
    /** optional complete data (not recommended for huge datasets) */
    rawData?: number[] | string[];
    /** outliers: data points outside upper and lower whiskers/fences (optional) */
    outliers?: number[][] | string[][];
  }[];
  /** The width of the plot in pixels (if number), or CSS length. */
  width?: number | string;
  /** The height of the plot in pixels (if number), or CSS length. */
  height?: number | string;
  /** plot title */
  title?: string;
  /** label for the (typically) x-axis, e.g. Country */
  independentAxisLabel?: string;
  /** label for the (typically) y-axis, e.g. Wealth */
  dependentAxisLabel?: string;
  /** optional y-axis zoom range */
  dependentAxisRange?: NumberOrDateRange;
  /** box orientation (default is vertical) */
  orientation?: 'vertical' | 'horizontal';
  /** show the raw data points (if provided) as beeswarm alongside boxplot */
  showRawData?: boolean;
  /** show the mean as dotted line inside the box */
  showMean?: boolean;
  /** opacity of outlier or raw data markers, optional */
  markerOpacity?: number;
  /** show plot legend */
  displayLegend?: boolean;
  /** show plotly's built-in controls */
  displayLibraryControls?: boolean;
  /** show/hide independent axis tick label */
  showIndependentAxisTickLabel?: boolean;
  /** show/hide dependent axis tick label */
  showDependentAxisTickLabel?: boolean;
  /** independentValueType 'number' (default) or 'date' (x data should be given as string[])  */
  independentValueType?: 'number' | 'date';
  /** dependentValueType 'number' (default) or 'date' (y data should be given as string[])  */
  dependentValueType?: 'number' | 'date';
}

export default function Boxplot({
  data,
  width,
  height,
  title,
  orientation,
  showRawData,
  showMean,
  independentAxisLabel,
  dependentAxisLabel,
  dependentAxisRange,
  markerOpacity,
  showModebar,
  margin,
  staticPlot,
  showSpinner,
  displayLegend,
  displayLibraryControls,
  showIndependentAxisTickLabel = true,
  showDependentAxisTickLabel = true,
  independentValueType,
  dependentValueType,
}: Props) {
  const pdata = data.map((d, index) => {
    const orientationDependentProps: any =
      orientation === 'vertical'
        ? {
            x: d.label,
            y:
              d.rawData && showRawData
                ? d.rawData
                : d.outliers?.length
                ? d.outliers
                : undefined,
          }
        : {
            y: d.label,
            x:
              d.rawData && showRawData
                ? d.rawData
                : d.outliers?.length
                ? d.outliers
                : undefined,
          };

    // seems like plotly bug: y[0] or x[0] should not be empty array (e.g., with overlay variable)
    if (
      orientation === 'vertical' &&
      orientationDependentProps.y &&
      orientationDependentProps.y[0].length === 0
    )
      orientationDependentProps.y[0] = [null];
    if (
      orientation === 'horizontal' &&
      orientationDependentProps.x &&
      orientationDependentProps.x[0].length === 0
    )
      orientationDependentProps.x[0] = [null];

    return {
      lowerfence: d.lowerfence,
      upperfence: d.upperfence,
      median: d.median,
      mean: d.mean !== undefined ? d.mean : undefined,
      boxmean: d.mean !== undefined && showMean,
      q1: d.q1,
      q3: d.q3,
      // name is used as legend
      name: d.name,
      boxpoints: d.rawData && showRawData ? 'all' : 'outliers',
      jitter: 0.1, // should be dependent on the number of datapoints...?
      marker: {
        opacity: markerOpacity,
        color: d.color,
      },
      ...orientationDependentProps,
      type: 'box',
    } as const;
  });

  const dependentAxis = orientation === 'vertical' ? 'yaxis' : 'xaxis';
  const independentAxis = orientation === 'vertical' ? 'xaxis' : 'yaxis';

  const layout: Partial<Layout> = {
    [independentAxis]: {
      automargin: true,
      showgrid: false,
      zeroline: false,
      showline: false,
      title: {
        text: independentAxisLabel ? independentAxisLabel : '',
        font: {
          family: 'Arial, Helvetica, sans-serif',
          size: 14,
        },
      },
      tickfont: data.length ? {} : { color: 'transparent' },
      range: data.length ? undefined : [0, 10],
      showticklabels: showIndependentAxisTickLabel,
      // set type for date
      type: independentValueType === 'date' ? 'date' : undefined,
    },
    [dependentAxis]: {
      automargin: true,
      showline: true,
      rangemode: 'tozero' as const,
      title: {
        text: dependentAxisLabel ? dependentAxisLabel : '',
        font: {
          family: 'Arial, Helvetica, sans-serif',
          size: 14,
        },
      },
      tickfont: data.length ? {} : { color: 'transparent' },
      range: data.length ? undefined : [0, 10],
      showticklabels: showDependentAxisTickLabel,
      // type: 'date' is required for y-axis date case like enrollment year
      // but not working properly as it is classified as number at data
      type: dependentValueType === 'date' ? 'date' : undefined,
    },
    title: {
      text: title ? title : '',
    },
    showlegend: displayLegend,
    boxmode: 'group',
  };
  return (
    <div style={{ position: 'relative', width: width, height: height }}>
      <PlotlyPlot
        data={pdata}
        style={{ width: width, height: height }}
        layout={{
          ...layout,
          ...{
            // width: width,
            // height: height,
            margin: margin ? margin : undefined,
          },
        }}
        config={{
          displayModeBar: displayLibraryControls ? 'hover' : false,
          staticPlot: staticPlot,
        }}
      />
      {showSpinner && <Spinner />}
    </div>
  );
}

Boxplot.defaultProps = {
  markerOpacity: 0.5,
  orientation: 'vertical',
};

function isArrayOfNumbers(value: any): value is number[] {
  // value.length !==0
  return (
    Array.isArray(value) &&
    value.length !== 0 &&
    value.every((item) => typeof item === 'number')
  );
}
