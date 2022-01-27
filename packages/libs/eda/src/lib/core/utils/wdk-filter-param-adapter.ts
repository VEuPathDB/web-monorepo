import { Filter as EdaFilter, StringSetFilter } from '../types/filter';
import {
  Field,
  FieldTreeNode,
  Filter as WdkFilter,
} from '@veupathdb/wdk-client/lib/Components/AttributeFilter/Types';
import { DistributionResponse } from '../api/SubsettingClient';
import { ExtendedField, StudyEntity, VariableTreeNode } from '../types/study';
import { getTree } from '@veupathdb/wdk-client/lib/Components/AttributeFilter/AttributeFilterUtils';
import { pruneDescendantNodes } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

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
): ExtendedField {
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
    "variableName": "[\"SITE\"]"
  }
 *
 * Of note, `parent` will be a reference to one of the following:
 * 1. An entity.
 * 2. A "variable category" - which isn't really a variable, but a organizational
 *    grouping of related variables. 
 * 
 * `Term` is a reference to the item itself and can be either an 
 * entity, variable category, or variable itself.
 */
export function entitiesToFields(
  entities: StudyEntity[]
): Array<Field | ExtendedField> {
  return entities.flatMap((entity) => {
    // Create a Set of variableId so we can lookup parentIds
    const variableIds = new Set(entity.variables.map((v) => v.id));
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
        // add condition not to include displayType === 'hidden'
        .filter((variable) => variable.displayType !== 'hidden')
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

export function makeFieldTree(fields: Field[]): FieldTreeNode {
  const initialTree = getTree(fields, { hideSingleRoot: false });
  return pruneEmptyFields(initialTree);
}

export const pruneEmptyFields = (initialTree: FieldTreeNode) =>
  pruneDescendantNodes(
    (node) => node.field.type != null || node.children.length > 0,
    initialTree
  );
