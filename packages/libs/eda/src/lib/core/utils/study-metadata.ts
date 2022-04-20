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

export function findCollections(
  entity: StudyEntity,
  collections: Array<any> = []
) {
  if (entity.collections?.length) {
    collections.push(
      entity.collections.map((collection) => {
        collection.entityId = entity.id;
        collection.entityDisplayName = entity.displayName;
        return { entityId: entity.id, variableId: collection.id };
      })
    );
  }
  if (entity.children?.length) {
    entity.children.forEach((childEntity) =>
      findCollections(childEntity, collections)
    );
  }

  return collections;
}
