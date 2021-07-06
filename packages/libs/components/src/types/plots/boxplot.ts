export type BoxplotData = {
  // number | string means number or date
  // this is based on current data API doc
  /** lower whisker/fence optional */
  lowerfence?: number[];
  /** upper whisker/fence optional */
  upperfence?: number[];
  /** lower quartile (bottom of box) */
  q1: number[];
  /** upper quartile (top of box) */
  q3: number[];
  /** median (middle line of box) */
  median: number[];
  /** mean (optional dotted line in box */
  mean?: number[];
  /** (x-axis) label for this box */
  label: string[];
  /** legend name */
  name?: string;
  /** color for this box */
  color?: string;
  /** optional complete data (not recommended for huge datasets) */
  rawData?: number[][] | string[][];
  /** outliers: data points outside upper and lower whiskers/fences (optional) */
  outliers?: number[][] | string[][];
}[];
