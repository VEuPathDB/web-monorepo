export type BoxplotData = {
  // number | string means number or date
  /** lower whisker/fence optional */
  lowerWhisker?: number | string;
  /** lower quartile (bottom of box) */
  q1: number | string;
  /** median (middle line of box) */
  median: number | string;
  /** mean (optional dotted line in box */
  mean?: number | string;
  /** upper quartile (top of box) */
  q3: number | string;
  /** upper whisker/fence optional */
  upperWhisker?: number | string;
  /** (x-axis) label for this box */
  label: string;
  /** color for this box */
  color?: string;
  /** optional complete data (not recommended for huge datasets) */
  rawData?: number[] | string[];
  /** outliers (data points outside upper and lower whiskers/fences */
  outliers: number[] | string[];
}[];
