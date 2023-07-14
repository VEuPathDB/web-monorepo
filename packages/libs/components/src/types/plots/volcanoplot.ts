// Can remove the | undefined from most of these after some other backend work is merged
export type VolcanoPlotDataPoint = {
  // log2foldChange becomes the x axis. Also used for coloring points
  log2foldChange: string | undefined;
  // pValue will be negative log transformed for the y axis. Also
  // needed as is (untransformed) in the tooltip and when coloring points
  pValue: string | undefined;
  // Used for thresholding and tooltip
  adjustedPValue: string | undefined;
  // Used for tooltip
  pointID: string | undefined;
};

export type VolcanoPlotData = Array<VolcanoPlotDataPoint>;
