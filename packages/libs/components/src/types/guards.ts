/**
 * This module contains type guards that can be used to determine which
 * plot data type you have when `UnionOfPlotDataTypes` is allowed.
 */

import {
  NumberOrDate,
  TimeUnit,
  TimeDelta,
  NumberOrTimeDelta,
} from './general';
import {
  FacetedData,
  FacetedPlotRef,
  HistogramData,
  PiePlotData,
  PlotRef,
  UnionOfPlotDataTypes,
} from './plots';
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

/** Determine if a NumberOrDate variable is a string that can be converted to a date */
export function isDate(date: NumberOrDate): date is string {
  return new Date(date as string).toString() !== 'Invalid Date';
}

/** Determine if a date/time quantity is a TimeUnit */
export function isTimeUnit(maybeTimeUnit: string): maybeTimeUnit is TimeUnit {
  switch (maybeTimeUnit) {
    case 'milliseconds':
    case 'seconds':
    case 'minutes':
    case 'hours':
    case 'day':
    case 'week':
    case 'month':
    case 'year':
    case 'decade':
    case 'century':
      return true;
    default:
      return false;
  }
}

/** Determine if a NumberOrTimeDelta is a TimeDelta */
export function isTimeDelta(
  maybeTimeDelta: NumberOrTimeDelta
): maybeTimeDelta is TimeDelta {
  return typeof maybeTimeDelta !== 'number' && 'unit' in maybeTimeDelta;
}

/** Is data faceted or not? */
export function isFaceted<T>(
  maybeFacetedData?: T | FacetedData<T>
): maybeFacetedData is FacetedData<T> {
  return (
    maybeFacetedData != null &&
    'facets' in maybeFacetedData &&
    'every' in maybeFacetedData.facets &&
    maybeFacetedData.facets.every((d) => 'label' in d && 'data' in d)
  );
}

/** Is this plot ref a FacetedPlotRef? */
export function isFacetedPlotRef(
  maybeFacetedPlotRef?: FacetedPlotRef | PlotRef
): maybeFacetedPlotRef is FacetedPlotRef {
  return Array.isArray(maybeFacetedPlotRef);
}
