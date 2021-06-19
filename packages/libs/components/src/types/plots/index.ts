/**
 * Module used as a convenience wrapper for related type definitions.
 */
import { HistogramData } from './histogram';
import { LinePlotData } from './linePlot';
import { PiePlotData } from './piePlot';
import { BoxplotData } from './boxplot';
import { XYPlotData } from './xyplot';

// Commonly used type definitions for plots.

export type OrientationAddon = {
  /** Orientation of plot - default is vertical boxes displayed in a horizontal row */
  orientation?: 'vertical' | 'horizontal';
};
export type OpacityAddon = {
  /** Opacity of outliers or rawData markers 0 to 1 (default 0.5) */
  opacity?: number;
};

export type BarLayoutOptions = 'overlay' | 'stack' | 'group';
export type OrientationOptions = 'vertical' | 'horizontal';
export type AvailableUnitsAddon =
  | {
      /** What units does the backend support switching between? */
      availableUnits: Array<string>;
      /** Currently selected unit. */
      selectedUnit: string;
    }
  | {
      /** What units does the backend support switching between? */
      availableUnits?: never;
      /** Currently selected unit. */
      selectedUnit?: never;
    };

export type UnionOfPlotDataTypes =
  | HistogramData
  | PiePlotData
  | LinePlotData
  | BoxplotData
  | XYPlotData;

export * from './histogram';
export * from './linePlot';
export * from './piePlot';
export * from './boxplot';
export * from './xyplot';
