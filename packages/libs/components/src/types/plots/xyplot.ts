export type XYPlotData = {
  /** an array of data series (aka traces) */
  series: {
    /** x/y data */
    x: number[] | string[];
    y: number[] | string[];
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
    fill?: 'tozerox' | 'toself';
    /** filling plots: color */
    fillcolor?: string;
  }[];

  /** independentValueType 'number' (default) or 'date' (x data should be given as string[])  */
  independentValueType?: 'number' | 'date';
  /** dependentValueType 'number' (default) or 'date' (y data should be given as string[])  */
  dependentValueType?: 'number' | 'date';
};
