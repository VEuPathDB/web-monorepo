/**
 * Module used as a convenience wrapper for related type definitions.
 */
import { ToImgopts } from 'plotly.js';

import { HistogramData } from './histogram';
import { LinePlotData } from './linePlot';
import { PiePlotData } from './piePlot';
import { BoxplotData } from './boxplot';
import { XYPlotData } from './xyplot';
import { BarplotData } from './barplot';
import { HeatmapData } from './heatmap';
import { MosaicPlotData } from './mosaicPlot';
import { BirdsEyePlotData } from './birdseyeplot';

/**
 * A generic imperative interface to plota. This allows us to create a facade
 * to interact with plot internals, such as exporting an image.
 */
export interface PlotRef {
  toImage: (imageOpts: ToImgopts) => Promise<string>;
}

export type FacetedPlotRef = PlotRef[];

export type FacetedData<D> = {
  facets: {
    label: string;
    data?: D;
  }[];
};

// Commonly used type definitions for plots.

export type BarLayoutOptions = 'overlay' | 'stack' | 'group';
export type OrientationOptions = 'vertical' | 'horizontal';

export type UnionOfPlotDataTypes =
  | HistogramData
  | PiePlotData
  | LinePlotData
  | BoxplotData
  | XYPlotData
  | BarplotData
  | HeatmapData
  | MosaicPlotData
  | BirdsEyePlotData;

export * from './addOns';

export * from './histogram';
export * from './linePlot';
export * from './piePlot';
export * from './boxplot';
export * from './xyplot';
export * from './barplot';
export * from './heatmap';
export * from './mosaicPlot';
export * from './birdseyeplot';
