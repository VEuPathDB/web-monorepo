export type VolcanoPlotDataSeries = {
  foldChange: string[];
  pValue: string[];
  adjustedPValue: string[];
  pointId: string[];
};

export type VolcanoPlotData = {
  /** an array of data series (aka traces) */
  series: VolcanoPlotDataSeries[];
};
