import { Seq } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import {
  mapStructure,
  preorder,
} from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { isEmpty, union, sortBy, isEqual } from 'lodash';
import { StudyEntity, VariableTreeNode } from '../types/study';
import { VariableDescriptor } from '../types/variable';
import { DataElementConstraint } from '../types/visualization';
import { findEntityAndVariable } from './study-metadata';

/**
 * Returns a list of VariableDescriptors that are not compatible with the
 * current selectedVariables
 *
 */
export function disabledVariablesForInput(
  inputName: string,
  /**
   * entities must be in root-first order (pre-order)
   */
  entities: StudyEntity[],
  constraints: DataElementConstraintRecord[] | undefined,
  dataElementDependencyOrder: string[][] | undefined,
  selectedVariables: VariablesByInputName
): VariableDescriptor[] {
  const disabledVariables = excludedVariables(
    entities[0],
    inputName,
    constraints
  );
  if (dataElementDependencyOrder == null) {
    return disabledVariables;
  }
  const index = dataElementDependencyOrder.findIndex((el) =>
    el.includes(inputName as string)
  ); // ditto
  // no change if dependencyOrder is not declared
  if (index === -1) {
    return disabledVariables;
  }

  // find the *other* currently user-selected variables at the same/current
  // level in the dependency array of arrays
  const currSelectedVariables = dataElementDependencyOrder[index]
    .filter((i) => i !== (inputName as string)) // not this input!
    .map((i) => selectedVariables[i])
    .filter((v): v is VariableDescriptor => v != null);

  // find user-selected variable(s) at first position to the left in the dependency array
  const prevSelectedVariables = dataElementDependencyOrder
    .slice(0, index)
    .map((n) =>
      n
        .map((i) => selectedVariables[i])
        .filter((v): v is VariableDescriptor => v != null)
    )
    .reverse()
    .find((vs) => vs.length > 0);

  // find user-selected variable(s) at first position to the right in the dependency array
  const nextSelectedVariables = dataElementDependencyOrder
    .slice(index + 1)
    .map((n) =>
      n
        .map((i) => selectedVariables[i])
        .filter((v): v is VariableDescriptor => v != null)
    )
    .find((vs) => vs.length > 0);

  // Remove variables for entities which are not on either the ancestor or descendent path (or the same entity)
  // as any of the `currSelectedVariables`
  currSelectedVariables.forEach((currSelectedVariable) => {
    const ancestors = ancestorEntitiesForEntityId(
      currSelectedVariable.entityId,
      entities
    );
    const descendants = descendantEntitiesForEntityId(
      currSelectedVariable.entityId,
      entities
    );
    const excludedEntities = entities.filter(
      (entity) => !ancestors.includes(entity) && !descendants.includes(entity)
    );
    const excludedVariables = excludedEntities.flatMap((entity) =>
      entity.variables.map((variable) => ({
        variableId: variable.id,
        entityId: entity.id,
      }))
    );
    disabledVariables.push(...excludedVariables);
  });

  // Remove variables for entities which are not part of the ancestor path of, or equal to, the least ancestral of `prevSelectedVariables`
  // (not quite the same thing as "remove descendants", because of branching in entity tree)
  const prevSelectedVariable = leastAncestralVariable(
    prevSelectedVariables,
    entities
  );

  if (prevSelectedVariable != null) {
    const ancestors = ancestorEntitiesForEntityId(
      prevSelectedVariable.entityId,
      entities
    );
    const excludedEntities = entities.filter(
      (entity) => !ancestors.includes(entity)
    );
    const excludedVariables = excludedEntities.flatMap((entity) =>
      entity.variables.map((variable) => ({
        variableId: variable.id,
        entityId: entity.id,
      }))
    );
    disabledVariables.push(...excludedVariables);
  }

  // Remove variables for entities which are not descendants of, or equal to, each of `nextSelectedVariables`
  // (note: we could operate on just the least ancestral variable from this list (as we did above),
  // but applying this operation to all the variables has the same effect)
  nextSelectedVariables?.forEach((nextSelectedVariable) => {
    const descendants = descendantEntitiesForEntityId(
      nextSelectedVariable.entityId,
      entities
    );
    const excludedEntities = entities.filter(
      (entity) => !descendants.includes(entity)
    );
    const excludedVariables = excludedEntities.flatMap((entity) =>
      entity.variables.map((variable) => ({
        variableId: variable.id,
        entityId: entity.id,
      }))
    );
    disabledVariables.push(...excludedVariables);
  });

  return disabledVariables;
}

