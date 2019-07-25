import { StepTree, Step } from 'wdk-client/Utils/WdkUser';
import { AddType } from 'wdk-client/Views/Strategy/Types';

export const addStep = (
  stepTree: StepTree,
  addType: AddType,
  newStepId: number,
  newStepSecondaryInput: StepTree | undefined
): StepTree => {
  if (addType.type === 'append') {
    if (stepTree.stepId === addType.primaryInputStepId) {
      // Append, Case #1: Appending to the root node of the main step tree

      return {
        stepId: newStepId,
        primaryInput: stepTree,
        secondaryInput: newStepSecondaryInput
      };
    } else {
      // Append, Case #2: Appending to the root node of a nested step tree
      // TODO Also need to change associated expandedName

      const newStepTree = copyStepTree(stepTree);
      const appendPoint = findAppendPoint(newStepTree, addType.primaryInputStepId);

      appendPoint.primaryInput = {
        stepId: newStepId,
        primaryInput: appendPoint.primaryInput,
        secondaryInput: newStepSecondaryInput
      };

      return newStepTree;
    }
  }

  const newStepTree = copyStepTree(stepTree);
  const [ insertionPoint, insertionPointParent ] = findInsertionPoint(newStepTree, addType.outputStepId);

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

export const findSubtree = (stepTree: StepTree | undefined, targetStepId: number): StepTree | undefined => 
  stepTree === undefined
    ? undefined
    : stepTree.stepId === targetStepId
    ? stepTree
    : findSubtree(stepTree.primaryInput, targetStepId) || findSubtree(stepTree.secondaryInput, targetStepId);

const contains = (stepTree: StepTree | undefined, targetStepId: number) => !!findSubtree(stepTree, targetStepId);

export const findAppendPoint = (stepTree: StepTree, primaryInputStepId: number): StepTree => {
  if (stepTree.primaryInput === undefined) {
    throw new Error(`Tried to insert a step after step #${primaryInputStepId}, but step #${primaryInputStepId} does not appear in the tree`);
  }

  return stepTree.primaryInput.stepId === primaryInputStepId || contains(stepTree.primaryInput.secondaryInput, primaryInputStepId)
    ? stepTree
    : findAppendPoint(stepTree.primaryInput, primaryInputStepId);
};

const findInsertionPoint = (stepTree: StepTree, targetStepId: number): [StepTree, StepTree | undefined] => {
  if (stepTree.stepId === targetStepId) {
    return [stepTree, undefined];
  }

  return traversePrimaryBranchForInsertionPoint(stepTree.primaryInput, stepTree);

  function traversePrimaryBranchForInsertionPoint(currentNode: StepTree | undefined, parentNode: StepTree): [StepTree, StepTree] {
    if (currentNode === undefined) {
      throw new Error(`Tried to insert a new step before step #${targetStepId}, but step #${targetStepId} does not appear in the tree`);
    }

    return currentNode.stepId === targetStepId || contains(currentNode.secondaryInput, targetStepId)
      ? [currentNode, parentNode]
      : traversePrimaryBranchForInsertionPoint(currentNode.primaryInput, currentNode);
  }
};

export const findPrimaryBranchHeight = (stepTree: StepTree): number => {
  return traversePrimaryBranch(stepTree, 0);

  function traversePrimaryBranch(stepTree: StepTree, height: number): number {
    if (stepTree.primaryInput === undefined) {
      return height;
    }

    return traversePrimaryBranch(stepTree.primaryInput, height + 1);
  }
};

export const findPrimaryBranchLeaf = (stepTree: StepTree): StepTree =>
  stepTree.primaryInput === undefined
    ? stepTree
    : findPrimaryBranchLeaf(stepTree.primaryInput);

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
