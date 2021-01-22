/**
 * This module contains type guards that can be used to determine which
 * plot data type you have when `UnionOfPlotDataTypes` is allowed.
 */

import { HistogramData, PiePlotData, UnionOfPlotDataTypes } from './plots';
import { LinePlotData } from './plots/linePlot';

export function isHistogramData(
  data: UnionOfPlotDataTypes
): data is HistogramData {
  return 'length' in data && data.length && 'bins' in data[0] ? true : false;
}

export function isPiePlotData(data: UnionOfPlotDataTypes): data is PiePlotData {
  return 'length' in data &&
    data.length &&
    'value' in data[0] &&
    'label' in data[0]
    ? true
    : false;
}

export function isLinePlotData(
  data: UnionOfPlotDataTypes
): data is LinePlotData {
  const linePlotDataKeys = ['name', 'x', 'y', 'fill', 'line'];

  return 'length' in data &&
    data.length &&
    Object.keys(data).every((key) => key in linePlotDataKeys)
    ? true
    : false;
}