/**
 * Returns a new study entity tree with variables and entities removed that do
 * not satisfy the provided constraint.
 */
export function filterVariablesByConstraint(
  rootEntity: StudyEntity,
  constraint: DataElementConstraint | undefined
): StudyEntity {
  if (
    constraint == null ||
    (constraint.allowedShapes == null &&
      constraint.allowedTypes == null &&
      constraint.minNumValues == null &&
      constraint.maxNumValues == null &&
      constraint.isTemporal == null &&
      constraint.allowMultiValued)
  )
    return rootEntity;
  return mapStructure(
    (entity, children) => ({
      ...entity,
      variables: entity.variables.filter((variable) => {
        return variableConstraintPredicate(constraint, variable);
      }),
      children,
    }),
    (e) => e.children ?? [],
    rootEntity
  );
}

/**
 * Returns an array of variable identifiers that do not satisfy the provided
 * constraint.
 */
export function excludedVariables(
  rootEntity: StudyEntity,
  inputName: string,
  constraints: DataElementConstraintRecord[] | undefined
): VariableDescriptor[] {
  if (constraints == null) return [];

  return Seq.from(preorder(rootEntity, (e) => e.children ?? []))
    .flatMap((e) =>
      e.variables
        .filter((variable) => {
          return constraints.every(
            (constraint) =>
              !variableConstraintPredicate(constraint[inputName], variable)
          );
        })
        .map((v) => ({ entityId: e.id, variableId: v.id }))
    )
    .toArray();
}

/**
 * Tests if a variable satisfies a constraint
 */
function variableConstraintPredicate(
  constraint: DataElementConstraint | undefined,
  variable: VariableTreeNode
) {
  if (constraint == null) return true;
  return (
    variable.type === 'category' ||
    ((constraint.allowedShapes == null ||
      constraint.allowedShapes.includes(variable.dataShape)) &&
      (constraint.allowedTypes == null ||
        constraint.allowedTypes.includes(variable.type)) &&
      (constraint.minNumValues == null ||
        constraint.minNumValues <= variable.distinctValuesCount) &&
      (constraint.maxNumValues == null ||
        constraint.maxNumValues >= variable.distinctValuesCount) &&
      (constraint.isTemporal == null ||
        constraint.isTemporal === variable.isTemporal) &&
      (constraint.allowMultiValued || !variable.isMultiValued))
  );
}

export type VariablesByInputName<T extends string = string> = Partial<
  Record<T, VariableDescriptor>
>;
export type DataElementConstraintRecord = Partial<
  Record<string, DataElementConstraint>
>;

/**
 * Given an array of DataElementConstraint objects, user-selected variables, and a variable reference of interest
 * (ex. xAxisVariable), return an array of DataElementConstraint objects that contains all of the rules 
 * that should constrain the variable reference of interest.
 *
 * example: one contraint allows string x number, the other date x string, the other vars with < 5 values.
 *
 * constraints = [ { xAxisVariable: { allowedTypes: ['string'] }, yAxisVariable: { allowedTypes: ['number'] } },
                   { xAxisVariable: { allowedTypes: ['date'] }, yAxisVariable: { allowedTypes: ['string'] } },
                   { xAxisVariable: { maxNumVars: 5 }, yAxisVariable: { allowedTypes: ['string'] } }]
 *
 * If the user has already chosen a string-type xAxisVariable with 7 values, the
 * constraints.filter() below will allow only constraints[0] to pass for the yAxisVariable. 
 * The xAxisVariable is already chosen and so restricts the yAxisVariable to constraints that satisfy
 * the xAxisVariable choice. It won't even check the yAxisVariable of
 * constraint[1] because of the all-or-nothing nature of constraints. However, we should still be 
 * able to switch the xAxisVariable to a date or var with < 5 values, so for the xAxisVariable we 
 * will pass constraints[0:2]. 
 * 
 * Additionally, we do not want to merge constraints because, for example, that would
 * squeeze the xAxisVariables, with no variables chosen, to only allow vars that are strings or dates *and* 
 * have fewer than five values.
 *
 * More examples:
 * If no variable has been selected by the user, then all constraints will be used for
 * both the x and y variables.
 *
 * If the yAxisVariable has been set to a string, the xAxisVariable will be restricted to 
 * constraints[1:2], while the yAxisVariable will use all three constraints, since it is
 * the only variable chosen
 * 
 * If the xAxisVariable is a date with 4 unique values, the xAxisVariable will use all three constraint patterns
 * while the yAxisVariable will only use constraints[1:2].
 * 
 */

