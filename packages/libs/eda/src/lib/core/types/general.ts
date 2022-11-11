/* eslint-disable @typescript-eslint/no-redeclare */
import {
  Type,
  TypeOf,
  type,
  number,
  string,
  union,
  keyof,
  intersection,
  partial,
  nullType,
} from 'io-ts';
import {
  NumberRange as NumberRangeT,
  DateRange as DateRangeT,
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

export type TimeUnit = TypeOf<typeof TimeUnit>;
export const TimeUnit = keyof({
  day: null,
  week: null,
  month: null,
  year: null,
});

export type NumberOrNull = TypeOf<typeof NumberOrNull>;
export const NumberOrNull = union([number, nullType]);

export type BinSpec = TypeOf<typeof BinSpec>;
export const BinSpec = intersection([
  type({ type: keyof({ binWidth: null, numBins: null }) }),
  partial({
    value: number,
    units: TimeUnit,
    range: NumberOrDateRange,
  }),
]);

// this is distinct to the binWidthSlider in web-components, which is unfortunate
// perhaps we can make these two consistent somehow?
export type BinWidthSlider = TypeOf<typeof BinWidthSlider>;
export const BinWidthSlider = type({
  min: number,
  max: number,
  step: number,
});
