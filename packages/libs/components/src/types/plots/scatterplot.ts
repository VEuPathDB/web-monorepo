export type ScatterPlotDataSeries = {
  /** x/y data */
  x: (number | null)[] | string[];
  y: (number | null)[] | string[];
  /** legend text */
  name?: string;
  /** plot style */
  mode?: 'markers' | 'lines' | 'lines+markers';
  /** plot with marker: scatter plot with raw data */
  marker?: {
    /** marker color */
    color?: string;
    /** marker size: no unit */
    size?: number;
    /** marker's perimeter setting */
    line?: {
      /** marker's perimeter color */
      color?: string;
      /** marker's perimeter color: no unit */
      width?: number;
    };
    symbol?: string;
  };
  /** plot with marker: scatter plot with smoothedMean and bestfitline; line and density plots */
  line?: {
    /** line color */
    color?: string;
    /** line style */
    shape?: 'spline' | 'linear';
    /** line width: no unit */
    width?: number;
  };
  /** filling plots: tozerox - scatter plot's confidence interval; toself - density plot */
  fill?: 'tozerox' | 'tozeroy' | 'toself';
  /** filling plots: color */
  fillcolor?: string;
  /** R-square value for Best fit option */
  r2?: number;
  /** opacity of points? */
  opacity?: number;
  /** add a prop to check whether smoothed mean exists */
  hasSmoothedMeanData?: boolean;
};

export type ScatterPlotData = {
  /** an array of data series (aka traces) */
  series: ScatterPlotDataSeries[];
};
