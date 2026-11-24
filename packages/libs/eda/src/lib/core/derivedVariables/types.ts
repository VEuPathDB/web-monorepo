/* eslint-disable @typescript-eslint/no-redeclare */
import * as t from 'io-ts';
import { isRight } from 'fp-ts/Either';
import { DerivedVariableSpec } from '../types/analysis';
import { Filter } from '../types/filter';

export { DerivedVariableSpec };

export const FILTER_DEFINED_GROUPS = 'filterDefinedGroups';

export type FilterDefinedGroup = t.TypeOf<typeof FilterDefinedGroup>;
export const FilterDefinedGroup = t.type({
  label: t.string,
  filters: t.array(Filter),
});

export type FilterDefinedGroupsConfig = t.TypeOf<
  typeof FilterDefinedGroupsConfig
>;
export const FilterDefinedGroupsConfig = t.intersection([
  t.type({ groups: t.array(FilterDefinedGroup) }),
  t.partial({ unmappedValue: t.string }),
]);

export type FilterDefinedGroupsSpec = DerivedVariableSpec & {
  functionName: typeof FILTER_DEFINED_GROUPS;
  config: FilterDefinedGroupsConfig;
};

export function isFilterDefinedGroupsSpec(
  x: unknown
): x is FilterDefinedGroupsSpec {
  return (
    isRight(DerivedVariableSpec.decode(x)) &&
    (x as DerivedVariableSpec).functionName === FILTER_DEFINED_GROUPS &&
    isRight(FilterDefinedGroupsConfig.decode((x as DerivedVariableSpec).config))
  );
}

/**
 * Splits specs into those this client can work with and those it cannot
 * (unknown plugin, or a config it cannot decode). Unsupported specs must be
 * preserved untouched, never dropped or fatal.
 */
export function decodeDerivedVariables(entries: DerivedVariableSpec[]): {
  supported: FilterDefinedGroupsSpec[];
  unsupported: DerivedVariableSpec[];
} {
  const supported: FilterDefinedGroupsSpec[] = [];
  const unsupported: DerivedVariableSpec[] = [];
  for (const entry of entries) {
    if (isFilterDefinedGroupsSpec(entry)) supported.push(entry);
    else unsupported.push(entry);
  }
  return { supported, unsupported };
}
