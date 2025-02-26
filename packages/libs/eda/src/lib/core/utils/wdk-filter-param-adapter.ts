import { groupBy, negate, partial } from 'lodash';

import {
  Filter as WdkFilter,
  TreeNode,
} from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';
import {
  GENERATED_ROOT_FIELD,
  getGenericTree,
} from '@veupathdb/wdk-client/lib/Components/AttributeFilter/AttributeFilterUtils';
import { pruneDescendantNodes } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

import { DistributionResponse } from '../api/SubsettingClient';
import { Filter as EdaFilter, StringSetFilter } from '../types/filter';
import {
  StudyEntity,
  VariableScope,
  VariableTreeNode,
  FieldWithMetadata,
} from '../types/study';

/*
 * These adapters can be used to convert filter objects between EDA and WDK
 * types. Note that the generated WDK filter object includes a rogue property
 * named `__entityId`. This information is needed for EDA.
 */

/** Convert a WDK Filter to an EDA Filter */
export function toEdaFilter(filter: WdkFilter, entityId: string): EdaFilter {
  const variableId = filter.field;
  if ('__entityId' in filter) entityId = (filter as any).__entityId;
  switch (filter.isRange) {
    case true: {
      switch (filter.type) {
        case 'number':
          return {
            entityId,
            variableId,
            type: 'numberRange',
            min: filter.value.min!,
            max: filter.value.max!,
          };
        case 'longitude':
          return {
            entityId,
            variableId,
            type: 'longitudeRange',
            left: filter.value.min!,
            right: filter.value.max!,
          };
        case 'date':
          return {
            entityId,
            variableId,
            type: 'dateRange',
            min: filter.value.min! + 'T00:00:00',
            max: filter.value.max! + 'T00:00:00',
          };
        default:
          throw new Error('Unsupported filter');
      }
    }
    case false: {
      switch (filter.type) {
        case 'date':
          return {
            entityId,
            variableId,
            type: 'dateSet',
            dateSet: filter.value.map((date) => date + 'T00:00:00'),
          };
        case 'number':
          return {
            entityId,
            variableId,
            type: 'numberSet',
            numberSet: filter.value.map((value) => value!),
          };
        case 'string':
          return {
            entityId,
            variableId,
            type: 'stringSet',
            stringSet: filter.value.map((value) => value!),
          };
        case 'multiFilter':
          return {
            entityId,
            variableId,
            type: 'multiFilter',
            operation: filter.value.operation,
            subFilters: filter.value.filters.map(
              (filter) => toEdaFilter(filter, entityId) as StringSetFilter
            ),
          };
        default:
          throw new Error('Unsupported filter type: ' + (filter as any).type);
      }
    }
  }
}

/** Convert an EDA Filter to a WDK Filter */
export function fromEdaFilter(filter: EdaFilter): WdkFilter {
  return {
    field: filter.variableId,
    isRange: filter.type.endsWith('Range'),
    includeUnknown: false,
    type: filter.type.replace(/(Set|Range)/, ''),
    value:
      filter.type === 'dateRange'
        ? {
            min: filter.min.replace('T00:00:00', ''),
            max: filter.max.replace('T00:00:00', ''),
          }
        : filter.type === 'numberRange'
        ? {
            min: filter.min,
            max: filter.max,
          }
        : filter.type === 'longitudeRange'
        ? {
            min: filter.left,
            max: filter.right,
          }
        : filter.type === 'dateSet'
        ? filter[filter.type].map((d) => d.replace('T00:00:00', ''))
        : filter.type === 'stringSet'
        ? filter[filter.type]
        : filter.type === 'multiFilter'
        ? {
            filters: filter.subFilters.map((subFilter) =>
              fromEdaFilter(subFilter as StringSetFilter)
            ),
            operation: filter.operation,
          }
        : // numberSet
          filter[filter.type],
    __entityId: filter.entityId,
  } as WdkFilter;
}

export function edaVariableToWdkField(
  variable: VariableTreeNode
): FieldWithMetadata {
  return {
    display: variable.displayName,
    isRange:
      variable.type !== 'category' && variable.dataShape === 'continuous',
    parent: variable.parentId,
    precision: 1,
    term: variable.id,
    type:
      variable.displayType === 'multifilter'
        ? 'multiFilter'
        : variable.type !== 'category'
        ? variable.type
        : undefined,
    entityName: variable.entityName,
    variableName: variable.providerLabel,
    isFeatured: variable.type !== 'category' ? variable.isFeatured : undefined,
  };
}

export function toWdkVariableSummary(
  foreground: DistributionResponse,
  background: DistributionResponse,
  variable: VariableTreeNode
) {
  return {
    distribution: background.histogram.map(({ value, binLabel }, index) => ({
      count: value,
      filteredCount: foreground.histogram[index].value,
      value: binLabel,
    })),
    entitiesCount: background.statistics.numDistinctEntityRecords,
    filteredEntitiesCount: foreground.statistics.numDistinctEntityRecords,
    activeField: edaVariableToWdkField(variable),
  };
}

