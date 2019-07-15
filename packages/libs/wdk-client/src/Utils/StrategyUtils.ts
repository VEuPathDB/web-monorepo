import { StepTree } from 'wdk-client/Utils/WdkUser';

export const appendStep = (
  stepTree: StepTree,
  newStepId: number,
  newStepSecondaryInput: StepTree
) => addStep(
  stepTree,
  undefined,
  newStepId,
  newStepSecondaryInput
);

export const insertStepBefore = (
  stepTree: StepTree,
  insertionBeforeStepId: number,
  newStepId: number,
  newStepSecondaryInput: StepTree
) => addStep(
  stepTree,
  insertionBeforeStepId,
  newStepId,
  newStepSecondaryInput
);

export const addStep = (
  stepTree: StepTree,
  insertionPointStepId: number | undefined,
  newStepId: number,
  newStepSecondaryInput: StepTree | undefined
): StepTree => {
  if (insertionPointStepId === undefined) {
    return {
      stepId: newStepId,
      primaryInput: stepTree,
      secondaryInput: newStepSecondaryInput
    };
  }

  const newStepTree = copyStepTree(stepTree);

  const insertionPointNode = findInsertionPoint(newStepTree, insertionPointStepId);

  if (insertionPointNode === undefined) {
    return newStepTree;
  }

  insertionPointNode.primaryInput = {
    stepId: newStepId,
    primaryInput: insertionPointNode.primaryInput,
    secondaryInput: newStepSecondaryInput
  };

  return newStepTree;
};

const findInsertionPoint = (stepTree: StepTree | undefined, targetStepId: number): StepTree | undefined => (
  stepTree === undefined ||
  stepTree.stepId === targetStepId ||
  (
    stepTree.secondaryInput !== undefined &&
    stepTree.secondaryInput.stepId === targetStepId
  )
)
  ? stepTree
  : findInsertionPoint(stepTree.primaryInput, targetStepId);

const copyStepTree = (stepTree: StepTree): StepTree => ({
  stepId: stepTree.stepId,
  primaryInput: !stepTree.primaryInput
    ? undefined 
    : copyStepTree(stepTree.primaryInput),
  secondaryInput: !stepTree.secondaryInput
    ? undefined
    : copyStepTree(stepTree.secondaryInput)
});

/**
 * Creates a new step tree with the target step and affected steps removed from
 * the step tree.
 * 
 * Note that this function does not perform any validation on the resulting step
 * tree. It is expected that either: a) it has already been determined that the
 * removal of the target step is a valid operation, or b) that code downstream
 * of this function will handle invalid step trees.
 */
export const removeStep = (stepTree: StepTree, targetStepId: number): StepTree | undefined => {
  return _recurse(stepTree);

  function _recurse(stepTree: StepTree | undefined): StepTree | undefined {
    if (stepTree == null) return stepTree;

    // Remove a step from head position if a strategy (e.g., a root step)
    // Return its primary input
    if (
      stepTree.stepId === targetStepId ||
      (stepTree.secondaryInput && stepTree.secondaryInput.stepId === targetStepId)
    ) {
      return stepTree.primaryInput;
    }
    
    // Remove a step from non-head position of a strategy.
    // Replace the primary input for which it is the primary input with its primary input.
    if (
      stepTree.primaryInput != null &&
      (
        (stepTree.primaryInput.stepId === targetStepId) ||
        (stepTree.primaryInput.secondaryInput && stepTree.primaryInput.secondaryInput.stepId === targetStepId)
      )
    ) {

      return stepTree.primaryInput.primaryInput == null
        ? stepTree.secondaryInput
        : {
          ...stepTree,
          primaryInput: stepTree.primaryInput.primaryInput
        };
    }

    return {
      ...stepTree,
      primaryInput: _recurse(stepTree.primaryInput),
      secondaryInput: _recurse(stepTree.secondaryInput)
    }
  }
}

/**
 * Creates an iterable of step IDs in a step tree.
 */
export function getStepIds(stepTree: StepTree | undefined): Array<number> {
  return stepTree == null
    ? []
    : [
      stepTree.stepId,
      ...getStepIds(stepTree.primaryInput),
      ...getStepIds(stepTree.secondaryInput)
    ];
}
