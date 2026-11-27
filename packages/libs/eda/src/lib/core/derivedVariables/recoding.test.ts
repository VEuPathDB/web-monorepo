import { StudyEntity } from '../types/study';
import { Filter } from '../types/filter';
import {
  CATEGORICAL_RECODING,
  CONTINUOUS_DATE_TO_ORDINAL,
  CONTINUOUS_TO_ORDINAL,
  decodeDerivedVariables,
  fromRecoderSpec,
  toRecoderSpec,
  toStoredSpec,
} from './recoding';
import {
  DerivedVariableSpec,
  FILTER_DEFINED_GROUPS,
  FilterDefinedGroupsSpec,
} from './types';

type EntityVariable = StudyEntity['variables'][number];

const base = {
  providerLabel: 'x',
  hideFrom: [],
  distinctValuesCount: 3,
  isTemporal: false,
  isFeatured: false,
  isMergeKey: false,
  isMultiValued: false,
};

function stringVar(
  id: string,
  extra: {
    dataShape?: 'categorical' | 'binary' | 'ordinal';
    isMultiValued?: boolean;
  } = {}
): EntityVariable {
  return {
    ...base,
    id,
    displayName: id,
    type: 'string',
    dataShape: extra.dataShape ?? 'categorical',
    isMultiValued: extra.isMultiValued ?? false,
  };
}

function numberVar(id: string, imputeZero?: boolean): EntityVariable {
  return {
    ...base,
    id,
    displayName: id,
    type: 'number',
    units: '',
    precision: 1,
    dataShape: 'continuous',
    distributionDefaults: {
      rangeMin: 0,
      rangeMax: 10,
      displayRangeMin: 0,
      displayRangeMax: 10,
      binWidth: 1,
      binWidthOverride: undefined,
      binUnits: undefined,
    },
    ...(imputeZero == null ? {} : { imputeZero }),
  } as EntityVariable;
}

function dateVar(id: string): EntityVariable {
  return {
    ...base,
    id,
    displayName: id,
    type: 'date',
    dataShape: 'continuous',
    isTemporal: true,
    distributionDefaults: {
      rangeMin: '2020-01-01',
      rangeMax: '2021-01-01',
      displayRangeMin: '2020-01-01',
      displayRangeMax: '2021-01-01',
      binWidth: 1,
      binWidthOverride: undefined,
      binUnits: 'day',
    },
  } as EntityVariable;
}

function entity(
  id: string,
  variables: EntityVariable[],
  children?: StudyEntity[]
): StudyEntity {
  return {
    id,
    idColumnName: `${id}_id`,
    displayName: id,
    description: '',
    variables,
    isManyToOneWithParent: true,
    children,
  } as StudyEntity;
}

const item = entity('Item', [stringVar('cake')]);
const menu = entity('Menu', [], [item]);
const shop = entity(
  'Shop',
  [
    stringVar('region'),
    stringVar('geohash'),
    numberVar('size'),
    dateVar('opened'),
    stringVar('chain', { dataShape: 'binary' }),
    stringVar('tags', { isMultiValued: true }),
    stringVar('level', { dataShape: 'ordinal' }),
    numberVar('staff', true),
  ],
  [menu]
);
const entities = [shop, menu, item];

const stringSet = (v: string, set: string[], e = 'Shop'): Filter => ({
  type: 'stringSet',
  entityId: e,
  variableId: v,
  stringSet: set,
});
const prefixSet = (v: string, prefixSet: string[]): Filter => ({
  type: 'stringPrefixSet',
  entityId: 'Shop',
  variableId: v,
  prefixSet,
});
const numberRange = (v: string, min: number, max: number): Filter => ({
  type: 'numberRange',
  entityId: 'Shop',
  variableId: v,
  min,
  max,
});
const dateRange = (v: string, min: string, max: string): Filter => ({
  type: 'dateRange',
  entityId: 'Shop',
  variableId: v,
  min,
  max,
});

function groupsSpec(
  groups: Array<{ label: string; filters: Filter[] }>,
  opts: { entityId?: string; unmappedValue?: string } = {}
): FilterDefinedGroupsSpec {
  return {
    entityId: opts.entityId ?? 'Shop',
    variableId: 'dv1',
    functionName: FILTER_DEFINED_GROUPS,
    displayName: 'My groups',
    config: {
      groups,
      ...(opts.unmappedValue == null
        ? {}
        : { unmappedValue: opts.unmappedValue }),
    },
  };
}

const regionSpec = groupsSpec(
  [
    { label: 'North', filters: [stringSet('region', ['n', 'ne'])] },
    { label: 'South', filters: [stringSet('region', ['s'])] },
  ],
  { unmappedValue: 'Other' }
);
const geoSpec = groupsSpec([
  { label: 'A', filters: [prefixSet('geohash', ['gcp', 'u10'])] },
  { label: 'B', filters: [prefixSet('geohash', ['dr5'])] },
]);
const sizeSpec = groupsSpec([
  { label: 'Small', filters: [numberRange('size', 0, 5)] },
  { label: 'Big', filters: [numberRange('size', 6, 10)] },
]);
const dateSpec = groupsSpec([
  {
    label: 'Early',
    filters: [dateRange('opened', '2020-01-01', '2020-06-30')],
  },
  { label: 'Late', filters: [dateRange('opened', '2020-07-01', '2020-12-31')] },
]);

