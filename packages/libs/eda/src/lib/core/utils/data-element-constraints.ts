import { Seq } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import {
  mapStructure,
  preorder,
} from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { isEmpty, union } from 'lodash';
import { StudyEntity, VariableTreeNode } from '../types/study';
import { VariableDescriptor } from '../types/variable';
import { DataElementConstraint } from '../types/visualization';
import { findEntityAndVariable } from './study-metadata';

/**
 * Returns a new study entity tree with variables and entities removed that do
 * not satisfy the provided constraint.
 */
export function filterVariablesByConstraint(
  rootEntity: StudyEntity,
  constraint?: DataElementConstraint
): StudyEntity {
  if (
    constraint == null ||
    (constraint.allowedShapes == null &&
      constraint.allowedTypes == null &&
      constraint.maxNumValues == null &&
      constraint.allowMultiValued)
  )
    return rootEntity;
  return mapStructure(
    (entity, children) => ({
      ...entity,
      variables: entity.variables.filter((variable) =>
        variableConstraintPredicate(constraint, variable)
      ),
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
  constraint?: DataElementConstraint
): VariableDescriptor[] {
  if (constraint == null) return [];
  return Seq.from(preorder(rootEntity, (e) => e.children ?? []))
    .flatMap((e) =>
      e.variables
        .filter(
          (variable) => !variableConstraintPredicate(constraint, variable)
        )
        .map((v) => ({ entityId: e.id, variableId: v.id }))
    )
    .toArray();
}

/**
 * Tests if a variable satisfies a constraint
 */
function variableConstraintPredicate(
  constraint: DataElementConstraint,
  variable: VariableTreeNode
) {
  return (
    variable.dataShape == null ||
    variable.type === 'category' ||
    ((constraint.allowedShapes == null ||
      constraint.allowedShapes.includes(variable.dataShape)) &&
      (constraint.allowedTypes == null ||
        constraint.allowedTypes.includes(variable.type)) &&
      (constraint.maxNumValues == null ||
        constraint.maxNumValues >= variable.distinctValuesCount) &&
      (constraint.allowMultiValued || !variable.isMultiValued))
  );
}

export type ValueByInputName = Partial<Record<string, VariableDescriptor>>;
export type DataElementConstraintRecord = Record<string, DataElementConstraint>;

/**
 * Given an array of DataElementConstraint objects and a set of values, return
 * a unioned DataElementConstraint object that includes all of the rules for
 * which the provided values satisfy.
 *
 * example: one contraint allows string x number, the other date x string
 *
 * constraints = [ { xAxisVariable: { allowedTypes: ['string'] }, yAxisVariable: { allowedTypes: ['number'] } },
                   { xAxisVariable: { allowedTypes: ['date'] }, yAxisVariable: { allowedTypes: ['string'] } } ]
 *
 * If the user has already chosen a string-type xAxisVariable, the
 * constraints.filter() below will allow constraints[0] to pass but
 * will exclude constraints[1] because the already chosen string
 * x-variable is not a date. It won't even check the yAxisVariable of
 * constraint[1] because of the all-or-nothing nature of constraints.
 *
 * The constraints passed by the filter are merged into one.
 *
 * If no variable has been selected by the user, then the final merged constraint would be
 * { xAxisVariable: { allowedTypes: ['string','date'] }, yAxisVariable: { allowedTypes: ['number', 'string'] } }
 *
 */
export function flattenConstraints(
  values: ValueByInputName,
  entities: StudyEntity[],
  constraints: DataElementConstraintRecord[]
): DataElementConstraintRecord {
  // Find all compatible constraints
  const compatibleConstraints = constraints.filter((constraintRecord) =>
    Object.entries(constraintRecord).every(([variableName, constraint]) => {
      const value = values[variableName];
      // If a value (variable) has not been user-selected for this constraint, then it is considered to be "in-play"
      if (value == null) return true;
      // If a constraint does not declare shapes or types and it allows multivalued variables, then any value is allowed, thus the constraint is "in-play"
      if (
        isEmpty(constraint.allowedShapes) &&
        isEmpty(constraint.allowedTypes) &&
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
      const passesMaxValuesConstraint =
        constraint.maxNumValues === undefined ||
        constraint.maxNumValues >= variable.distinctValuesCount;
      const passesMultivalueConstraint =
        constraint.allowMultiValued || !variable.isMultiValued;
      return (
        typeIsValid &&
        shapeIsValid &&
        passesMaxValuesConstraint &&
        passesMultivalueConstraint
      );
    })
  );
  if (compatibleConstraints.length === 0)
    throw new Error(
      'flattenConstraints: Something went wrong. No compatible constraints were found for the current set of values.'
    );
  // Combine compatible constraints into a single constraint, concatenating
  // allowed shapes and types.
  return compatibleConstraints.reduce(
    mergeConstraints,
    {} as DataElementConstraintRecord
  );
}

export function mergeConstraints(
  constraintMapA: DataElementConstraintRecord,
  constraintMapB: DataElementConstraintRecord
): DataElementConstraintRecord {
  const keys = union(Object.keys(constraintMapA), Object.keys(constraintMapB));
  return Object.fromEntries(
    keys.map((key): [string, DataElementConstraint] => {
      const constraintA = constraintMapA[key];
      const constraintB = constraintMapB[key];
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
              maxNumValues: mergeMaxNumValues(constraintA, constraintB),
              allowMultiValued:
                constraintA.allowMultiValued && constraintB.allowMultiValued,
            },
      ];
    })
  );
}

//quess we could just let undef be reassigned to Infinity here?
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
