import { find } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import { StudyEntity, VariableTreeNode } from '../types/study';
import { VariableDescriptor } from '../types/variable';

export interface EntityAndVariable {
  entity: StudyEntity;
  variable: VariableTreeNode;
}

export function findEntityAndVariable(
  entities: Iterable<StudyEntity>,
  variableDescriptor?: VariableDescriptor
): EntityAndVariable | undefined {
  if (variableDescriptor == null) return undefined;
  const entity = find(
    (entity) => entity.id === variableDescriptor.entityId,
    entities
  );
  const variable =
    entity &&
    find(
      (variable) => variable.id === variableDescriptor.variableId,
      entity.variables
    );
  if (entity == null || variable == null) return undefined;
  return { entity, variable };
}

export function makeEntityDisplayName(entity: StudyEntity, isPlural: boolean) {
  return !isPlural
    ? entity.displayName
    : entity.displayNamePlural ?? `${entity.displayName}s`;
}
