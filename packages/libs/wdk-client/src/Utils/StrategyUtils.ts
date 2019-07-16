import { StepTree } from 'wdk-client/Utils/WdkUser';

export const addStep = (
  stepTree: StepTree,
  insertionPointStepId: number | undefined,
  newStepId: number,
  newStepSecondaryInput: StepTree | undefined
): StepTree => {
  if (insertionPointStepId === undefined) {
    // Appending a step to the "end" (root) of the step tree

    return {
      stepId: newStepId,
      primaryInput: stepTree,
      secondaryInput: newStepSecondaryInput
    };
  }

  const newStepTree = copyStepTree(stepTree);
  const [ insertionPoint, insertionPointParent ] = findInsertionPoint(newStepTree, insertionPointStepId);

  if (insertionPoint.primaryInput) {
    // Insert Before, Case #1: Inserting between two nodes on the primary branch
    
    insertionPoint.primaryInput = {
      stepId: newStepId,
      primaryInput: insertionPoint.primaryInput,
      secondaryInput: newStepSecondaryInput
    };
  } else if (insertionPointParent) {
    // Insert Before, Case #2: Inserting before (client-side) Step 1 in a step tree with more than one leaf

    insertionPointParent.primaryInput = {
      stepId: newStepId,
      primaryInput: newStepSecondaryInput,
      secondaryInput: insertionPoint
    };
  } else {
    // Insert Before, Case #3: Inserting before (client-side) Step 1 in a one-leaf step tree

    return {
      stepId: newStepId,
      primaryInput: newStepSecondaryInput,
      secondaryInput: insertionPoint
    };
  }

  return newStepTree;
};

const contains = (stepTree: StepTree | undefined, targetStepId: number): boolean =>
  stepTree === undefined
    ? false
    : stepTree.stepId === targetStepId
    ? true
    : contains(stepTree.primaryInput, targetStepId) || contains(stepTree.secondaryInput, targetStepId);

const findInsertionPoint = (stepTree: StepTree, targetStepId: number): [StepTree, StepTree | undefined] => {
  if (stepTree.stepId === targetStepId) {
    return [stepTree, undefined];
  }

  return traversePrimaryBranchForInsertionPoint(stepTree.primaryInput, stepTree);

  function traversePrimaryBranchForInsertionPoint(currentNode: StepTree | undefined, parentNode: StepTree): [StepTree, StepTree] {
    if (currentNode === undefined) {
      throw new Error(`Tried to insert a new step before step #${targetStepId}, but step #${targetStepId} does not appear in the tree`);
    }

    if (currentNode.stepId === targetStepId || contains(currentNode.secondaryInput, targetStepId)) {
      return [currentNode, parentNode];
    }

    return traversePrimaryBranchForInsertionPoint(currentNode.primaryInput, currentNode);
  }
}

export const findPreviousStepSubtree = (stepTree: StepTree, targetStepId: number): StepTree | undefined => {
  const [ insertionPointNode ] = findInsertionPoint(stepTree, targetStepId);

  return insertionPointNode.primaryInput;
};

export const findPrimaryBranchDepth = (stepTree: StepTree): number => {
  if (stepTree === undefined) {
    return -Infinity;
  }

  return traversePrimaryBranch(stepTree, 0);

  function traversePrimaryBranch(stepTree: StepTree, depth: number = 0): number {
    if (stepTree.primaryInput === undefined) {
      return depth;
    }

    return traversePrimaryBranch(stepTree.primaryInput, depth + 1);
  }
}

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
