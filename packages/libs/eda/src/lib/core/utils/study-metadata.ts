import { find } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import { StudyEntity, VariableTreeNode } from '../types/study';
import { VariableDescriptor } from '../types/variable';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

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

// Traverse down the entities and return an array of collection variables.
export function findCollections(entity: StudyEntity) {
  // Create an array of collections, where each collection element is a CollectionVariableTreeNode
  // that includes that collection's entity id and display name
  const collections = Array.from(
    preorder(entity, (e) => e.children ?? [])
  ).flatMap((e) => {
    const collectionWithEntity = e.collections?.map((collection) => {
      return {
        ...collection,
        entityId: e.id,
        entityDisplayName: e.displayName,
      };
    });
    return collectionWithEntity ?? [];
  });

  return collections;
}
