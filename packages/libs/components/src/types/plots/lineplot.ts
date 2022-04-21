import { ScatterPlotDataSeries } from '.';
import { AvailableUnitsAddon } from './addOns';
import { BinWidthSlider } from '../general';

type Override<T1, T2> = Omit<T1, keyof T2> & T2;

export type LinePlotDataSeries = Override<
  ScatterPlotDataSeries,
  {
    mode?: 'lines' | 'lines+markers';
  }
> & {
  /**
   * y coordinates for regular error bars (vertical in regular orientation)
   *
   */
  yErrorBarUpper?: (number | string | null)[];
  yErrorBarLower?: (number | string | null)[];
  /* How many data points were binned? */
  extraTooltipText?: string[];
  /* Strings (such as '[10,15)') to describe how the x-axis variable was binned for tooltip info only */
  binLabel?: string[];
};

export type LinePlotData = {
  series: Array<LinePlotDataSeries>;
  binWidthSlider?: BinWidthSlider;
} & AvailableUnitsAddon;
