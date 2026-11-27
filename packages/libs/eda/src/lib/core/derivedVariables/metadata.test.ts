import { StudyEntity } from '../types/study';
import { DerivedVariableMetadata } from '../api/DataClient/types';
import { DerivedVariableSpec } from './types';
import {
  addDerivedVariablesToEntity,
  DERIVED_VARIABLES_CATEGORY_ID,
  toVariableTreeNode,
} from './metadata';

const spec: DerivedVariableSpec = {
  entityId: 'child',
  variableId: 'dv1',
  functionName: 'filterDefinedGroups',
  displayName: 'My groups',
  config: {},
};
const meta: DerivedVariableMetadata = {
  entityId: 'child',
  variableId: 'dv1',
  derivationType: 'transform',
  variableType: 'string',
  dataShape: 'categorical',
  vocabulary: ['a', 'b', 'c'],
};

const entity = (id: string, children?: StudyEntity[]): StudyEntity => ({
  id,
  idColumnName: id + '_id',
  displayName: id,
  description: '',
  variables: [],
  isManyToOneWithParent: false,
  children,
});

describe('metadata', () => {
  test('toVariableTreeNode makes a categorical string variable in the derived folder', () => {
    const node = toVariableTreeNode(meta, spec);
    expect(node).toMatchObject({
      id: 'dv1',
      displayName: 'My groups',
      type: 'string',
      dataShape: 'categorical',
      vocabulary: ['a', 'b', 'c'],
      distinctValuesCount: 3,
      isTemporal: false,
      isFeatured: false,
      isMergeKey: false,
      isMultiValued: false,
      providerLabel: '',
      hideFrom: ['download'],
      parentId: DERIVED_VARIABLES_CATEGORY_ID,
    });
  });

  test('addDerivedVariablesToEntity adds the folder and variable to the right nested entity only', () => {
    const root = entity('root', [entity('child'), entity('other')]);
    const node = toVariableTreeNode(meta, spec);
    const result = addDerivedVariablesToEntity(root, [
      { entityId: 'child', node },
    ]);
    const child = result.children?.find((e) => e.id === 'child');
    expect(child?.variables).toHaveLength(2);
    expect(child?.variables).toContainEqual(
      expect.objectContaining({
        id: DERIVED_VARIABLES_CATEGORY_ID,
        type: 'category',
        displayName: 'Created in this analysis',
        hideFrom: [],
      })
    );
    expect(child?.variables).toContainEqual(node);
    expect(result.variables).toHaveLength(0);
    expect(result.children?.find((e) => e.id === 'other')?.variables).toEqual(
      []
    );
    // input is untouched
    expect(root.children?.[0].variables).toHaveLength(0);
  });
});
