import { AvailableUnitsAddon } from '.';
import { NumberOrTimeDeltaRange, NumberOrTimeDelta } from '../general';

/**
 * Type definitions related to histograms.
 */
export type HistogramData = {
  series: Array<HistogramDataSeries>;
  /** Is the continous variable that was binned numeric or date (date-time actually).
   * The implementation will assume 'number' if not provided.
   */
  valueType?: 'number' | 'date';
  /** Current binWidth. */
  binWidth?: NumberOrTimeDelta;
  /** The acceptable range of binWidth values. */
  binWidthRange?: NumberOrTimeDeltaRange;
  /** The amount that binWidth should be adjusted each time the
   * user drags the slider to the left or right. */
  binWidthStep?: NumberOrTimeDelta;
} & AvailableUnitsAddon;

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
  binStart: number | Date;
  /** The ending value of the bin.  */
  binEnd: number | Date;
  /** A label for the bin. */
  binLabel: string;
  /** The count of values in the bin. */
  count: number;
};
