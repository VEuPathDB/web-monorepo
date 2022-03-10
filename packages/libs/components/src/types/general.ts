/**
 * General type definitions that don't fit into a more specialized category.
 * Or, at least, haven't found a more specific home yet.
 */

export type NumberOrDate = number | string;

export type ErrorManagement = {
  errors: Array<Error>;
  addError: (error: Error) => void;
  removeError: (error: Error) => void;
  clearAllErrors: () => void;
};

export type NumberRange = {
  min: number;
  max: number;
};

export type DateRange = {
  min: string;
  max: string;
};

export type TimeDeltaRange = {
  min: number;
  max: number;
  unit: string;
};

// We are NOT USING date-arithmetic's Unit type
// It ties us to this particular module.
// We'll use a plain string type, and validate data coming from the back-end instead (in client code).
// import { Unit } from 'date-arithmetic';
// Reminder, units are: 'seconds' | 'minutes' | 'hours' | 'day' | 'week' | 'month' | 'year' | 'decade' | 'century'
// from with https://www.npmjs.com/package/date-arithmetic

export type TimeUnit = string;
export type TimeDelta = { value: number; unit: string };
export type NumberOrTimeDelta = number | TimeDelta;
export type NumberOrDateRange = NumberRange | DateRange;
export type NumberOrTimeDeltaRange = NumberRange | TimeDeltaRange;
export type sampleSize = number;
export type proportionSampleSize = { numerator: number; denominator: number };

export type Bin = {
  /** The starting value of the bin.  */
  binStart: number | string;
  /** The ending value of the bin.  */
  binEnd: number | string;
  /** A label for the bin. */
  binLabel: string;
  /** The value to be mapped to a visual element in a plot.
   * Could represent a count, proportion, mean, etc. */
  value: number;
  /** The number of samples contributing to the calculation of 'value'. */
  sampleSize?: sampleSize | proportionSampleSize;
};

export type BinWidthSlider = {
  /** Is the continous variable that was binned numeric or date (date-time actually).
   * The implementation will assume 'number' if not provided.
   * This is mainly needed if providing year-only dates, because Plotly can't guess correctly for them.
   */
  valueType: 'number' | 'date';
  /** Current binWidth. */
  binWidth: NumberOrTimeDelta;
  /** The acceptable range of binWidth values. */
  binWidthRange: NumberOrTimeDeltaRange;
  /** The amount that binWidth should be adjusted each time the
   * user drags the slider to the left or right. */
  binWidthStep: number;
};
