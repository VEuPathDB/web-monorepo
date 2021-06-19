import React from 'react';
import { PlotParams } from 'react-plotly.js';
import PlotlyPlot, { PlotProps } from './PlotlyPlot';
import { BoxplotData } from '../types/plots';
import { NumberOrDateRange } from '../types/general';

// will import this from a central location
interface OrientationProp {
  orientation?: 'vertical' | 'horizontal';
}

export interface BoxplotProps extends PlotProps<BoxplotData> {
  independentAxisLabel?: string;
  dependentAxisLabel?: string;
  dependentAxisRange?: NumberOrDateRange;
  /** Orientation of plot - default is vertical boxes displayed in a horizontal row */
  orientation?: 'vertical' | 'horizontal';
  /** show the rawData (if given) - optional */
  showRawData?: boolean;
  /** Show the mean as an extra dotted line in the box - optional */

  showMean?: boolean;
  /** Opacity of outliers or rawData markers 0 to 1 (default 0.5) */
  opacity?: number;
}

export default function Boxplot(props: BoxplotProps) {
  const {
    data: plotData,
    orientation = 'vertical',
    showRawData,
    showMean,
    independentAxisLabel,
    dependentAxisLabel,
    dependentAxisRange,
    opacity = 0.5,
    ...restProps
  } = props;

  const data: PlotParams['data'] = plotData.map((d) => {
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
        opacity: opacity,
        color: d.color,
      },
      ...orientationDependentProps,
      type: 'box',
    };
  });

  const dependentAxis = orientation === 'vertical' ? 'yaxis' : 'xaxis';
  const independentAxis = orientation === 'vertical' ? 'xaxis' : 'yaxis';

  const layout = {
    [dependentAxis]: {
      rangemode: 'tozero' as const,
      title: dependentAxisLabel,
      range: dependentAxisRange
        ? [dependentAxisRange?.min, dependentAxisRange?.max]
        : undefined,
    },
    [independentAxis]: {
      title: independentAxisLabel,
    },
    showlegend: false,
  };
  return <PlotlyPlot data={data} layout={layout} {...restProps} />;
}
