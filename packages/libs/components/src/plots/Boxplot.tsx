import React from 'react';
import { Layout } from 'plotly.js';
import { PlotParams } from 'react-plotly.js';
import PlotlyPlot, { PlotProps } from './PlotlyPlot';
import {
  BoxplotData,
  OpacityAddon,
  OpacityDefault,
  OrientationAddon,
  OrientationDefault,
} from '../types/plots';
import { NumberOrDateRange } from '../types/general';

export interface BoxplotProps
  extends PlotProps<BoxplotData>,
    OrientationAddon,
    OpacityAddon {
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
  /** independentValueType: 'string' | 'number' | 'date' | 'longitude' | 'category' */
  independentValueType?:
    | 'string'
    | 'number'
    | 'date'
    | 'longitude'
    | 'category';
  /** dependentValueType: 'string' | 'number' | 'date' | 'longitude' | 'category' */
  dependentValueType?: 'string' | 'number' | 'date' | 'longitude' | 'category';
}
const EmptyBoxplotData: BoxplotData = [];

export default function Boxplot(props: BoxplotProps) {
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
    independentValueType,
    dependentValueType,
    ...restProps
  } = props;

  // margin,

  const data: PlotParams['data'] = plotData.map((d) => {
    const [independentAxis, dependentAxis] =
      orientation === 'vertical' ? ['x', 'y'] : ['y', 'x'];
    const orientationDependentProps: any = {
      [independentAxis]: d.label,
      [dependentAxis]:
        d.rawData && showRawData
          ? d.rawData
          : d.outliers?.length
          ? d.outliers
          : undefined,
    };

    // seems like plotly bug: y[0] or x[0] should not be empty array (e.g., with overlay variable)
    // see multipleData at story file (Kenya case)
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
      mean: d.mean !== null ? d.mean : undefined,
      boxmean: d.mean !== null && showMean,
      q1: d.q1,
      q3: d.q3,
      // name is used as legend
      name: d.name,
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

  console.log('data =', data);

  const dependentAxis = orientation === 'vertical' ? 'yaxis' : 'xaxis';
  const independentAxis = orientation === 'vertical' ? 'xaxis' : 'yaxis';

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
      // set type for date
      type: independentValueType === 'date' ? 'date' : undefined,
    },
    [dependentAxis]: {
      automargin: true,
      showline: true,
      rangemode: 'tozero' as const,
      title: dependentAxisLabel,
      range: dependentAxisRange
        ? [dependentAxisRange?.min, dependentAxisRange?.max]
        : undefined,
      tickfont: data.length ? {} : { color: 'transparent' },
      showticklabels: showDependentAxisTickLabel,
      // type: 'date' is required for y-axis date case like enrollment year
      // but not working properly as it is classified as number at data
      type: dependentValueType === 'date' ? 'date' : undefined,
    },
    //DKDK don't forget this for multiple datasets
    boxmode: 'group',
  };

  return <PlotlyPlot data={data} layout={layout} {...restProps} />;
}
