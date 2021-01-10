/**
 * This module contains type guards that can be used to determine which
 * plot data type you have when `UnionOfPlotDataTypes` is allowed.
 */

import { HistogramData, UnionOfPlotDataTypes } from './plots';

export function isHistogram(data: UnionOfPlotDataTypes): data is HistogramData {
  return 'length' in data && data.length && 'bins' in data[0] ? true : false;
}
