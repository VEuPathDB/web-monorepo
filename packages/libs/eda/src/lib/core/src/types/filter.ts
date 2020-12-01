import * as t from '@veupathdb/wdk-client/lib/Utils/Json';

const _FilterBase = t.record({
  entityId: t.string,
  variableId: t.string,
});

export type StringSetFilter = t.Unpack<typeof StringSetFilter>;
export const StringSetFilter = t.combine(_FilterBase, t.record({
  type: t.constant('stringSet'),
  stringSet: t.arrayOf(t.string)
}));

export type NumberSetFilter = t.Unpack<typeof NumberSetFilter>;
export const NumberSetFilter = t.combine(_FilterBase, t.record({
  type: t.constant('numberSet'),
  numberSet: t.arrayOf(t.number)
}));

export type DateSetFilter = t.Unpack<typeof DateSetFilter>;
export const DateSetFilter = t.combine(_FilterBase, t.record({
  type: t.constant('dateSet'),
  dateSet: t.arrayOf(t.string)
}));

export type NumberRangeFilter = t.Unpack<typeof NumberRangeFilter>;
export const NumberRangeFilter = t.combine(_FilterBase, t.record({
  type: t.constant('numberRange'),
  min: t.number,
  max: t.number
}));

export type DateRangeFilter = t.Unpack<typeof DateRangeFilter>;
export const DateRangeFilter = t.combine(_FilterBase, t.record({
  type: t.constant('dateRange'),
  min: t.string,
  max: t.string
}));

export type Filter = t.Unpack<typeof Filter>;
export const Filter = t.oneOf(
  StringSetFilter,
  NumberSetFilter,
  DateSetFilter,
  NumberRangeFilter,
  DateRangeFilter
)
