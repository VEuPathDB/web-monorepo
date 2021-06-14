import React from 'react';
import PlotlyPlot, { PlotProps } from './PlotlyPlot';
import { BoxplotData } from '../types/plots';
import { NumberOrDateRange } from '../types/general';

export interface Props extends PlotProps {
  plotData: BoxplotData;
  independentAxisLabel?: string;
  dependentAxisLabel?: string;
  dependentAxisRange?: NumberOrDateRange;
  orientation?: 'vertical' | 'horizontal';
  showRawData?: boolean;
  showMean?: boolean;
  markerOpacity?: number;
}

export default function Boxplot(props: Props) {
  const {
    plotData,
    orientation,
    showRawData,
    showMean,
    independentAxisLabel,
    dependentAxisLabel,
    dependentAxisRange,
    markerOpacity,
    ...restProps
  } = props;

  const data = plotData.map((d) => {
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

Boxplot.defaultProps = {
  markerOpacity: 0.5,
  orientation: 'vertical',
};
