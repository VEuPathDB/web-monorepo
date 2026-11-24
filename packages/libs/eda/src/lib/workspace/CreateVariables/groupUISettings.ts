import { VariableUISetting } from '../../core/types/analysis';
import { GroupFilterState } from '../../core/derivedVariables/useGroupFilterAnalysisState';

/** The analysis's `subset.uiSettings`: one entry per filter widget. */
export type SubsetUISettings = Record<string, VariableUISetting>;

/** One group's filter-widget UI settings, shaped like `subset.uiSettings`. */
export type GroupUISettings = GroupFilterState['uiSettings'];

/**
 * A group's UI settings are kept in `subset.uiSettings` under a key made from
 * the derived variable's id and the group's position, counting from 1 (§5.4).
 */
export function groupUISettingsKey(variableId: string, position: number) {
  return `${keyPrefix(variableId)}${position}`;
}

function keyPrefix(variableId: string) {
  return `derivedVariable/${variableId}/group`;
}

function isGroupKey(variableId: string, key: string) {
  const prefix = keyPrefix(variableId);
  return key.startsWith(prefix) && /^\d+$/.test(key.slice(prefix.length));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != null && !Array.isArray(value);
}

/** Reads the stored UI settings of each of a variable's groups, in order. */
export function readGroupUISettings(
  all: SubsetUISettings,
  variableId: string,
  groupCount: number
): GroupUISettings[] {
  return Array.from({ length: groupCount }, (_, index) => {
    const stored = all[groupUISettingsKey(variableId, index + 1)];
    if (stored == null) return {};
    return Object.fromEntries(
      Object.entries(stored).filter(
        (entry): entry is [string, Record<string, unknown>] =>
          isRecord(entry[1])
      )
    );
  });
}

/**
 * Rewrites a variable's group UI settings by final position and drops any
 * stale keys (a removed group, or a deleted variable when `groups` is empty).
 * Groups with no UI settings get no key. Other keys are kept as they are.
 */
export function writeGroupUISettings(
  all: SubsetUISettings,
  variableId: string,
  groups: GroupUISettings[]
): SubsetUISettings {
  const kept = Object.fromEntries(
    Object.entries(all).filter(([key]) => !isGroupKey(variableId, key))
  );
  const written = groups.flatMap((uiSettings, index) =>
    Object.keys(uiSettings).length > 0
      ? [[groupUISettingsKey(variableId, index + 1), uiSettings] as const]
      : []
  );
  return { ...kept, ...Object.fromEntries(written) };
}
