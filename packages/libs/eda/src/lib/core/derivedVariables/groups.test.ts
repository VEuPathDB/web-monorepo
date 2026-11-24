import { Filter } from '../types/filter';
import { StudyEntity } from '../types/study';
import {
  coversVocabulary,
  DEFAULT_UNMAPPED_VALUE,
  MAX_GROUPS,
  newFilterDefinedGroupsSpec,
  nextGroupStartVariable,
  overlapForGroup,
  validateFilterDefinedGroups,
} from './groups';
import { FILTER_DEFINED_GROUPS, FilterDefinedGroup } from './types';

const filter = (variableId: string, entityId = 'e'): Filter => ({
  type: 'stringSet',
  entityId,
  variableId,
  stringSet: ['x'],
});
const group = (label: string, filters = [filter('v')]): FilterDefinedGroup => ({
  label,
  filters,
});

test('valid config has no messages', () => {
  expect(
    validateFilterDefinedGroups({
      groups: [group('A'), group('B')],
      unmappedValue: 'Other',
    })
  ).toEqual([]);
});

test('empty unmappedValue is not compared against labels', () => {
  expect(
    validateFilterDefinedGroups({ groups: [group('')], unmappedValue: '' })
  ).toEqual(['Group labels must be non-empty']);
  expect(validateFilterDefinedGroups({ groups: [group('A')] })).toEqual([]);
});

test.each([
  ['no groups', { groups: [] }, ['At least one group is required']],
  [
    'an empty label',
    { groups: [group('  ')] },
    ['Group labels must be non-empty'],
  ],
  [
    'duplicate labels',
    { groups: [group('A'), group('A')] },
    ['Group labels must be unique'],
  ],
  [
    'a group with no filters',
    { groups: [group('A', [])] },
    ["Group 'A' has no filters"],
  ],
  [
    'unmappedValue equal to a label',
    { groups: [group('A')], unmappedValue: 'A' },
    ["The 'Everything else' label must differ from every group label"],
  ],
  [
    'too many groups',
    {
      groups: Array.from({ length: MAX_GROUPS + 1 }, (_, i) => group(`G${i}`)),
    },
    ['At most 7 groups'],
  ],
])('rejects %s', (_name, config, expected) => {
  expect(validateFilterDefinedGroups(config)).toEqual(expected);
});

test('overlapForGroup is raw minus final', () => {
  expect(overlapForGroup(1, [10, 8], [10, 5])).toBe(3);
});

test('newFilterDefinedGroupsSpec', () => {
  const a = newFilterDefinedGroupsSpec('e', 'My groups');
  const b = newFilterDefinedGroupsSpec('e', 'My groups');
  expect(a).toMatchObject({
    entityId: 'e',
    displayName: 'My groups',
    functionName: FILTER_DEFINED_GROUPS,
    config: { groups: [], unmappedValue: DEFAULT_UNMAPPED_VALUE },
  });
  expect(a.variableId).toBeTruthy();
  expect(a.variableId).not.toEqual(b.variableId);
});

test("nextGroupStartVariable uses the previous group's variable", () => {
  expect(
    nextGroupStartVariable([
      group('A', [filter('v1')]),
      group('B', [filter('v2'), filter('v3', 'e2')]),
    ])
  ).toEqual({ entityId: 'e2', variableId: 'v3' });
});

test('nextGroupStartVariable is undefined with no groups', () => {
  expect(nextGroupStartVariable([])).toBeUndefined();
  expect(nextGroupStartVariable([group('A', [])])).toBeUndefined();
});

describe('coversVocabulary', () => {
  const entities = [
    {
      id: 'e',
      variables: [
        {
          id: 'v',
          type: 'string',
          dataShape: 'categorical',
          vocabulary: ['x', 'y', 'z'],
        },
        {
          id: 'w',
          type: 'string',
          dataShape: 'categorical',
          vocabulary: ['x'],
        },
      ],
    },
  ] as unknown as StudyEntity[];
  const set = (values: string[], variableId = 'v'): Filter => ({
    type: 'stringSet',
    entityId: 'e',
    variableId,
    stringSet: values,
  });

  it('coversVocabulary: true when stringSet groups on one variable cover its vocabulary', () => {
    expect(
      coversVocabulary(
        [group('A', [set(['x', 'y'])]), group('B', [set(['y', 'z'])])],
        entities
      )
    ).toBe(true);
  });

  it('coversVocabulary: false when a value is missing, filters differ in variable, or a group is not stringSet', () => {
    expect(
      coversVocabulary(
        [group('A', [set(['x'])]), group('B', [set(['y'])])],
        entities
      )
    ).toBe(false);
    expect(
      coversVocabulary(
        [group('A', [set(['x', 'y'])]), group('B', [set(['x', 'z'], 'w')])],
        entities
      )
    ).toBe(false);
    expect(
      coversVocabulary(
        [
          group('A', [set(['x', 'y'])]),
          group('B', [
            {
              type: 'stringPrefixSet',
              entityId: 'e',
              variableId: 'v',
              prefixSet: ['z'],
            },
          ]),
        ],
        entities
      )
    ).toBe(false);
    expect(coversVocabulary([], entities)).toBe(false);
  });
});
