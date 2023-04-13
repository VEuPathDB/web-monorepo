export type VolcanoPlotData = {
  foldChange: string[];
  pValue: string[];
  adjustedPValue: string[];
  pointId: string[];
};

// would be more natural to have an array of objects, like an array of DataPoints
// (this is even more general, so not visx specific yay!)
// wouldn't have to worry about arrays having the same length
// can plot.data return that type of structure?
// Would be able to remove the whole data processing part
// Think of visualizatoin component as an adapter to the specific application
// Could the visualization do the processing?
