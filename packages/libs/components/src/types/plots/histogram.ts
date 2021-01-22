// Histogram Type Definitions
export type HistogramData = Array<HistogramDataSeries>;
export type HistogramDataSeries = {
  /** The name of the series. */
  name: string;
  /** The color of the series. Optional. */
  color?: string;
  /** Bins of data in the series. */
  bins: HistogramBin[];
};

export type HistogramBin = {
  /** The starting value of the bin.  */
  binStart: number | string;
  /** A label for the bin. Optional. */
  binLabel?: string;
  /** The count of values in the bin. */
  count: number;
};
