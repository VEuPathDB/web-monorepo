import { Computation } from '../types/visualization';
import { DerivedVariableSpec } from './types';
import { findReferencedSpecs, findVisualizationsUsing } from './references';

const mk = (variableId: string, entityId = 'e'): DerivedVariableSpec => ({
  entityId,
  variableId,
  functionName: 'filterDefinedGroups',
  displayName: variableId,
  config: {},
});
const v = mk('v');
const w = mk('w');

test('findReferencedSpecs finds specs nested anywhere in a config', () => {
  const value = {
    config: { overlayVariable: { entityId: 'e', variableId: 'v' } },
  };
  expect(findReferencedSpecs(value, [v, w])).toEqual([v]);
});

test('findReferencedSpecs ignores a matching variableId on another entity', () => {
  const value = [{ entityId: 'other', variableId: 'v' }];
  expect(findReferencedSpecs(value, [v, w])).toEqual([]);
});

test('findVisualizationsUsing lists visualisations whose descriptor references the spec', () => {
  const viz = (id: string, configuration: unknown) => ({
    visualizationId: id,
    descriptor: { type: 'x', configuration },
  });
  const used = viz('1', {
    overlayVariable: { entityId: 'e', variableId: 'v' },
  });
  const computations: Computation[] = [
    {
      computationId: 'c1',
      descriptor: { type: 'pass', configuration: {} },
      visualizations: [
        used,
        viz('2', { overlayVariable: { entityId: 'e', variableId: 'w' } }),
      ],
    },
    {
      computationId: 'c2',
      descriptor: { type: 'pass', configuration: {} },
      visualizations: [viz('3', {})],
    },
  ];
  expect(findVisualizationsUsing(computations, v)).toEqual([used]);
});
