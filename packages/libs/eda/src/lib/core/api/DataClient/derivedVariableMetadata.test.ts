import { isRight } from 'fp-ts/Either';
import { DerivedVariableMetadata } from './types';
import { toVariableTreeNode } from '../../derivedVariables/metadata';

// shape of a live merge-service response
const live = {
  units: null,
  derivationType: 'transform',
  variableType: 'string',
  dataShape: 'categorical',
  vocabulary: ['Norh', 'South', 'Other'],
  dataRange: null,
  variableId: 'be8b',
  entityId: 'ENT_a94a5840',
};

describe('DerivedVariableMetadata codec', () => {
  test('decodes a live response with null units and dataRange', () => {
    expect(isRight(DerivedVariableMetadata.decode(live))).toBe(true);
  });

  test('decodes a null vocabulary, which becomes an empty vocabulary node', () => {
    const decoded = DerivedVariableMetadata.decode({
      ...live,
      vocabulary: null,
    });
    expect(isRight(decoded)).toBe(true);
    if (isRight(decoded)) {
      const node = toVariableTreeNode(decoded.right, {
        entityId: live.entityId,
        variableId: live.variableId,
        functionName: 'filterDefinedGroups',
        displayName: 'x',
        config: {},
      });
      expect(node.vocabulary).toEqual([]);
      expect(node.distinctValuesCount).toBe(0);
    }
  });
});