/**
 * Generate a flat array of objects where each object represents
 * a given entity/variable category/variable in the entity hierarchy.
 * 
 * An example entry will generally look like this:
 * {
    "display": "Country",
    "isRange": false,
    "parent": "PCO_0000024/GAZ_00000448",
    "precision": 1,
    "term": "PCO_0000024/ENVO_00000004",
    "type": "string",
    "variableName": "[\"SITE\"]",
    "hideFrom": []
  }
 *
 * Of note, `parent` will be a reference to one of the following:
 * 1. An entity.
 * 2. A "variable category" - which isn't really a variable, but a organizational
 *    grouping of related variables. 
 * 
 * `Term` is a reference to the item itself and can be either an 
 * entity, variable category, or variable itself.
 *
 * Variables which should be "hid[den] from" the specified
 * "scope" will not be included.
 */
export function entitiesToFields(
  entities: StudyEntity[],
  scope: VariableScope
): Array<FieldWithMetadata> {
  return entities.flatMap((entity) => {
    // Create a Set of variableId so we can lookup parentIds
    const variableIds = new Set(entity.variables.map((v) => v.id));

    // Create a Set of all variables which should be hidden
    // from the specified "scope"
    const hiddenVariablesInScope = makeHiddenVariablesInScope(entity, scope);

    return [
      // Create a non-filterable field for the entity.
      // Note that we're prefixing the term. This avoids
      // collisions with variables using the same term.
      // This situation shouldn't happen in production,
      // but there is nothing preventing it, so we need to
      // handle the case.
      {
        term: `entity:${entity.id}`,
        display: entity.displayName,
      },
      ...entity.variables
        .filter(negate(partial(shouldHideVariable, hiddenVariablesInScope)))
        // Before handing off to edaVariableToWdkField, we will
        // change the id of the variable to include the entityId.
        // This will make the id unique across the tree and prevent
        // duplication across entity subtrees.
        .map((variable) => ({
          ...variable,
          id: `${entity.id}/${variable.id}`,
          parentId:
            // Use entity as parent under the following conditions:
            // - if parentId is null
            // - if the parentId is the same as the entityId
            // - if the parentId does not exist in the provided list of variables
            //
            // Variables that meet any of these conditions will serve
            // as the root nodes of the variable subtree, which will
            // become the children of the entity node in the final tree.
            variable.parentId == null ||
            variable.parentId === entity.id ||
            !variableIds.has(variable.parentId)
              ? `entity:${entity.id}`
              : `${entity.id}/${variable.parentId}`,
        }))
        .map((variable) => edaVariableToWdkField(variable)),
    ];
  });
}

export function makeHiddenVariablesInScope(
  entity: StudyEntity,
  scope: VariableScope
): Set<string> {
  const hiddenVariablesInScope = new Set<string>();

  // Define recursive function to be called later
  function _traverseDescendantVariables(
    variable: VariableTreeNode,
    parentIsHidden: boolean
  ) {
    const shouldHideVariable =
      parentIsHidden ||
      variable.hideFrom.includes('everywhere') ||
      variable.hideFrom.includes(scope);

    if (shouldHideVariable) {
      hiddenVariablesInScope.add(variable.id);
    }

    variablesByParentId[variable.id]?.forEach((childVariable) => {
      _traverseDescendantVariables(childVariable, shouldHideVariable);
    });
  }

  const variableIds = new Set(entity.variables.map((variable) => variable.id));
  const variablesByParentId = groupBy(
    entity.variables,
    (variable) => variable.parentId ?? entity.id
  );
  // The parent IDs of root variables, where a root variable is a variable
  // whose parent is not in this entity's variable list
  const rootParentIds = Object.keys(variablesByParentId).filter(
    (parentId) => !variableIds.has(parentId)
  );

  rootParentIds.forEach((rootParentId) => {
    variablesByParentId[rootParentId].forEach((variable) => {
      // Call recursive function
      _traverseDescendantVariables(variable, false);
    });
  });

  return hiddenVariablesInScope;
}

export function shouldHideVariable(
  hiddenVariables: Set<string>,
  variable: VariableTreeNode
) {
  return hiddenVariables.has(variable.id);
}

export function makeFieldTree(
  fields: Array<FieldWithMetadata>
): TreeNode<FieldWithMetadata> {
  const initialTree = getGenericTree<FieldWithMetadata>(
    fields,
    GENERATED_ROOT_FIELD,
    { hideSingleRoot: false }
  );
  return pruneEmptyFields(initialTree);
}

export const pruneEmptyFields = (initialTree: TreeNode<FieldWithMetadata>) =>
  pruneDescendantNodes(
    (node) => node.field.type != null || node.children.length > 0,
    initialTree
  );