describe('toRecoderSpec', () => {
  it('stringSet groups -> categoricalRecoding with inputValues', () => {
    const r = toRecoderSpec(regionSpec, entities);
    expect(r?.functionName).toBe(CATEGORICAL_RECODING);
    expect(r?.config).toEqual({
      inputVariable: { entityId: 'Shop', variableId: 'region' },
      rules: [
        { inputValues: ['n', 'ne'], outputValue: 'North' },
        { inputValues: ['s'], outputValue: 'South' },
      ],
      unmappedValue: 'Other',
    });
  });

  it('stringPrefixSet groups -> categoricalRecoding with inputPrefixes', () => {
    const r = toRecoderSpec(geoSpec, entities);
    expect(r?.functionName).toBe(CATEGORICAL_RECODING);
    expect(r?.config).toEqual({
      inputVariable: { entityId: 'Shop', variableId: 'geohash' },
      rules: [
        { inputPrefixes: ['gcp', 'u10'], outputValue: 'A' },
        { inputPrefixes: ['dr5'], outputValue: 'B' },
      ],
    });
  });

  it('numberRange groups -> continuousToOrdinal with minInclusive/maxInclusive', () => {
    const r = toRecoderSpec(sizeSpec, entities);
    expect(r?.functionName).toBe(CONTINUOUS_TO_ORDINAL);
    expect(r?.config).toEqual({
      inputVariable: { entityId: 'Shop', variableId: 'size' },
      rules: [
        { minInclusive: 0, maxInclusive: 5, outputValue: 'Small' },
        { minInclusive: 6, maxInclusive: 10, outputValue: 'Big' },
      ],
    });
  });

  it('dateRange groups -> continuousDateToOrdinal with the filter strings verbatim', () => {
    const r = toRecoderSpec(dateSpec, entities);
    expect(r?.functionName).toBe(CONTINUOUS_DATE_TO_ORDINAL);
    expect(r?.config).toEqual({
      inputVariable: { entityId: 'Shop', variableId: 'opened' },
      rules: [
        {
          minInclusive: '2020-01-01',
          maxInclusive: '2020-06-30',
          outputValue: 'Early',
        },
        {
          minInclusive: '2020-07-01',
          maxInclusive: '2020-12-31',
          outputValue: 'Late',
        },
      ],
    });
  });

  it('keeps entityId, variableId, displayName and unmappedValue (omitted when empty)', () => {
    const r = toRecoderSpec(regionSpec, entities);
    expect(r).toMatchObject({
      entityId: 'Shop',
      variableId: 'dv1',
      displayName: 'My groups',
    });
    const empty = toRecoderSpec(
      groupsSpec([{ label: 'N', filters: [stringSet('region', ['n'])] }], {
        unmappedValue: '',
      }),
      entities
    );
    expect(empty?.config).not.toHaveProperty('unmappedValue');
  });

  it('uses an ancestor variable when grouping a descendant entity', () => {
    const spec = groupsSpec(
      [{ label: 'N', filters: [stringSet('region', ['n'])] }],
      { entityId: 'Menu' }
    );
    const r = toRecoderSpec(spec, entities);
    expect(r?.entityId).toBe('Menu');
    expect(r?.functionName).toBe(CATEGORICAL_RECODING);
  });

  const twoFilters = groupsSpec([
    {
      label: 'A',
      filters: [stringSet('region', ['n']), stringSet('region', ['s'])],
    },
  ]);
  const differentVars = groupsSpec([
    { label: 'A', filters: [stringSet('region', ['n'])] },
    { label: 'B', filters: [stringSet('geohash', ['x'])] },
  ]);
  const differentKinds = groupsSpec([
    { label: 'A', filters: [stringSet('region', ['n'])] },
    { label: 'B', filters: [prefixSet('region', ['x'])] },
  ]);
  const descendant = groupsSpec([
    { label: 'A', filters: [stringSet('cake', ['x'], 'Item')] },
  ]);
  const binary = groupsSpec([
    { label: 'A', filters: [stringSet('chain', ['x'])] },
  ]);
  const multi = groupsSpec([
    { label: 'A', filters: [stringSet('tags', ['x'])] },
  ]);
  const impute = groupsSpec([
    { label: 'A', filters: [numberRange('staff', 0, 1)] },
  ]);
  const emptySet = groupsSpec([
    { label: 'A', filters: [stringSet('region', [])] },
  ]);
  const numberSet = groupsSpec([
    {
      label: 'A',
      filters: [
        {
          type: 'numberSet',
          entityId: 'Shop',
          variableId: 'size',
          numberSet: [1],
        },
      ],
    },
  ]);
  const noGroups = groupsSpec([]);
  const ordinal = groupsSpec([
    { label: 'A', filters: [stringSet('level', ['x'])] },
  ]);
  const ordinalPrefix = groupsSpec([
    { label: 'A', filters: [prefixSet('level', ['x'])] },
  ]);
  const rangeOnString = groupsSpec([
    { label: 'A', filters: [numberRange('region', 0, 1)] },
  ]);
  const dateRangeOnNumber = groupsSpec([
    { label: 'A', filters: [dateRange('size', '2020-01-01', '2020-02-01')] },
  ]);

  it.each([
    ['an ordinal string variable (server accepts categorical only)', ordinal],
    ['an ordinal string variable with prefixes', ordinalPrefix],
    ['a range filter on a non-continuous variable', rangeOnString],
    ['a date range on a numeric variable', dateRangeOnNumber],
    ['a group with two filters', twoFilters],
    ['groups on different variables', differentVars],
    ['filters of different kinds', differentKinds],
    ['a variable on a descendant entity (Item.cake for Shop)', descendant],
    ['a binary variable', binary],
    ['a multi-valued variable', multi],
    ['an imputeZero variable', impute],
    ['an empty stringSet', emptySet],
    ['a numberSet filter', numberSet],
    ['no groups', noGroups],
  ])('returns undefined for %s', (_name, spec) => {
    expect(toRecoderSpec(spec, entities)).toBeUndefined();
    expect(toStoredSpec(spec, entities)).toBe(spec);
  });
});

