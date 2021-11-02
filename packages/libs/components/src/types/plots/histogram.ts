import { AvailableUnitsAddon } from './addOns';
import { NumberOrTimeDeltaRange, NumberOrTimeDelta } from '../general';

/**
 * Type definitions related to histograms.
 */
export type HistogramData = {
  series: Array<HistogramDataSeries>;
  /** Is the continous variable that was binned numeric or date (date-time actually).
   * The implementation will assume 'number' if not provided.
   * This is mainly needed if providing year-only dates, because Plotly can't guess correctly for them.
   */
  valueType?: 'number' | 'date';
  /** Current binWidth. */
  binWidth?: NumberOrTimeDelta;
  /** The acceptable range of binWidth values. */
  binWidthRange?: NumberOrTimeDeltaRange;
  /** The amount that binWidth should be adjusted each time the
   * user drags the slider to the left or right. */
  binWidthStep?: number;
} & AvailableUnitsAddon; // TO DO: figure out if we still need this

export type HistogramDataSeries = {
  /** The name of the series. */
  name: string;
  /** The color of the series. Optional. */
  color?: string;
  /** The color for the outline of the bars. Optional. */
  borderColor?: string;
  /** Bins of data in the series. */
  bins: HistogramBin[];
  /** Summary stats for the series */
  summary?: Partial<{
    min: number | string;
    q1: number | string;
    median: number | string;
    mean: number | string;
    q3: number | string;
    max: number | string;
  }>;
};

export type HistogramBin = {
  /** The starting value of the bin.  */
  binStart: number | string;
  /** The ending value of the bin.  */
  binEnd: number | string;
  /** A label for the bin. */
  binLabel: string;
  /** The count of values in the bin. */
  count: number;
};
