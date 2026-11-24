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
