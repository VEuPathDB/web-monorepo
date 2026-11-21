import { NumberVariable, StudyEntity } from '../../../core/types/study';
import { parseRecords } from './recordsTableData';

function makeEntity(id: string, displayName: string): StudyEntity {
  return {
    id,
    idColumnName: id + '_id',
    displayName,
    description: '',
    variables: [],
    isManyToOneWithParent: false,
  };
}

const variable: NumberVariable = {
  id: 'age',
  providerLabel: 'age',
  displayName: 'Age',
  units: 'years',
  precision: 0,
  hideFrom: [],
  type: 'number',
  dataShape: 'continuous',
  distinctValuesCount: 50,
  isTemporal: false,
  isFeatured: true,
  isMergeKey: false,
  isMultiValued: false,
  distributionDefaults: { rangeMin: 0, rangeMax: 100 },
};

const entities = [
  makeEntity('house', 'Household'),
  makeEntity('person', 'Participant'),
];

describe('parseRecords', () => {
  it('names ID and variable columns and folds coordinates into positions', () => {
    const { columns, rows } = parseRecords(
      [
        ['house_id', 'person_id', 'age', 'lat', 'lng'],
        ['h1', 'p1', '42', '1.5', '-2.25'],
        ['h1', 'p2', '', '', ''],
      ],
      entities,
      [variable],
      { latitude: 'lat', longitude: 'lng' }
    );
    expect(columns).toEqual([
      { key: 'house_id', header: 'Household ID', kind: 'id' },
      { key: 'person_id', header: 'Participant ID', kind: 'id' },
      { key: 'age', header: 'Age (years)', kind: 'variable' },
    ]);
    expect(rows).toEqual([
      {
        key: 'h1/p1',
        values: { house_id: 'h1', person_id: 'p1', age: '42' },
        position: { lat: 1.5, lng: -2.25 },
      },
      {
        key: 'h1/p2',
        values: { house_id: 'h1', person_id: 'p2', age: '' },
        position: undefined,
      },
    ]);
  });

  it('copes with an empty response and unknown columns', () => {
    expect(parseRecords([], entities, [])).toEqual({ columns: [], rows: [] });
    expect(
      parseRecords([['mystery'], ['x']], entities, []).columns[0].header
    ).toBe('mystery');
  });
});
