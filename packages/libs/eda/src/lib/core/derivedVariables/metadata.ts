import { DerivedVariableMetadata } from '../api/DataClient/types';
import { DerivedVariableSpec } from '../types/analysis';
import { StringVariable, StudyEntity, VariableCategory } from '../types/study';

export const DERIVED_VARIABLES_CATEGORY_ID = 'derived_variables_category';
export const DERIVED_VARIABLES_CATEGORY_LABEL = 'Created in this analysis';

export function toVariableTreeNode(
  meta: DerivedVariableMetadata,
  spec: DerivedVariableSpec
): StringVariable {
  const vocabulary = meta.vocabulary ?? [];
  return {
    id: spec.variableId,
    displayName: spec.displayName,
    type: 'string',
    dataShape: meta.dataShape === 'continuous' ? 'categorical' : meta.dataShape,
    vocabulary,
    distinctValuesCount: vocabulary.length,
    isTemporal: false,
    isFeatured: false,
    isMergeKey: false,
    isMultiValued: false,
    providerLabel: '',
    hideFrom: ['download'],
    parentId: DERIVED_VARIABLES_CATEGORY_ID,
  };
}

/** Returns a new tree; the input is not mutated. */
export function addDerivedVariablesToEntity(
  root: StudyEntity,
  nodes: Array<{ entityId: string; node: StringVariable }>
): StudyEntity {
  const visit = (entity: StudyEntity): StudyEntity => {
    const mine = nodes.filter((n) => n.entityId === entity.id);
    const children = entity.children?.map(visit);
    if (mine.length === 0) {
      return children ? { ...entity, children } : entity;
    }
    const category: VariableCategory = {
      id: DERIVED_VARIABLES_CATEGORY_ID,
      type: 'category',
      displayName: DERIVED_VARIABLES_CATEGORY_LABEL,
      providerLabel: '',
      hideFrom: [],
    };
    return {
      ...entity,
      ...(children ? { children } : {}),
      variables: [...entity.variables, category, ...mine.map((n) => n.node)],
    };
  };
  return visit(root);
}
