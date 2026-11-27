import { Filter } from '../../../core/types/filter';
import { GeoConfig } from '../../../core/types/geoConfig';
import { StudyEntity } from '../../../core/types/study';
import {
  MAX_EDITABLE_SHAPES,
  filtersWithSelection,
  geoCoordUIStateForSelection,
  geoCoordUIStateKey,
} from './filterToSelection';

const entity: StudyEntity = {
  id: 'household',
  idColumnName: 'household_id',
  displayName: 'Household',
  description: '',
  variables: [],
  isManyToOneWithParent: false,
};

const geoConfig: GeoConfig = {
  entity,
  zoomLevelToAggregationLevel: () => 1,
  latitudeVariableId: 'lat',
  longitudeVariableId: 'lng',
  aggregationVariableIds: ['gh1', 'gh2', 'gh3'],
};

const otherFilter: Filter = {
  type: 'stringSet',
  entityId: 'household',
  variableId: 'roof',
  stringSet: ['tin'],
};

describe('filtersWithSelection', () => {
  it('adds a prefix filter on the finest geohash variable', () => {
    expect(
      filtersWithSelection([otherFilter], geoConfig, ['u4', 'gc'])
    ).toEqual({
      prefixSet: ['u4', 'gc'],
      filters: [
        otherFilter,
        {
          type: 'stringPrefixSet',
          entityId: 'household',
          variableId: 'gh3',
          prefixSet: ['u4', 'gc'],
        },
      ],
    });
  });

  it('intersects with an existing geo filter instead of widening it', () => {
    const existing: Filter = {
      type: 'stringPrefixSet',
      entityId: 'household',
      variableId: 'gh3',
      prefixSet: ['u4pr', 'dr5'],
    };
    const result = filtersWithSelection([existing, otherFilter], geoConfig, [
      'u4',
    ]);
    expect(result?.prefixSet).toEqual(['u4pr']);
    expect(result?.filters).toEqual([
      otherFilter,
      { ...existing, prefixSet: ['u4pr'] },
    ]);
  });

  it('declines when the selection is outside the existing geo filter', () => {
    const existing: Filter = {
      type: 'stringPrefixSet',
      entityId: 'household',
      variableId: 'gh3',
      prefixSet: ['dr5'],
    };
    expect(filtersWithSelection([existing], geoConfig, ['u4'])).toBeUndefined();
  });
});

describe('GeoCoordFilter UI state', () => {
  it('uses the shared lat/long key', () => {
    expect(geoCoordUIStateKey(geoConfig)).toBe('household/lat/lng');
  });

  it('makes one slightly inset rectangle per cell', () => {
    const state = geoCoordUIStateForSelection({ resolution: 'high' }, ['s'], {
      center: [10, 20],
      zoom: 4,
    });
    expect(state.resolution).toBe('high');
    expect(state.mapCenterAndZoom).toEqual({
      latitude: 10,
      longitude: 20,
      zoomLevel: 4,
    });
    expect(state.selectedShapes).toHaveLength(1);
    const [[south, west], , [north, east]] = state.selectedShapes![0];
    expect(south).toBeCloseTo(0.45);
    expect(west).toBeCloseTo(0.45);
    expect(north).toBeCloseTo(44.55);
    expect(east).toBeCloseTo(44.55);
  });

  it('leaves out shapes for very large selections', () => {
    const many = Array.from(
      { length: MAX_EDITABLE_SHAPES + 1 },
      (_, i) =>
        'u' + '0123456789bcdefghjkmnpqrstuvwxyz'[i % 32] + 'bcdefgh'[i >> 5]
    );
    expect(
      geoCoordUIStateForSelection(undefined, many, {
        center: [0, 0],
        zoom: 1,
      }).selectedShapes
    ).toEqual([]);
  });
});
