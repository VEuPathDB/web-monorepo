/**
 * This component handles several plots such as marker, line, confidence interval,
 * density, and combinations of plots like marker + line + confidence interval
 */
import PlotlyPlot, { PlotProps } from './PlotlyPlot';
import { XYPlotData } from '../types/plots';
import { Layout } from 'plotly.js';
import { NumberOrDateRange } from '../types/general';

export interface XYPlotProps extends PlotProps<XYPlotData> {
  /** x-axis label */
  independentAxisLabel?: string;
  /** y-axis label */
  dependentAxisLabel?: string;
  /** x-axis range: required for confidence interval */
  independentAxisRange?: NumberOrDateRange;
  /** y-axis range: required for confidence interval */
  dependentAxisRange?: NumberOrDateRange;
  // TO DO
  // opacity?
}

const EmptyXYPlotData: XYPlotData = {
  series: [],
};

export default function XYPlot(props: XYPlotProps) {
  const {
    data = EmptyXYPlotData,
    independentAxisLabel,
    dependentAxisLabel,
    independentAxisRange,
    dependentAxisRange,
    ...restProps
  } = props;

  const layout: Partial<Layout> = {
    xaxis: {
      title: independentAxisLabel,
      range: [independentAxisRange?.min, independentAxisRange?.max], // set this for better display: esp. for CI plot
      zeroline: false, // disable yaxis line
      // make plot border
      mirror: true,
      type: data?.independentValueType === 'date' ? 'date' : 'linear',
      tickfont: data.series.length ? {} : { color: 'transparent' },
    },
    yaxis: {
      title: dependentAxisLabel,
      range: [dependentAxisRange?.min, dependentAxisRange?.max], // set this for better display: esp. for CI plot
      zeroline: false, // disable xaxis line
      // make plot border
      mirror: true,
      type: data?.dependentValueType === 'date' ? 'date' : 'linear',
      tickfont: data.series.length ? {} : { color: 'transparent' },
    },
  };

  return <PlotlyPlot data={data.series} layout={layout} {...restProps} />;
}