export function filterConstraints(
  variables: VariablesByInputName,
  entities: StudyEntity[],
  constraints: DataElementConstraintRecord[],
  selectedVarReference: string // variable reference for which to determine constraints. Ex. xAxisVariable.
): DataElementConstraintRecord[] {
  // Find all compatible constraints
  const compatibleConstraints = constraints.filter((constraintRecord) =>
    Object.entries(constraintRecord).every(([variableName, constraint]) => {
      if (constraint == null) return true;
      const value = variables[variableName];
      // If a value (variable) has not been user-selected for this constraint, then it is considered to be "in-play"
      if (value == null) return true;
      // Ignore constraints that are on this selectedVarReference
      if (selectedVarReference === variableName) return true;
      // If a constraint does not declare shapes or types and it allows multivalued variables, then any value is allowed, thus the constraint is "in-play"
      if (
        isEmpty(constraint.allowedShapes) &&
        isEmpty(constraint.allowedTypes) &&
        isEmpty(constraint.isTemporal) &&
        constraint.minNumValues === undefined &&
        constraint.maxNumValues === undefined &&
        constraint.allowMultiValued
      )
        return true;
      // Check that the value's associated variable has compatible characteristics
      const entityAndVariable = findEntityAndVariable(entities, value);
      if (entityAndVariable == null)
        throw new Error(
          `Could not find selected entity and variable: entityId = ${value.entityId}; variableId = ${value.variableId}.`
        );
      const { variable } = entityAndVariable;
      if (variable.type === 'category')
        throw new Error('Categories are not allowed for variable constraints.');
      const typeIsValid =
        isEmpty(constraint.allowedTypes) ||
        constraint.allowedTypes?.includes(variable.type);
      const shapeIsValid =
        isEmpty(constraint.allowedShapes) ||
        constraint.allowedShapes?.includes(variable.dataShape!);
      const passesMinValuesConstraint =
        constraint.minNumValues === undefined ||
        constraint.minNumValues <= variable.distinctValuesCount;
      const passesMaxValuesConstraint =
        constraint.maxNumValues === undefined ||
        constraint.maxNumValues >= variable.distinctValuesCount;
      const passesTemporalConstraint =
        isEmpty(constraint.isTemporal) ||
        constraint.isTemporal === variable.isTemporal;
      const passesMultivalueConstraint =
        constraint.allowMultiValued || !variable.isMultiValued;
      return (
        typeIsValid &&
        shapeIsValid &&
        passesMinValuesConstraint &&
        passesMaxValuesConstraint &&
        passesTemporalConstraint &&
        passesMultivalueConstraint
      );
    })
  );

  // if (compatibleConstraints.length === 0)
  // throw new Error(
  //   'filterConstraints: Something went wrong. No compatible constraints were found for the current set of values.'
  //   );

  return compatibleConstraints;
}

export function mergeConstraints(
  constraintMapA: DataElementConstraintRecord,
  constraintMapB: DataElementConstraintRecord
): DataElementConstraintRecord {
  const keys = union(Object.keys(constraintMapA), Object.keys(constraintMapB));
  return Object.fromEntries(
    keys.map((key): [string, DataElementConstraint | undefined] => {
      const constraintA = constraintMapA[key];
      const constraintB = constraintMapB[key];
      const mergedIsTemporal =
        constraintA == null || constraintB == null
          ? undefined
          : constraintA.isTemporal && constraintB.isTemporal
          ? true
          : !constraintA.isTemporal && !constraintB.isTemporal
          ? false
          : undefined;
      return [
        key,
        constraintA == null
          ? constraintB
          : constraintB == null
          ? constraintA
          : {
              isRequired: constraintA.isRequired || constraintB.isRequired,
              maxNumVars: Math.min(
                constraintA.maxNumVars,
                constraintB.maxNumVars
              ),
              minNumVars: Math.max(
                constraintA.minNumVars,
                constraintB.minNumVars
              ),

              allowedShapes: union(
                constraintA.allowedShapes,
                constraintB.allowedShapes
              ),
              allowedTypes: union(
                constraintA.allowedTypes,
                constraintB.allowedTypes
              ),
              minNumValues: mergeMinNumValues(constraintA, constraintB),
              maxNumValues: mergeMaxNumValues(constraintA, constraintB),
              isTemporal: mergedIsTemporal,
              allowMultiValued:
                constraintA.allowMultiValued && constraintB.allowMultiValued,
              // Since constraintA and constraintB are for the same variable slot
              // (value of `key` above) they should have the same description
              description: constraintA.description,
            },
      ];
    })
  );
}

