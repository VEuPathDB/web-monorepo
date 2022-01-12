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

export type VariablesByInputName = Partial<Record<string, VariableDescriptor>>;
export type DataElementConstraintRecord = Record<string, DataElementConstraint>;

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
 * More exampels:
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
  inputVariables: VariablesByInputName,
  entities: StudyEntity[],
  constraints: DataElementConstraintRecord[],
  selectedVarReference: string // variable reference for which to determine constraints. Ex. xAxisVariable.
): DataElementConstraintRecord[] {
  // Collect applicable constraints based on all variables except the selected one selectedVarReference).
  const applicableConstraints = constraints.filter((constraintRecord) =>
    Object.entries(constraintRecord).every(
      ([variableReference, constraint]) => {
        const inputVariable = inputVariables[variableReference];
        // If the inputVariable has not been user-selected, then it is considered to be "in-play"
        if (inputVariable == null) return true;
        // Ignore constraints that are on this selectedVarReference
        if (selectedVarReference === variableReference) return true;
        // If a constraint does not declare shapes or types and it allows multivalued variables, then any value is allowed, thus the constraint is "in-play"
        if (
          isEmpty(constraint.allowedShapes) &&
          isEmpty(constraint.allowedTypes) &&
          constraint.maxNumValues === undefined &&
          constraint.allowMultiValued
        )
          return true;

        // Check that the value's associated variable has compatible characteristics
        const entityAndVariable = findEntityAndVariable(
          entities,
          inputVariable
        );
        if (entityAndVariable == null)
          throw new Error(
            `Could not find selected entity and variable: entityId = ${inputVariable.entityId}; variableId = ${inputVariable.variableId}.`
          );
        const { variable } = entityAndVariable;
        if (variable.type === 'category')
          throw new Error(
            'Categories are not allowed for variable constraints.'
          );
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
      }
    )
  );

  if (applicableConstraints.length === 0)
    throw new Error(
      'filterConstraints: Something went wrong. No compatible constraints were found for the current set of values.'
    );

  return applicableConstraints;
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
              // Since constraintA and constraintB are for the same variable slot
              // (value of `key` above) they should have the same description
              description: constraintA.description,
            },
      ];
    })
  );
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
