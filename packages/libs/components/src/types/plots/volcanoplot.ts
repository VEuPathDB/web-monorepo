export type VolcanoPlotDataSeries = {
  /** x/y data */
  x: (number | null)[] | string[];
  y: (number | null)[] | string[];
  /** legend text */
  name?: string;
  /** plot style */
  mode?: 'markers';
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
  /** opacity of points? */
  opacity?: number;
};

export type VolcanoPlotData = {
  /** an array of data series (aka traces) */
  series: VolcanoPlotDataSeries[];
};
