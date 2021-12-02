export type MosaicPlotData = {
  // N columns, M rows
  values: Array<Array<number>>; // MxN (M = outerLength; N = innerLength)
  independentLabels: Array<string>; // N
  dependentLabels: Array<string>; // M
};
