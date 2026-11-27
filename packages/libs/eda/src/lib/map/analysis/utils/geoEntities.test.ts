import { StringVariable, StudyEntity } from '../../../core/types/study';
import { GeoConfig } from '../../../core/types/geoConfig';
import {
  entityPath,
  lineageEntities,
  recordColumns,
  resolveGeoConfig,
  variablesOutsideLineage,
  finestGeohashVariableId,
  MAX_FALLBACK_COLUMNS,
} from './geoEntities';

function makeVariable(
  id: string,
  options: Partial<
    Pick<StringVariable, 'isFeatured' | 'displayType' | 'hideFrom'>
  > = {}
): StringVariable {
  return {
    id,
    providerLabel: id,
    displayName: id,
    hideFrom: options.hideFrom ?? [],
    type: 'string',
    dataShape: 'categorical',
    distinctValuesCount: 5,
    isTemporal: false,
    isFeatured: options.isFeatured ?? false,
    isMergeKey: false,
    isMultiValued: false,
    ...(options.displayType ? { displayType: options.displayType } : {}),
  };
}

function makeEntity(
  id: string,
  variables: StringVariable[] = [],
  children: StudyEntity[] = []
): StudyEntity {
  return {
    id,
    idColumnName: id + '_id',
    displayName: id,
    description: '',
    variables,
    isManyToOneWithParent: false,
    children,
  };
}

// study
// ├── household (geo)
// │   └── participant
// │       └── sample
// └── site (geo)
//     └── trap
const sample = makeEntity('sample', [makeVariable('s1')]);
const participant = makeEntity('participant', [makeVariable('p1')], [sample]);
const household = makeEntity('household', [makeVariable('h1')], [participant]);
const trap = makeEntity('trap', [makeVariable('t1')]);
const site = makeEntity('site', [makeVariable('x1')], [trap]);
const study = makeEntity('study', [makeVariable('st1')], [household, site]);
const allEntities = [study, household, participant, sample, site, trap];

function makeGeoConfig(entity: StudyEntity): GeoConfig {
  return {
    entity,
    zoomLevelToAggregationLevel: () => 1,
    latitudeVariableId: 'lat',
    longitudeVariableId: 'lng',
    aggregationVariableIds: ['gh1', 'gh2', 'gh3'],
  };
}
const geoConfigs = [makeGeoConfig(household), makeGeoConfig(site)];

describe('entity lineage', () => {
  it('finds the path to an entity', () => {
    expect(entityPath(study, 'sample')?.map((e) => e.id)).toEqual([
      'study',
      'household',
      'participant',
      'sample',
    ]);
    expect(entityPath(study, 'nope')).toBeUndefined();
  });

  it('includes ancestors, the entity and descendants, but not cousins', () => {
    expect(lineageEntities(study, 'household').map((e) => e.id)).toEqual([
      'study',
      'household',
      'participant',
      'sample',
    ]);
    expect(lineageEntities(study, 'site').map((e) => e.id)).toEqual([
      'study',
      'site',
      'trap',
    ]);
  });

  it('lists variables outside the lineage', () => {
    const lineage = new Set(
      lineageEntities(study, 'site').map((entity) => entity.id)
    );
    expect(variablesOutsideLineage(allEntities, lineage)).toEqual([
      { entityId: 'household', variableId: 'h1' },
      { entityId: 'participant', variableId: 'p1' },
      { entityId: 'sample', variableId: 's1' },
    ]);
  });
});

describe('resolveGeoConfig', () => {
  it('prefers the saved location entity', () => {
    expect(
      resolveGeoConfig(geoConfigs, {
        geoEntityId: 'site',
        legacyGeoEntityId: 'household',
      }).entity.id
    ).toBe('site');
  });

  it('falls back to the legacy per-marker setting', () => {
    expect(
      resolveGeoConfig(geoConfigs, { legacyGeoEntityId: 'site' }).entity.id
    ).toBe('site');
  });

  it('falls back to the marker variable lineage', () => {
    expect(
      resolveGeoConfig(geoConfigs, {
        markerVariable: { entityId: 'trap', variableId: 't1' },
      }).entity.id
    ).toBe('site');
    expect(
      resolveGeoConfig(geoConfigs, {
        markerVariable: { entityId: 'sample', variableId: 's1' },
      }).entity.id
    ).toBe('household');
  });

  it('ignores unknown ids', () => {
    expect(resolveGeoConfig(geoConfigs, { geoEntityId: 'x' }).entity.id).toBe(
      'household'
    );
  });

  it('knows the finest geohash variable', () => {
    expect(finestGeohashVariableId(geoConfigs[0])).toBe('gh3');
  });
});

describe('recordColumns', () => {
  it('uses featured variables when there are any', () => {
    const entity = makeEntity('e', [
      makeVariable('a'),
      makeVariable('b', { isFeatured: true }),
      makeVariable('c', { isFeatured: true, hideFrom: ['download'] }),
    ]);
    const { variables, usingFeatured } = recordColumns(entity);
    expect(usingFeatured).toBe(true);
    expect(variables.map((v) => v.id)).toEqual(['b']);
  });

  it('falls back to the first displayable variables, skipping geo ones', () => {
    const entity = makeEntity('e', [
      makeVariable('lat', { displayType: 'latitude' }),
      makeVariable('gh', { displayType: 'geoaggregator' }),
      ...['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((id) => makeVariable(id)),
    ]);
    const { variables, usingFeatured } = recordColumns(entity);
    expect(usingFeatured).toBe(false);
    expect(variables).toHaveLength(MAX_FALLBACK_COLUMNS);
    expect(variables[0].id).toBe('a');
  });
});
