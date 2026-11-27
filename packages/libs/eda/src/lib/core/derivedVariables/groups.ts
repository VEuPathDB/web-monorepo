import { v4 as uuid } from 'uuid';
import { VariableDescriptor } from '../types/variable';
import { StudyEntity } from '../types/study';
import { findEntityAndVariable } from '../utils/study-metadata';
import {
  FILTER_DEFINED_GROUPS,
  FilterDefinedGroup,
  FilterDefinedGroupsConfig,
  FilterDefinedGroupsSpec,
} from './types';

export const MAX_GROUPS = 7;
export const DEFAULT_UNMAPPED_VALUE = 'Other';

/**
 * Returns user-facing validation messages (empty when valid). Mirrors the
 * server's rules (service-eda FilterDefinedGroups) plus a client-side cap.
 * The client is deliberately stricter in treating whitespace-only labels as
 * empty. An empty/absent unmappedValue means "Everything else" is off.
 */
export function validateFilterDefinedGroups(
  config: FilterDefinedGroupsConfig
): string[] {
  const { groups, unmappedValue } = config;
  const messages: string[] = [];
  if (groups.length === 0) messages.push('At least one group is required');
  if (groups.length > MAX_GROUPS) messages.push(`At most ${MAX_GROUPS} groups`);
  if (groups.some((g) => g.label.trim() === ''))
    messages.push('Group labels must be non-empty');
  const labels = groups.map((g) => g.label);
  if (new Set(labels).size !== labels.length)
    messages.push('Group labels must be unique');
  for (const g of groups) {
    if (g.filters.length === 0)
      messages.push(`Group '${g.label}' has no filters`);
  }
  if (unmappedValue && labels.includes(unmappedValue))
    messages.push(
      "The 'Everything else' label must differ from every group label"
    );
  return messages;
}

export function overlapForGroup(
  index: number,
  rawCounts: number[],
  finalCounts: number[]
): number {
  return rawCounts[index] - finalCounts[index];
}

export function newFilterDefinedGroupsSpec(
  entityId: string,
  displayName: string
): FilterDefinedGroupsSpec {
  return {
    entityId,
    variableId: uuid(),
    functionName: FILTER_DEFINED_GROUPS,
    displayName,
    config: { groups: [], unmappedValue: DEFAULT_UNMAPPED_VALUE },
  };
}

/** Variable of the last group's last filter, used to start a new group. */
export function nextGroupStartVariable(
  groups: FilterDefinedGroup[]
): VariableDescriptor | undefined {
  const filters = groups[groups.length - 1]?.filters;
  const last = filters?.[filters.length - 1];
  return last && { entityId: last.entityId, variableId: last.variableId };
}

/**
 * True when every group is one stringSet filter on the same variable and
 * together they list every value of that variable's vocabulary, so nothing
 * is left for "Everything else".
 */
export function coversVocabulary(
  groups: FilterDefinedGroup[],
  entities: StudyEntity[]
): boolean {
  if (groups.length === 0) return false;
  const filters = groups.map((g) =>
    g.filters.length === 1 ? g.filters[0] : undefined
  );
  const first = filters[0];
  if (first == null) return false;
  const values = new Set<string>();
  for (const f of filters) {
    if (
      f == null ||
      f.type !== 'stringSet' ||
      f.entityId !== first.entityId ||
      f.variableId !== first.variableId
    )
      return false;
    f.stringSet.forEach((v) => values.add(v));
  }
  const found = findEntityAndVariable(entities, {
    entityId: first.entityId,
    variableId: first.variableId,
  });
  const variable = found?.variable;
  if (
    variable == null ||
    !('vocabulary' in variable) ||
    variable.vocabulary == null
  )
    return false;
  return variable.vocabulary.every((v) => values.has(v));
}

interface RangeGroups {
  isDate: boolean;
  /** Adjacent values closer than this leave nothing in between. */
  step: number;
  ranges: Array<{ min: number; max: number }>;
  /** Extent of the variable's data, when the study metadata gives it. */
  dataExtent?: { min: number; max: number };
}

const MS_PER_DAY = 86_400_000;
const toDay = (s: string) => Date.parse(s.slice(0, 10)) / MS_PER_DAY;

/**
 * Ranges of the groups when each is one numberRange (or each one dateRange)
 * filter on the same variable, else undefined. Dates are day numbers, since
 * nothing is finer than a day.
 */
