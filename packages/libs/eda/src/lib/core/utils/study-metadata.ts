import { keyBy } from 'lodash';
import { find, Seq } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import {
  CollectionVariableTreeNode,
  MultiFilterVariable,
  StudyEntity,
  VariableTreeNode,
} from '../types/study';
import {
  VariableCollectionDescriptor,
  VariableDescriptor,
} from '../types/variable';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

export function entityTreeToArray(rootEntity: StudyEntity): StudyEntity[] {
  return Array.from(preorder(rootEntity, (e) => e.children ?? []));
}

export interface EntityAndVariable {
  entity: StudyEntity;
  variable: VariableTreeNode;
}

export interface EntityAndVariableCollection {
  entity: StudyEntity;
  variableCollection: CollectionVariableTreeNode;
}

export function isEntityAndVariable(object: any): object is EntityAndVariable {
  if (!object) {
    return false;
  }
  return 'entity' in object && 'variable' in object;
}

export function isEntityAndVariableCollection(
  object: any
): object is EntityAndVariableCollection {
  if (!object) {
    return false;
  }
  return 'entity' in object && 'variableCollection' in object;
}

export function isVariableDescriptor(
  object: any
): object is VariableDescriptor {
  if (!object) {
    return false;
  }
  return 'entityId' in object && 'variableId' in object;
}

export function isVariableCollectionDescriptor(
  object: any
): object is VariableCollectionDescriptor {
  if (!object) {
    return false;
  }
  if (typeof object !== 'object') {
    return false;
  }
  return 'entityId' in object && 'collectionId' in object;
}

export function getTreeNode(
  entityAndDynamicData:
    | EntityAndVariable
    | EntityAndVariableCollection
    | undefined
): VariableTreeNode | CollectionVariableTreeNode | undefined {
  if (entityAndDynamicData == null) return undefined;
  if (isEntityAndVariable(entityAndDynamicData)) {
    return entityAndDynamicData.variable;
  } else if (isEntityAndVariableCollection(entityAndDynamicData)) {
    return entityAndDynamicData.variableCollection;
  }
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

export function findEntityAndVariableCollection(
  entities: Iterable<StudyEntity>,
  variableCollectionDescriptor?: VariableCollectionDescriptor
): EntityAndVariableCollection | undefined {
  if (variableCollectionDescriptor == null) return undefined;
  const entity = find(
    (entity) => entity.id === variableCollectionDescriptor.entityId,
    entities
  );
  const variableCollection =
    entity &&
    find(
      (variableCollection) =>
        variableCollection.id === variableCollectionDescriptor.collectionId,
      entity.collections ?? []
    );
  if (entity == null || variableCollection == null) return undefined;
  return { entity, variableCollection };
}

export function findEntityAndDynamicData(
  entities: Iterable<StudyEntity>,
  dynamicDataDescriptor?: VariableDescriptor | VariableCollectionDescriptor
): EntityAndVariable | EntityAndVariableCollection | undefined {
  if (dynamicDataDescriptor == null) return undefined;
  if (isVariableDescriptor(dynamicDataDescriptor)) {
    return findEntityAndVariable(entities, dynamicDataDescriptor);
  } else if (isVariableCollectionDescriptor(dynamicDataDescriptor)) {
    return findEntityAndVariableCollection(entities, dynamicDataDescriptor);
  } else {
    return undefined;
  }
}

export function makeEntityDisplayName(entity: StudyEntity, isPlural: boolean) {
  return !isPlural
    ? entity.displayName
    : entity.displayNamePlural ?? `${entity.displayName}s`;
}

export function findVariableCollections(
  entity: StudyEntity,
  collectionPredicate?: (
    variableCollection: CollectionVariableTreeNode
  ) => boolean
): VariableCollectionDescriptor[] {
  const collections = Array.from(
    preorder(entity, (e) => e.children ?? [])
  ).flatMap((e) => {
    const collections =
      (collectionPredicate
        ? e.collections?.filter(collectionPredicate)
        : e.collections) ?? [];
    const variableCollectionDescriptors = collections.map((collection) => ({
      entityId: e.id,
      collectionId: collection.id,
    }));
    return variableCollectionDescriptors;
  });
  return collections;
}

export function findMultiFilterParent(
  entity: StudyEntity,
  variable: VariableTreeNode
) {
  const variablesById = keyBy<VariableTreeNode | undefined>(
    entity.variables,
    'id'
  );
  let parent: VariableTreeNode | undefined = variable;
  while (parent?.parentId) {
    parent = variablesById[parent.parentId];
    if (MultiFilterVariable.is(parent)) return parent;
  }
  return;
}
