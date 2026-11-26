import { Filter } from '../../core/types/filter';
import { newFilterDefinedGroupsSpec } from '../../core/derivedVariables/groups';
import {
  FilterDefinedGroup,
  FilterDefinedGroupsSpec,
} from '../../core/derivedVariables/types';
import { isDraftDirty } from './isDraftDirty';

const filter = {
  type: 'stringSet',
  entityId: 'col',
  variableId: 'species',
  stringSet: ['a'],
} as Filter;
const otherFilter = { ...filter, stringSet: ['b'] } as Filter;

function group(label: string, filters: Filter[] = [filter]) {
  return { label, filters };
}

function withGroups(
  spec: FilterDefinedGroupsSpec,
  groups: FilterDefinedGroup[],
  unmappedValue = spec.config.unmappedValue
): FilterDefinedGroupsSpec {
  return { ...spec, config: { ...spec.config, groups, unmappedValue } };
}

describe('isDraftDirty', () => {
  const blank = newFilterDefinedGroupsSpec('col', '');
  const saved = withGroups(
    { ...blank, displayName: 'Region' },
    [group('East'), group('West', [otherFilter])],
    'Other'
  );

  test('an untouched new variable is clean', () => {
    expect(isDraftDirty(blank, { ...blank }, false)).toBe(false);
  });

  test('a name only is dirty; surrounding spaces alone are not', () => {
    expect(isDraftDirty(blank, { ...blank, displayName: 'A' }, false)).toBe(
      true
    );
    expect(isDraftDirty(blank, { ...blank, displayName: '  ' }, false)).toBe(
      false
    );
  });

  test('one group is dirty', () => {
    expect(isDraftDirty(blank, withGroups(blank, [group('A')]), false)).toBe(
      true
    );
  });

  test('a changed entity is dirty', () => {
    expect(isDraftDirty(blank, { ...blank, entityId: 'other' }, false)).toBe(
      true
    );
  });

  test('a filter change is dirty', () => {
    const draft = withGroups(saved, [
      group('East', [otherFilter]),
      saved.config.groups[1],
    ]);
    expect(isDraftDirty(saved, draft, true)).toBe(true);
  });

  test('a label change is dirty', () => {
    const draft = withGroups(saved, [group('Eastern'), saved.config.groups[1]]);
    expect(isDraftDirty(saved, draft, true)).toBe(true);
  });

  test('a reorder is dirty', () => {
    const [east, west] = saved.config.groups;
    expect(isDraftDirty(saved, withGroups(saved, [west, east]), true)).toBe(
      true
    );
  });

  test('a uiSettings-only change is clean', () => {
    // the editor keeps UI settings beside the groups, never inside the spec
    const withSettings = { ...saved.config.groups[0], uiSettings: { w: 3 } };
    const draft = withGroups(saved, [withSettings, saved.config.groups[1]]);
    expect(isDraftDirty(saved, draft, true)).toBe(false);
  });

  test('the automatic Everything else change is clean', () => {
    expect(isDraftDirty(blank, withGroups(blank, [], ''), false)).toBe(false);
  });

  test('a touched Everything else change is dirty', () => {
    expect(
      isDraftDirty(saved, withGroups(saved, saved.config.groups, ''), true)
    ).toBe(true);
    expect(
      isDraftDirty(saved, withGroups(saved, saved.config.groups, 'Rest'), true)
    ).toBe(true);
  });

  test('a saved variable reverted to its original is clean', () => {
    const edited = withGroups(saved, [group('East')]);
    expect(isDraftDirty(saved, edited, true)).toBe(true);
    expect(
      isDraftDirty(saved, withGroups(saved, [...saved.config.groups]), true)
    ).toBe(false);
  });
});
