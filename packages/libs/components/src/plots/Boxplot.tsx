import React from 'react';
import PlotlyPlot, { PlotProps } from './PlotlyPlot';
import { Datum } from 'plotly.js';

export interface Props extends PlotProps {
  boxplotData: {
    lowerWhisker?: Datum;
    q1: Datum; // would like PlotData['q1'] but is the @types module not up to date?
    median: Datum;
    mean?: Datum;
    q3: Datum;
    upperWhisker?: Datum;
    label: string;
    color?: string;
    rawData?: Datum[]; // PlotData['y'] | PlotData['x'], // doesn't seem to work
    // but are we trying to remove dependencies on Plotly types?
    outliers: Datum[];
  }[];
  independentAxisLabel?: string;
  dependentAxisLabel?: string;
  defaultDependentAxisRange?: [Datum, Datum]; // can be changed by plotly's built-in controls
  orientation?: 'vertical' | 'horizontal';
  showRawData?: boolean;
  showMean?: boolean;
  markerOpacity?: number;
}

export default function Boxplot(props: Props) {
  const {
    boxplotData,
    orientation,
    showRawData,
    showMean,
    independentAxisLabel,
    dependentAxisLabel,
    defaultDependentAxisRange,
    markerOpacity,
  } = props;

  const data = boxplotData.map((d) => {
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
      range: defaultDependentAxisRange,
    },
    [independentAxis]: {
      title: independentAxisLabel,
    },
    showlegend: false,
  };
  return <PlotlyPlot data={data} layout={layout} {...props} />;
}

Boxplot.defaultProps = {
  markerOpacity: 0.5,
  orientation: 'vertical',
};
