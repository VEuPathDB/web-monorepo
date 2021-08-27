import { makePlotlyPlotComponent, PlotProps } from './PlotlyPlot';
import { XYPlotData } from '../types/plots';
import { Layout } from 'plotly.js';
import { NumberOrDateRange } from '../types/general';

export interface XYPlotProps extends PlotProps<XYPlotData> {
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

const EmptyXYPlotData: XYPlotData = {
  series: [],
};

/**
 * This component handles several plots such as marker, line, confidence interval,
 * density, and combinations of plots like marker + line + confidence interval
 */
const XYPlot = makePlotlyPlotComponent('XYPlot', (props: XYPlotProps) => {
  const {
    data = EmptyXYPlotData,
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
      zeroline: false, // disable yaxis line
      // make plot border
      mirror: true,
      // date or number type (from variable.type)
      type: independentValueType === 'date' ? 'date' : undefined,
      tickfont: data.series.length ? {} : { color: 'transparent' },
    },
    yaxis: {
      title: dependentAxisLabel,
      range: [dependentAxisRange?.min, dependentAxisRange?.max], // set this for better display: esp. for CI plot
      zeroline: false, // disable xaxis line
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

export default XYPlot;
