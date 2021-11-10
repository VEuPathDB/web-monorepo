export type BoxplotDataObject = {
  // number | string means number or date
  // this is based on current data API doc
  /** lower whisker/fence optional */
  lowerfence?: number[] | string[];
  /** upper whisker/fence optional */
  upperfence?: number[] | string[];
  /** lower quartile (bottom of box) */
  q1: number[] | string[];
  /** upper quartile (top of box) */
  q3: number[] | string[];
  /** median (middle line of box) */
  median: number[] | string[];
  /** mean (optional dotted line in box */
  mean?: number[] | string[];
  /** (x-axis) label for this box */
  label: string[];
  /** legend name */
  name?: string;
  /** color for this box. Optional. */
  color?: string;
  /** color for the box border. Optional. */
  borderColor?: string;
  /** symbol to use for outlier markers. Optional. Default is 'circle-open' */
  outlierSymbol?: 'x' | 'circle-open';
  /** optional complete data (not recommended for huge datasets) */
  rawData?: number[][] | string[][];
  /** outliers: data points outside upper and lower whiskers/fences (optional) */
  outliers?: number[][] | string[][];
};

export type BoxplotData = BoxplotDataObject[];
