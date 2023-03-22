import { AvailableUnitsAddon } from './addOns';
import { Bin, BinWidthSlider } from '../general';

/**
 * Type definitions related to histograms.
 */
export type HistogramData = {
  series: Array<HistogramDataSeries>;
  binWidthSlider?: BinWidthSlider;
} & AvailableUnitsAddon; // TO DO: figure out if we still need this

export type HistogramDataSeries = {
  /** The name of the series. */
  name: string;
  /** The color of the series. Optional. */
  color?: string;
  /** The color for the outline of the bars. Optional. */
  borderColor?: string;
  /** Bins of data in the series. */
  bins: Bin[];
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
