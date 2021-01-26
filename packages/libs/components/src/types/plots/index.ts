/**
 * Module used as a convenience wrapper for related type definitions.
 */
import { HistogramData } from './histogram';
import { LinePlotData } from './linePlot';
import { PiePlotData } from './piePlot';

// Commonly used type definitions for plots.
export type BarLayoutOptions = 'overlay' | 'stack' | 'group';
export type OrientationOptions = 'vertical' | 'horizontal';

export type UnionOfPlotDataTypes = HistogramData | PiePlotData | LinePlotData;

export * from './histogram';
export * from './piePlot';