describe('fromRecoderSpec', () => {
  it.each([
    ['stringSet', regionSpec],
    ['stringPrefixSet', geoSpec],
    ['numberRange', sizeSpec],
    ['dateRange', dateSpec],
  ])('round-trips %s', (_name, spec) => {
    const recoder = toRecoderSpec(spec, entities);
    expect(recoder).toBeDefined();
    expect(fromRecoderSpec(recoder as DerivedVariableSpec)).toEqual(spec);
  });

  const recoder = (
    functionName: string,
    rules: unknown[],
    inputVariable: unknown = { entityId: 'Shop', variableId: 'region' }
  ): DerivedVariableSpec => ({
    entityId: 'Shop',
    variableId: 'dv1',
    functionName,
    displayName: 'd',
    config: { inputVariable, rules },
  });

  it.each([
    [
      'a rule with both inputValues and inputPrefixes',
      recoder(CATEGORICAL_RECODING, [
        { inputValues: ['a'], inputPrefixes: ['b'], outputValue: 'X' },
      ]),
    ],
    [
      'an open-ended range',
      recoder(CONTINUOUS_TO_ORDINAL, [{ minInclusive: 1, outputValue: 'X' }]),
    ],
    [
      'two rules with the same outputValue',
      recoder(CATEGORICAL_RECODING, [
        { inputValues: ['a'], outputValue: 'X' },
        { inputValues: ['b'], outputValue: 'X' },
      ]),
    ],
    [
      'a config that fails to decode',
      recoder(CATEGORICAL_RECODING, [{ inputValues: [1], outputValue: 'X' }]),
    ],
  ])('returns undefined for %s', (_name, spec) => {
    expect(fromRecoderSpec(spec)).toBeUndefined();
  });
});

describe('decodeDerivedVariables', () => {
  it('filterDefinedGroups -> stored and editable are the same spec', () => {
    const r = decodeDerivedVariables([twoFilterSpec()]);
    expect(r.supported).toEqual([
      { stored: twoFilterSpec(), editable: twoFilterSpec() },
    ]);
    expect(r.unsupported).toEqual([]);
  });

  it('recoder -> stored is the recoder spec, editable its groups', () => {
    const stored = toRecoderSpec(regionSpec, entities) as DerivedVariableSpec;
    const r = decodeDerivedVariables([stored]);
    expect(r.supported).toEqual([{ stored, editable: regionSpec }]);
  });

  it('unknown function or non-round-trippable recoder -> unsupported, untouched', () => {
    const unknown: DerivedVariableSpec = {
      ...regionSpec,
      functionName: 'concatenation',
    };
    const bad: DerivedVariableSpec = {
      entityId: 'Shop',
      variableId: 'dv2',
      functionName: CONTINUOUS_TO_ORDINAL,
      displayName: 'd',
      config: {
        inputVariable: { entityId: 'Shop', variableId: 'size' },
        rules: [{ maxInclusive: 3, outputValue: 'X' }],
      },
    };
    const r = decodeDerivedVariables([unknown, bad]);
    expect(r.supported).toEqual([]);
    expect(r.unsupported).toEqual([unknown, bad]);
    expect(r.unsupported[1]).toBe(bad);
  });
});

function twoFilterSpec(): FilterDefinedGroupsSpec {
  return groupsSpec([
    {
      label: 'A',
      filters: [stringSet('region', ['n']), stringSet('region', ['s'])],
    },
  ]);
}
