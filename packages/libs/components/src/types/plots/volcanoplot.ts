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

export type VolcanoPlotData = Array<VolcanoPlotDataPoint>;
