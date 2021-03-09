/**
 * General type definitions that don't fit into a more specialized category.
 * Or, at least, haven't found a more specific home yet.
 */
import { Unit } from 'date-arithmetic';

export type NumberOrDate = number | Date;

export type ErrorManagement = {
  errors: Array<Error>;
  addError: (error: Error) => void;
  removeError: (error: Error) => void;
  clearAllErrors: () => void;
};

export type NumericRange = {
  min: number;
  max: number;
};

// still to be decided - maybe use Date type?
export type DateRange = {
  min: Date;
  max: Date;
};

// Reminder, units are: 'seconds' | 'minutes' | 'hours' | 'day' | 'week' | 'month' | 'year' | 'decade' | 'century'
// from with https://www.npmjs.com/package/date-arithmetic
//
// It's a tuple because that's easier to use with date-arithmetic methods.
// e.g.
// const offset : TimeDelta = [ 1, 'week' ];
// const newDate : date = DateMath.add(oldDate, ...offset);
export type TimeDelta = [number, Unit];