export function mergeMinNumValues(
  constraintA: DataElementConstraint,
  constraintB: DataElementConstraint
) {
  const mergedMinNumValues = Math.max(
    constraintA.minNumValues === undefined
      ? -Infinity
      : constraintA.minNumValues,
    constraintB.minNumValues === undefined
      ? -Infinity
      : constraintB.minNumValues
  );
  return mergedMinNumValues === -Infinity ? undefined : mergedMinNumValues;
}

export function mergeMaxNumValues(
  constraintA: DataElementConstraint,
  constraintB: DataElementConstraint
) {
  const mergedMaxNumValues = Math.min(
    constraintA.maxNumValues === undefined
      ? Infinity
      : constraintA.maxNumValues,
    constraintB.maxNumValues === undefined ? Infinity : constraintB.maxNumValues
  );
  return mergedMaxNumValues === Infinity ? undefined : mergedMaxNumValues;
}

/**
 * returns an array of entities that are either the same entity as the provided variable, or its ancestors
 */
export function ancestorEntitiesForEntityId(
  entityId: string,
  entities: StudyEntity[]
): StudyEntity[] {
  const ancestors = entities.reduceRight((ancestors, entity) => {
    if (entity.id === entityId || entity.children?.includes(ancestors[0])) {
      ancestors.unshift(entity);
    }
    return ancestors;
  }, [] as StudyEntity[]);

  return ancestors;
}

/**
 * returns an array of entities that are either the same entity as the provided variable, or its descendants
 */
function descendantEntitiesForEntityId(
  entityId: string,
  entities: StudyEntity[]
): StudyEntity[] {
  const entity = entities.find((entity) => entity.id === entityId);
  if (entity == null) throw new Error('Unkonwn entity: ' + entityId);
  const descendants = Array.from(
    preorder(entity, (entity) => entity.children ?? [])
  );
  return descendants;
}

/**
 * given a list of variable descriptors and list of study entities
 * return the variable descriptor which is least ancestral (leaf-most)
 */

export function leastAncestralVariable(
  variables: VariableDescriptor[] | undefined,
  entities: StudyEntity[]
): VariableDescriptor | undefined {
  if (variables == null || variables.length === 0) return undefined;

  // The least ancestral node has the most ancestors, so let's count them.
  // And sort by the counts, most-first
  const leastAncestralFirst = sortBy(variables, (variable) => {
    const ancestorCount = ancestorEntitiesForEntityId(
      variable.entityId,
      entities
    ).length;
    return -ancestorCount;
  });

  // we don't care about ties, because the same-branch constraint means that
  // the two variables will be from the same entity if they have the same number of ancestors
  const variable = leastAncestralFirst[0];
  if (VariableDescriptor.is(variable)) {
    // Do a final check that all the input variables are all from ancestor entities of this leaf-most variable's entity.
    // Thus ensuring that they are indeed on the same branch.
    const ancestors = ancestorEntitiesForEntityId(variable.entityId, entities);

    if (
      variables.every(
        (v) =>
          isEqual(v, variable) || ancestors.find((e) => e.id === v.entityId)
      )
    )
      return variable;
    else
      throw new Error(
        'Error: variables not expected to be in different branches of entity diagram'
      );
  } else return undefined;
}

/**
 * given a list of query entities and full list of study entities
 * return the variable descriptor which is least ancestral (leaf-most)
 */

export function leastAncestralEntity(
  query: StudyEntity[],
  entities: StudyEntity[]
): StudyEntity | undefined {
  if (query.length === 0)
    throw new Error('Error: empty array passed to leastAncestralEntity');

  // The least ancestral node has the most ancestors, so let's count them.
  // And sort by the counts, most-first
  const leastAncestralFirst = sortBy(query, (queryEntity) => {
    const ancestorCount = entities.reduceRight((ancestors, entity) => {
      if (
        entity.id === queryEntity.id ||
        entity.children?.includes(ancestors[0])
      ) {
        ancestors.unshift(entity);
      }
      return ancestors;
    }, [] as StudyEntity[]).length;
    return -ancestorCount;
  });

  return leastAncestralFirst[0];
}
