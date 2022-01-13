import { ScatterPlotDataSeries } from '.';
import { AvailableUnitsAddon } from './addOns';
import { Bin, BinWidthSlider } from '../general';

type Override<T1, T2> = Omit<T1, keyof T2> & T2;

export type LinePlotDataSeries = Override<
  ScatterPlotDataSeries,
  {
    mode?: 'lines' | 'lines+markers';
  }
> & {
  bins?: Bin[];
};

export type LinePlotData = {
  series: Array<LinePlotDataSeries>;
  binWidthSlider?: BinWidthSlider;
} & AvailableUnitsAddon;
