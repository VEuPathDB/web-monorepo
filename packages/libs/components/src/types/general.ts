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
