import { useMemo } from 'react';

import {
  BaseField,
  Field,
  FieldTreeNode,
  TreeNode,
} from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';
import {
  GENERATED_ROOT_FIELD,
  getGenericTree,
  getTree,
} from '@veupathdb/wdk-client/lib/Components/AttributeFilter/AttributeFilterUtils';
import { pruneDescendantNodes } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

import { StudyEntity } from '../../types/study';
import {
  edaVariableToWdkField,
  entitiesToFields,
  ExtendedField,
} from '../../utils/wdk-filter-param-adapter';
import { keyBy } from 'lodash';

/**
 * Generates a flattened representation of the possible values for
 * all entity/variable combinations.
 *
 * An example entry would look something like this.
 * "PCO_0000024/ENVO_00000004": "Bangladesh India Kenya Mali Mozambique Pakistan The Gambia",
 *
 * Object keys are `entityID/variableID` and object values are the possible values for that
 * entity/variable combination.
 *
 * This is used by the search functionality of FieldList.
 * It should be a map from field term to string.
 * In WDK searches, this is a concatenated string of values
 * for categorical-type variables.
 *
 */
export const useValuesMap = (entities: StudyEntity[]) =>
  useMemo(() => {
    const valuesMap: Record<string, string> = {};
    for (const entity of entities) {
      for (const variable of entity.variables) {
        if (variable.type !== 'category' && variable.vocabulary) {
          valuesMap[`${entity.id}/${variable.id}`] = variable.vocabulary.join(
            ' '
          );
        }
      }
    }
    return valuesMap;
  }, [entities]);

// type FieldWithIsFeatured = Field & { isFeatured: boolean };

/**
 * Memoized hook that delegates to {@link entitiesToFields}
 */
export const useFlattenedFields = (entities: StudyEntity[]) =>
  useMemo(() => entitiesToFields(entities), [entities]);

/**
 * Identity "fields" from the entity hierarchy which have been marked
 * as "featured". This appears to be something that happens on the backend.
 *
 * Similiarly to the `useFlattenedFields` hook, this hook will return
 * a flat list of Field objects.
 */
export const useFeaturedFields = (entities: StudyEntity[]): Field[] =>
  useMemo(() => {
    return entities.flatMap((entity) =>
      entity.variables
        .filter(
          (variable) => variable.type !== 'category' && variable.isFeatured
        )
        .map((variable) => ({
          ...variable,
          id: `${entity.id}/${variable.id}`,
          displayName: `<span class="Entity">${entity.displayName}</span>: ${variable.displayName}`,
        }))
        .map((variable) => edaVariableToWdkField(variable))
    );
  }, [entities]);

export const useFeaturedFieldsFromTree = (
  fieldTree: TreeNode<Field | ExtendedField>
) => {
  return getFeaturedFieldsRecursive(fieldTree, 'Unknown Entity').map(
    (node) => node.field
  );
};

const getFeaturedFieldsRecursive = (
  treeNode: TreeNode<Field | ExtendedField>,
  entityName: string
) => {
  const filteredFieldList: TreeNode<Field | ExtendedField>[] = [];
  if (treeNode.children.length > 0) {
    const newEntityName = treeNode.field.term.startsWith('entity')
      ? treeNode.field.display
      : entityName;
    treeNode.children.forEach((child) =>
      filteredFieldList.push(
        ...getFeaturedFieldsRecursive(child, newEntityName)
      )
    );
  } else {
    // console.log({ leafNode: treeNode });
    if ('isFeatured' in treeNode.field && treeNode.field.isFeatured) {
      // console.log('treeNode matched');
      // console.log({ treeNode });
      const newTreeNode = {
        ...treeNode,
        field: {
          ...treeNode.field,
          parent: treeNode.field.parent?.split('/')[1],
          display: `<span class="Entity">${entityName}</span>: ${treeNode.field.display}`,
        },
      };
      filteredFieldList.push(newTreeNode);
    }
  }
  return filteredFieldList;
};

/**
 * Construct a hierarchical representation of variable fields from
 * a flat array of fields.
 *
 * This is used to actually display the fields (entity, variable category,
 * or variable) in a visual hierachy to the user.
 */
export const useFieldTree = (flattenedFields: Array<Field | ExtendedField>) =>
  useMemo(() => {
    const initialTree = getGenericTree<Field | ExtendedField>(
      flattenedFields,
      GENERATED_ROOT_FIELD,
      {
        hideSingleRoot: false,
      }
    );
    const tree = pruneDescendantNodes(
      (node) => node.field.type != null || node.children.length > 0,
      initialTree
    );
    return tree;
  }, [flattenedFields]);

/**
 * Simple transformation of useFlattenFields output from an array
 * to an object, whose keys are the `term` attribute of each array item.
 * */
export const useFlattenFieldsByTerm = (flattenedFields: Array<Field>) =>
  useMemo(() => keyBy(flattenedFields, (f) => f.term), [flattenedFields]);
