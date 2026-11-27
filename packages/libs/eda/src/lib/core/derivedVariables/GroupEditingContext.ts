import { createContext } from 'react';
import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots/addOns';
import { Filter } from '../types/filter';
import { FilterDefinedGroup } from './types';

/** A group defined before the one being edited, in its display colour. */
export interface EarlierGroup {
  label: string;
  color: string;
  filters: Filter[];
}

export type GroupEditingContextValue =
  | { earlierGroups: EarlierGroup[] }
  | undefined;

/**
 * While one group's filters are edited (Create variables tab), the groups
 * before it, so the filter widgets can show their selections and the user
 * can avoid overlaps (design §3.1). Undefined everywhere else, where the
 * widgets behave exactly as before.
 */
export const GroupEditingContext =
  createContext<GroupEditingContextValue>(undefined);

/** A group's colour: the categorical overlay palette, in group order. */
export function groupColor(groupIndex: number): string {
  return ColorPaletteDefault[groupIndex % ColorPaletteDefault.length];
}

/** The context value while the group at `editingIndex` is edited. */
export function earlierGroupsContext(
  groups: FilterDefinedGroup[],
  editingIndex: number
): NonNullable<GroupEditingContextValue> {
  return {
    earlierGroups: groups.slice(0, Math.max(0, editingIndex)).map(
      (group, index): EarlierGroup => ({
        label: group.label || `Group ${index + 1}`,
        color: groupColor(index),
        filters: group.filters,
      })
    ),
  };
}

export interface EarlierGroupMark {
  label: string;
  color: string;
}

/** Earlier groups' filters on one variable, in group order. */
export function earlierFiltersFor(
  ctx: GroupEditingContextValue,
  entityId: string,
  variableId: string
): Array<EarlierGroupMark & { filter: Filter }> {
  if (ctx == null) return [];
  return ctx.earlierGroups.flatMap(({ label, color, filters }) =>
    filters
      .filter((f) => f.entityId === entityId && f.variableId === variableId)
      .map((filter) => ({ label, color, filter }))
  );
}

/**
 * For a categorical variable: each value an earlier group selects (keyed by
 * its string form) with the groups selecting it. Covers set filters on the
 * variable and the variable's sub-filters in a multi-filter. Undefined when
 * no value is used, so a widget can pass it straight through.
 */
export function earlierSetValueMarks(
  ctx: GroupEditingContextValue,
  entityId: string,
  variableId: string
): Map<string, EarlierGroupMark[]> | undefined {
  if (ctx == null) return undefined;
  const marks = new Map<string, EarlierGroupMark[]>();
  for (const { label, color, filters } of ctx.earlierGroups) {
    const values = new Set<string>();
    for (const filter of filters) {
      if (filter.entityId !== entityId) continue;
      for (const value of setFilterValues(filter, variableId))
        values.add(String(value));
    }
    for (const value of values)
      marks.set(value, [...(marks.get(value) ?? []), { label, color }]);
  }
  return marks.size > 0 ? marks : undefined;
}

function setFilterValues(
  filter: Filter,
  variableId: string
): Array<string | number> {
  if (filter.type === 'multiFilter')
    return filter.subFilters
      .filter((sub) => sub.variableId === variableId)
      .flatMap((sub) => sub.stringSet);
  if (filter.variableId !== variableId) return [];
  switch (filter.type) {
    case 'stringSet':
      return filter.stringSet;
    case 'numberSet':
      return filter.numberSet;
    case 'dateSet':
      return filter.dateSet;
    default:
      return [];
  }
}
