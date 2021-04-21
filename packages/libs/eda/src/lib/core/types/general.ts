/* eslint-disable @typescript-eslint/no-redeclare */
import { Type, type, number, string, union, keyof } from 'io-ts';
import {
  NumberRange as NumberRangeT,
  DateRange as DateRangeT,
  TimeUnit as TimeUnitT,
} from '@veupathdb/components/lib/types/general';

export type NumberRange = NumberRangeT;
export const NumberRange: Type<NumberRangeT> = type({
  min: number,
  max: number,
});

export type DateRange = DateRangeT;
export const DateRange: Type<DateRangeT> = type({ min: string, max: string });

type NumberOrDateRangeT = NumberRange | DateRange;
export type NumberOrDateRange = NumberOrDateRangeT;
export const NumberOrDateRange: Type<NumberOrDateRangeT> = union([
  NumberRange,
  DateRange,
]);

export type TimeUnit = TimeUnitT;
export const TimeUnit: Type<TimeUnitT> = keyof({
  day: null,
  week: null,
  month: null,
  year: null,
});
