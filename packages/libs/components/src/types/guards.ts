/**
 * This module contains type guards that can be used to determine which
 * plot data type you have when `UnionOfPlotDataTypes` is allowed.
 */

import { NumberOrDate } from './general';
import { HistogramData, PiePlotData, UnionOfPlotDataTypes } from './plots';
import { LinePlotData } from './plots/linePlot';

/** Determine if data is for a histogram plot. */
export function isHistogramData(
  data: UnionOfPlotDataTypes
): data is HistogramData {
  return 'series' in data &&
    'length' in data.series &&
    data.series.length &&
    'bins' in data.series[0]
    ? true
    : false;
}

/** Determine if data is for a pie plot. */
export function isPiePlotData(data: UnionOfPlotDataTypes): data is PiePlotData {
  return 'slices' in data &&
    'length' in data.slices &&
    data.slices.length &&
    'value' in data.slices[0] &&
    'label' in data.slices[0]
    ? true
    : false;
}

/** Determine if data is for a line plot. */
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

/** Determine if a NumberOrDate variable is the built-in Date type */
export function isDate(date: NumberOrDate): date is Date {
  return (date as Date).toISOString !== undefined;
}
