import React from 'react';
import PlotlyPlot, { PlotProps, ModebarDefault } from './PlotlyPlot';
import Spinner from '../components/Spinner';
import { NumberOrDateRange } from '../types/general';

export interface Props extends PlotProps {
  data: {
    // number | string means number or date
    /** lower whisker/fence optional */
    lowerWhisker?: number | string;
    /** lower quartile (bottom of box) */
    q1: number | string;
    /** median (middle line of box) */
    median: number | string;
    /** mean (optional dotted line in box */
    mean?: number | string;
    /** upper quartile (top of box) */
    q3: number | string;
    /** upper whisker/fence optional */
    upperWhisker?: number | string;
    /** (x-axis) label for this box */

    label: string;
    /** color for this box */
    color?: string;
    /** optional complete data (not recommended for huge datasets) */
    rawData?: number[] | string[];
    /** outliers (data points outside upper and lower whiskers/fences */
    outliers: number[] | string[];
  }[];
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
}

export default function Boxplot({
  data,
  orientation,
  showRawData,
  showMean,
  independentAxisLabel,
  dependentAxisLabel,
  dependentAxisRange,
  markerOpacity,
  showModebar,
  width,
  height,
  margin,
  staticPlot,
  showSpinner,
}: Props) {
  const pdata = data.map((d) => {
    const orientationDependentProps =
      orientation === 'vertical'
        ? {
            x0: d.label,
            y:
              d.rawData && showRawData
                ? [d.rawData]
                : d.outliers.length
                ? [d.outliers]
                : undefined,
          }
        : {
            y0: d.label,
            x:
              d.rawData && showRawData
                ? [d.rawData]
                : d.outliers.length
                ? [d.outliers]
                : undefined,
          };

    return {
      upperfence: [d.upperWhisker],
      lowerfence: [d.lowerWhisker],
      median: [d.median],
      mean: d.mean !== undefined ? [d.mean] : undefined,
      boxmean: d.mean !== undefined && showMean,
      q1: [d.q1],
      q3: [d.q3],
      name: d.label,
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

  const layout = {
    [dependentAxis]: {
      rangemode: 'tozero' as const,
      title: dependentAxisLabel,
      range: dependentAxisRange,
    },
    [independentAxis]: {
      title: independentAxisLabel,
    },
    showlegend: false,
  };
  return (
    <div style={{ position: 'relative', width: width, height: height }}>
      <PlotlyPlot
        data={pdata}
        layout={Object.assign(layout, {
          width: width,
          height: height,
          margin: margin,
        })}
        config={{
          displayModeBar:
            showModebar !== undefined ? showModebar : ModebarDefault,
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
