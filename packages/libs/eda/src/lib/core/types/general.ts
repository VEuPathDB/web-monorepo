import { Type, type, number, string, failure, success } from 'io-ts';
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
