/**
 * This component handles several plots such as marker, line, confidence interval,
 * density, and combinations of plots like marker + line + confidence interval
 */
import PlotlyPlot, { PlotProps } from './PlotlyPlot';
import { ScatterplotData } from '../types/plots/scatterplot';
import { Layout } from 'plotly.js';
import { NumberOrDateRange } from '../types/general';

export interface ScatterplotProps extends PlotProps<ScatterplotData> {
  /** x-axis label */
  independentAxisLabel?: string;
  /** y-axis label */
  dependentAxisLabel?: string;
  /** x-axis range: required for confidence interval */
  independentAxisRange?: NumberOrDateRange;
  /** y-axis range: required for confidence interval */
  dependentAxisRange?: NumberOrDateRange;
}

export default function XYPlot(props: ScatterplotProps) {
  const {
    data,
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
      type: data?.valueType === 'date' ? 'date' : 'linear',
    },
    yaxis: {
      title: dependentAxisLabel,
      range: [dependentAxisRange?.min, dependentAxisRange?.max], // set this for better display: esp. for CI plot
      zeroline: false, // disable xaxis line
      // make plot border
      mirror: true,
    },
  };

  return <PlotlyPlot data={data.series} layout={layout} {...restProps} />;
}
