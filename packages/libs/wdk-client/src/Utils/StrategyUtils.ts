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

const addStep = (
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