function rangeGroups(
  groups: FilterDefinedGroup[],
  entities: StudyEntity[]
): RangeGroups | undefined {
  if (groups.length < 2 || groups.some((g) => g.filters.length !== 1))
    return undefined;
  const filters = groups.map((g) => g.filters[0]);
  const first = filters[0];
  if (first.type !== 'numberRange' && first.type !== 'dateRange')
    return undefined;
  if (
    filters.some(
      (f) =>
        f.type !== first.type ||
        f.entityId !== first.entityId ||
        f.variableId !== first.variableId
    )
  )
    return undefined;

  const variable = findEntityAndVariable(entities, {
    entityId: first.entityId,
    variableId: first.variableId,
  })?.variable;
  const defaults =
    variable != null && 'distributionDefaults' in variable
      ? variable.distributionDefaults
      : undefined;

  if (first.type === 'dateRange') {
    return {
      isDate: true,
      step: 1,
      ranges: filters.flatMap((f) =>
        f.type === 'dateRange' ? [{ min: toDay(f.min), max: toDay(f.max) }] : []
      ),
      dataExtent:
        defaults != null && typeof defaults.rangeMin === 'string'
          ? {
              min: toDay(defaults.rangeMin),
              max: toDay(String(defaults.rangeMax)),
            }
          : undefined,
    };
  }
  return {
    isDate: false,
    step: variable != null && variable.type === 'integer' ? 1 : 0,
    ranges: filters.flatMap((f) =>
      f.type === 'numberRange' ? [{ min: f.min, max: f.max }] : []
    ),
    dataExtent:
      defaults != null && typeof defaults.rangeMin === 'number'
        ? { min: defaults.rangeMin, max: Number(defaults.rangeMax) }
        : undefined,
  };
}

function directionOf(
  ranges: RangeGroups['ranges']
): 'asc' | 'desc' | undefined {
  const mins = ranges.map((r) => r.min);
  const pairs = mins.slice(1).map((m, i) => m - mins[i]);
  if (pairs.every((d) => d >= 0)) return 'asc';
  if (pairs.every((d) => d <= 0)) return 'desc';
  return undefined;
}

/**
 * Warning when numeric or date range groups are not in ascending or
 * descending order: the output is ordinal, so the group order is the level
 * order.
 */
export function rangeOrderWarnings(
  groups: FilterDefinedGroup[],
  entities: StudyEntity[]
): string[] {
  const info = rangeGroups(groups, entities);
  if (info == null || directionOf(info.ranges) != null) return [];
  return [
    'These ranges are not in ascending or descending order, so the categories will not be a meaningful ordinal. Check this is what you intended.',
  ];
}

/**
 * Warning when "Everything else" is on and the ranges leave gaps. It sorts
 * after the last group, so it only stays ordinal when the single gap is the
 * one past the last group: above the highest range when ascending, below the
 * lowest when descending. Integer variables and dates treat consecutive
 * values/days as adjacent. Tails count only when the variable's data extent
 * is known. Not reported for out-of-order ranges (see rangeOrderWarnings).
 */
export function rangeGapWarnings(
  groups: FilterDefinedGroup[],
  entities: StudyEntity[],
  everythingElseOn: boolean
): string[] {
  if (!everythingElseOn) return [];
  const info = rangeGroups(groups, entities);
  if (info == null) return [];
  const direction = directionOf(info.ranges);
  if (direction == null) return [];

  // Walk low to high; the "last group" end is high for asc, low for desc.
  const sorted = [...info.ranges].sort((a, b) => a.min - b.min);
  const { step, dataExtent } = info;
  const interior = sorted
    .slice(1)
    .filter((r, i) => r.min - sorted[i].max > step).length;
  const lowTail =
    dataExtent != null && sorted[0].min - dataExtent.min > step ? 1 : 0;
  const highTail =
    dataExtent != null && dataExtent.max - sorted[sorted.length - 1].max > step
      ? 1
      : 0;
  const lastEndTail = direction === 'asc' ? highTail : lowTail;
  const gaps = interior + lowTail + highTail;
  if (gaps === 0 || (gaps === 1 && lastEndTail === 1)) return [];
  return [
    `These ranges leave gaps, and values in the gaps will be labelled as 'Everything else', which sorts last. The categories may not be a meaningful ordinal. Check this is what you intended.`,
  ];
}
