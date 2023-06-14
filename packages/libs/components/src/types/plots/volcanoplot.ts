import { array, type, string, TypeOf } from 'io-ts';

export type VolcanoPlotDataPoint = {
  // log2foldChange becomes the x axis. Also used for coloring points
  log2foldChange: string;
  // pValue will be negative log transformed for the y axis. Also
  // needed as is (untransformed) in the tooltip and when coloring points
  pValue: string;
  // Used for thresholding and tooltip
  adjustedPValue: string;
  // Used for tooltip
  pointId: string;
};

export const VolcanoPlotData = array(
  type({
    log2foldChange: string,
    pValue: string,
    adjustedPValue: string,
    pointId: string,
  })
);

export type VolcanoPlotData = TypeOf<typeof VolcanoPlotData>;
