export type VolcanoPlotDataSeries = {
  /** x/y data */
  foldChange: string[];
  pValue: string[];
  adjustedPValue: string[];
  pointId: string[];
  overlayValue: string;
  /** opacity of points? */
  opacity?: number;
};

export type VolcanoPlotData = {
  /** an array of data series (aka traces) */
  data: VolcanoPlotDataSeries[];
};
