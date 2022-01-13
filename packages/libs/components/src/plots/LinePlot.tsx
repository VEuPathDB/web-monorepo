import { makePlotlyPlotComponent, PlotProps } from './PlotlyPlot';
import { LinePlotData } from '../types/plots';
import { Layout } from 'plotly.js';
import { NumberOrDateRange } from '../types/general';

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

  return {
    data: data.series,
    layout,
    ...restProps,
  };
});

export default LinePlot;
