/* eslint-disable @typescript-eslint/no-redeclare */
import * as t from 'io-ts';

const _FilterBase = t.type({
  entityId: t.string,
  variableId: t.string,
});

export type StringSetFilter = t.TypeOf<typeof StringSetFilter>;
export const StringSetFilter = t.intersection([
  _FilterBase,
  t.type({
    type: t.literal('stringSet'),
    stringSet: t.array(t.string),
  }),
]);

export type NumberSetFilter = t.TypeOf<typeof NumberSetFilter>;
export const NumberSetFilter = t.intersection([
  _FilterBase,
  t.type({
    type: t.literal('numberSet'),
    numberSet: t.array(t.number),
  }),
]);

export type DateSetFilter = t.TypeOf<typeof DateSetFilter>;
export const DateSetFilter = t.intersection([
  _FilterBase,
  t.type({
    type: t.literal('dateSet'),
    dateSet: t.array(t.string),
  }),
]);

export type NumberRangeFilter = t.TypeOf<typeof NumberRangeFilter>;
export const NumberRangeFilter = t.intersection([
  _FilterBase,
  t.type({
    type: t.literal('numberRange'),
    min: t.number,
    max: t.number,
  }),
]);

export type LongitudeRangeFilter = t.TypeOf<typeof LongitudeRangeFilter>;
export const LongitudeRangeFilter = t.intersection([
  _FilterBase,
  t.type({
    type: t.literal('longitudeRange'),
    left: t.number,
    right: t.number,
  }),
]);

export type DateRangeFilter = t.TypeOf<typeof DateRangeFilter>;
export const DateRangeFilter = t.intersection([
  _FilterBase,
  t.type({
    type: t.literal('dateRange'),
    min: t.string,
    max: t.string,
  }),
]);

export type MultiFilter = t.TypeOf<typeof MultiFilter>;
export const MultiFilter = t.intersection([
  _FilterBase,
  t.type({
    type: t.literal('multiFilter'),
    operation: t.keyof({
      union: null,
      intersect: null,
    }),
    subFilters: t.array(
      t.type({
        variableId: t.string,
        stringSet: t.array(t.string),
      })
    ),
  }),
]);

export type Filter = t.TypeOf<typeof Filter>;
export const Filter = t.union([
  StringSetFilter,
  NumberSetFilter,
  DateSetFilter,
  NumberRangeFilter,
  LongitudeRangeFilter,
  DateRangeFilter,
  MultiFilter,
]);
