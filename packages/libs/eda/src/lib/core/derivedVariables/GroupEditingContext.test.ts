import { ColorPaletteDefault } from '@veupathdb/components/lib/types/plots/addOns';
import { Filter } from '../types/filter';
import {
  earlierFiltersFor,
  earlierGroupsContext,
  earlierSetValueMarks,
  groupColor,
} from './GroupEditingContext';
import { FilterDefinedGroup } from './types';

const stringSet = (
  variableId: string,
  values: string[],
  entityId = 'e'
): Filter => ({ type: 'stringSet', entityId, variableId, stringSet: values });

const range = (variableId: string, min: number, max: number): Filter => ({
  type: 'numberRange',
  entityId: 'e',
  variableId,
  min,
  max,
});

const groups: FilterDefinedGroup[] = [
  { label: 'East', filters: [stringSet('region', ['A']), range('age', 0, 5)] },
  { label: 'West', filters: [stringSet('region', ['B', 'C'])] },
  { label: 'Editing', filters: [stringSet('region', ['D'])] },
  { label: 'Later', filters: [stringSet('region', ['E'])] },
];

test("earlierFiltersFor returns only earlier groups' filters on that variable, with colours", () => {
  const ctx = earlierGroupsContext(groups, 2);
  expect(earlierFiltersFor(ctx, 'e', 'region')).toEqual([
    {
      label: 'East',
      color: ColorPaletteDefault[0],
      filter: groups[0].filters[0],
    },
    {
      label: 'West',
      color: ColorPaletteDefault[1],
      filter: groups[1].filters[0],
    },
  ]);
  expect(earlierFiltersFor(ctx, 'e', 'age')).toEqual([
    {
      label: 'East',
      color: ColorPaletteDefault[0],
      filter: groups[0].filters[1],
    },
  ]);
  // same variable id on another entity does not match
  expect(earlierFiltersFor(ctx, 'other', 'region')).toEqual([]);
});

test('earlierFiltersFor is empty outside a group editor and for the first group', () => {
  expect(earlierFiltersFor(undefined, 'e', 'region')).toEqual([]);
  expect(
    earlierFiltersFor(earlierGroupsContext(groups, 0), 'e', 'region')
  ).toEqual([]);
});

test('group colours follow group order and wrap around the palette', () => {
  expect(groupColor(0)).toBe(ColorPaletteDefault[0]);
  expect(groupColor(3)).toBe(ColorPaletteDefault[3]);
  expect(groupColor(ColorPaletteDefault.length)).toBe(ColorPaletteDefault[0]);
});

test('earlierSetValueMarks maps each used value to the groups that use it', () => {
  const ctx = earlierGroupsContext(
    [
      { label: 'East', filters: [stringSet('region', ['A', 'B'])] },
      {
        label: 'West',
        filters: [
          {
            type: 'multiFilter',
            entityId: 'e',
            variableId: 'parent',
            operation: 'union',
            subFilters: [{ variableId: 'region', stringSet: ['B'] }],
          },
        ],
      },
      {
        label: 'North',
        filters: [
          {
            type: 'numberSet',
            entityId: 'e',
            variableId: 'count',
            numberSet: [1, 2],
          },
        ],
      },
    ],
    3
  );
  const marks = earlierSetValueMarks(ctx, 'e', 'region');
  expect(marks?.get('A')).toEqual([
    { label: 'East', color: ColorPaletteDefault[0] },
  ]);
  expect(marks?.get('B')).toEqual([
    { label: 'East', color: ColorPaletteDefault[0] },
    { label: 'West', color: ColorPaletteDefault[1] },
  ]);
  expect(marks?.get('C')).toBeUndefined();
  // numbers are keyed by their string form
  expect(earlierSetValueMarks(ctx, 'e', 'count')?.get('2')).toEqual([
    { label: 'North', color: ColorPaletteDefault[2] },
  ]);
});

test('earlierSetValueMarks is undefined when nothing is marked', () => {
  expect(earlierSetValueMarks(undefined, 'e', 'region')).toBeUndefined();
  expect(
    earlierSetValueMarks(earlierGroupsContext(groups, 2), 'e', 'age')
  ).toBeUndefined();
});
