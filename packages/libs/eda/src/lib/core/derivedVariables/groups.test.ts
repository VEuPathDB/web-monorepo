import { Filter } from '../types/filter';
import { StudyEntity } from '../types/study';
import {
  coversVocabulary,
  DEFAULT_UNMAPPED_VALUE,
  MAX_GROUPS,
  newFilterDefinedGroupsSpec,
  nextGroupStartVariable,
  overlapForGroup,
  rangeGapWarnings,
  rangeOrderWarnings,
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

describe('range ordinal warnings', () => {
  const entities = [
    {
      id: 'e',
      variables: [
        {
          id: 'int',
          type: 'integer',
          dataShape: 'continuous',
          distributionDefaults: { rangeMin: 0, rangeMax: 100 },
        },
        {
          id: 'num',
          type: 'number',
          dataShape: 'continuous',
          distributionDefaults: { rangeMin: 0, rangeMax: 100 },
        },
        {
          id: 'date',
          type: 'date',
          dataShape: 'continuous',
          distributionDefaults: {
            rangeMin: '2020-01-01T00:00:00',
            rangeMax: '2020-12-31T00:00:00',
          },
        },
      ],
    },
  ] as unknown as StudyEntity[];
  const nums = (variableId: string, ...ranges: Array<[number, number]>) =>
    ranges.map(([min, max], i) =>
      group(`G${i}`, [
        { type: 'numberRange', entityId: 'e', variableId, min, max },
      ])
    );
  const dates = (...ranges: Array<[string, string]>) =>
    ranges.map(([min, max], i) =>
      group(`G${i}`, [
        { type: 'dateRange', entityId: 'e', variableId: 'date', min, max },
      ])
    );

  it('order: ascending, descending and single groups are fine; mixed warns', () => {
    expect(
      rangeOrderWarnings(nums('int', [0, 5], [6, 10], [11, 20]), entities)
    ).toEqual([]);
    expect(
      rangeOrderWarnings(nums('int', [11, 20], [6, 10], [0, 5]), entities)
    ).toEqual([]);
    expect(rangeOrderWarnings(nums('int', [0, 5]), entities)).toEqual([]);
    expect(
      rangeOrderWarnings(nums('int', [0, 5], [11, 20], [6, 10]), entities)
    ).toHaveLength(1);
    expect(
      rangeOrderWarnings(
        dates(
          ['2020-03-01', '2020-03-31'],
          ['2020-01-01', '2020-01-31'],
          ['2020-06-01', '2020-06-30']
        ),
        entities
      )
    ).toHaveLength(1);
  });

  it('order: ignores non-range or mixed-variable groups', () => {
    expect(rangeOrderWarnings([group('A'), group('B')], entities)).toEqual([]);
  });

  it('gaps: off when Everything else is off', () => {
    expect(
      rangeGapWarnings(nums('num', [0, 10], [50, 60]), entities, false)
    ).toEqual([]);
  });

  it('gaps: integers treat consecutive values as adjacent', () => {
    expect(
      rangeGapWarnings(nums('int', [0, 5], [6, 10], [11, 100]), entities, true)
    ).toEqual([]);
    expect(
      rangeGapWarnings(nums('int', [0, 5], [7, 100]), entities, true)
    ).toHaveLength(1);
  });

  it('gaps: non-integer numbers need touching or overlapping ranges', () => {
    expect(
      rangeGapWarnings(nums('num', [0, 5], [6, 100]), entities, true)
    ).toHaveLength(1);
    expect(
      rangeGapWarnings(nums('num', [0, 5], [5, 100]), entities, true)
    ).toEqual([]);
  });

  it('gaps: dates treat the next day as adjacent', () => {
    expect(
      rangeGapWarnings(
        dates(['2020-01-01', '2020-01-31'], ['2020-02-01', '2020-12-31']),
        entities,
        true
      )
    ).toEqual([]);
    expect(
      rangeGapWarnings(
        dates(['2020-01-01', '2020-01-31'], ['2020-02-02', '2020-12-31']),
        entities,
        true
      )
    ).toHaveLength(1);
  });

  it('gaps: a single gap past the last group is allowed', () => {
    // asc: values above 60 go to Everything else, which sorts last
    expect(
      rangeGapWarnings(nums('int', [0, 30], [31, 60]), entities, true)
    ).toEqual([]);
    // asc: a leading gap puts the lowest values in the top level
    expect(
      rangeGapWarnings(nums('int', [40, 60], [61, 100]), entities, true)
    ).toHaveLength(1);
    // desc: the gap past the last group is the low end
    expect(
      rangeGapWarnings(nums('int', [61, 100], [40, 60]), entities, true)
    ).toEqual([]);
    // desc: values above the first group would be labelled with the top level
    expect(
      rangeGapWarnings(nums('int', [31, 60], [0, 30]), entities, true)
    ).toHaveLength(1);
    expect(
      rangeGapWarnings(nums('int', [0, 30], [31, 60], [70, 80]), entities, true)
    ).toHaveLength(1);
  });

  it('gaps: not reported for out-of-order ranges', () => {
    expect(
      rangeGapWarnings(nums('int', [0, 5], [50, 60], [6, 10]), entities, true)
    ).toEqual([]);
  });
});
