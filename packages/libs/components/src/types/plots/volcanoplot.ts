import { array, type, string, TypeOf, union, number, undefined } from 'io-ts';

export type VolcanoPlotDataPoint = {
  // log2foldChange becomes the x axis. Also used for coloring points
  log2foldChange: string;
  // pValue will be negative log transformed for the y axis. Also
  // needed as is (untransformed) in the tooltip and when coloring points
  pValue: string;
  // Used for thresholding and tooltip
  adjustedPValue: string;
  // Used for tooltip
  pointID: string;
};

export const VolcanoPlotData = array(
  type({
    log2foldChange: union([string, undefined]),
    pValue: union([string, undefined]),
    adjustedPValue: union([string, undefined]),
    pointID: union([string, undefined]),
  })
);

export type VolcanoPlotData = TypeOf<typeof VolcanoPlotData>;
