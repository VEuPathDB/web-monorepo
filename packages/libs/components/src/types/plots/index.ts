/**
 * Module used as a convenience wrapper for related type definitions.
 */
import { HistogramData } from './histogram';
import { LinePlotData } from './linePlot';
import { PiePlotData } from './piePlot';
import { BoxplotData } from './boxplot';
import { XYPlotData } from './xyplot';
import { BarplotData } from './barplot';

// Commonly used type definitions for plots.

export type BarLayoutOptions = 'overlay' | 'stack' | 'group';
export type OrientationOptions = 'vertical' | 'horizontal';

export type UnionOfPlotDataTypes =
  | HistogramData
  | PiePlotData
  | LinePlotData
  | BoxplotData
  | XYPlotData
  | BarplotData;

export * from './addOns';

export * from './histogram';
export * from './linePlot';
export * from './piePlot';
export * from './boxplot';
export * from './xyplot';
export * from './barplot';
