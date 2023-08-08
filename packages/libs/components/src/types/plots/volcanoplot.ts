// Can remove the | undefined from most of these after some other backend work is merged
export type VolcanoPlotDataPoint = {
  // log2foldChange becomes the x axis. Also used for coloring points
  log2foldChange?: string;
  // pValue will be negative log transformed for the y axis. Also
  // needed as is (untransformed) in the tooltip and when coloring points
  pValue?: string;
  // Used for thresholding and tooltip
  adjustedPValue?: string;
  // Used for tooltip
  pointIDs?: string[];
  // Used to determine color of data point in the plot
  significanceColor?: string;
};

export type VolcanoPlotData = Array<VolcanoPlotDataPoint>;
