import { StepTree } from '../Utils/WdkUser';
import { AddType, PartialUiStepTree } from '../Views/Strategy/Types';

type SimilarTreesDiffResult =
  | { areSimilar: false }
  | { areSimilar: true; diffs: { oldStepId: number; newStepId: number }[] };

export const diffSimilarStepTrees = (
  oldTree: StepTree,
  newTree: StepTree
): SimilarTreesDiffResult => {
  const rootDiffs =
    oldTree.stepId === newTree.stepId
      ? []
      : [{ oldStepId: oldTree.stepId, newStepId: newTree.stepId }];

  const primaryInputDiffResult: SimilarTreesDiffResult =
    !oldTree.primaryInput && !newTree.primaryInput
      ? { areSimilar: true, diffs: [] }
      : oldTree.primaryInput && newTree.primaryInput
      ? diffSimilarStepTrees(oldTree.primaryInput, newTree.primaryInput)
      : { areSimilar: false };

  if (!primaryInputDiffResult.areSimilar) {
    return { areSimilar: false };
  }

  const secondaryInputDiffResult: SimilarTreesDiffResult =
    !oldTree.secondaryInput && !newTree.secondaryInput
      ? { areSimilar: true, diffs: [] }
      : oldTree.secondaryInput && newTree.secondaryInput
      ? diffSimilarStepTrees(oldTree.secondaryInput, newTree.secondaryInput)
      : { areSimilar: false };

  if (!secondaryInputDiffResult.areSimilar) {
    return { areSimilar: false };
  }

  return {
    areSimilar: true,
    diffs: [
      ...rootDiffs,
      ...primaryInputDiffResult.diffs,
      ...secondaryInputDiffResult.diffs,
    ],
  };
};

export const replaceStep = (
  stepTree: StepTree,
  oldStepId: number,
  newStepId: number
): StepTree =>
  stepTree.stepId === oldStepId
    ? {
        stepId: newStepId,
        primaryInput: stepTree.primaryInput,
        secondaryInput: stepTree.secondaryInput,
      }
    : {
        stepId: stepTree.stepId,
        primaryInput:
          stepTree.primaryInput &&
          replaceStep(stepTree.primaryInput, oldStepId, newStepId),
        secondaryInput:
          stepTree.secondaryInput &&
          replaceStep(stepTree.secondaryInput, oldStepId, newStepId),
      };

export const addStep = (
  stepTree: StepTree,
  addType: AddType,
  newStepId: number,
  newStepSecondaryInput: StepTree | undefined
): StepTree =>
  addType.type === 'append'
    ? append(stepTree, addType.stepId, newStepId, newStepSecondaryInput)
    : insertBefore(stepTree, addType.stepId, newStepId, newStepSecondaryInput);

type NodeMetadata =
  | { type: 'not-in-tree' }
  | { type: 'root'; node: StepTree }
  | { type: 'primary-input'; node: StepTree; parentNode: StepTree }
  | { type: 'secondary-input'; node: StepTree; parentNode: StepTree };

export const getNodeMetadata = (tree: StepTree, targetId: number) => {
  return findTarget(tree, undefined);

  function findTarget(node: StepTree, parentNode?: StepTree): NodeMetadata {
    if (node.stepId === targetId) {
      return !parentNode
        ? { type: 'root', node }
        : parentNode.primaryInput && parentNode.primaryInput.stepId === targetId
        ? { type: 'primary-input', node, parentNode }
        : { type: 'secondary-input', node, parentNode };
    }

    return [node.primaryInput, node.secondaryInput].reduce(
      (memo, childNode) =>
        childNode === undefined || memo.type !== 'not-in-tree'
          ? memo
          : findTarget(childNode, node),
      { type: 'not-in-tree' } as NodeMetadata
    );
  }
};

const append = (
  oldStepTree: StepTree,
  primaryStepId: number,
  newStepId: number,
  newStepSecondaryInput: StepTree | undefined
): StepTree => {
  const newStepTree = copyStepTree(oldStepTree);
  const primaryInput = getNodeMetadata(newStepTree, primaryStepId);

  if (primaryInput.type === 'not-in-tree') {
    // Trying to append to an absent node
    return newStepTree;
  } else if (primaryInput.type === 'primary-input') {
    // Trying to append to a node which is a primary input
    const newStepParentNode = primaryInput.parentNode;

    newStepParentNode.primaryInput = {
      stepId: newStepId,
      primaryInput: primaryInput.node,
      secondaryInput: newStepSecondaryInput,
    };

    return newStepTree;
  } else if (primaryInput.type === 'root') {
    // Appending to the root node of the "main" strategy

    return {
      stepId: newStepId,
      primaryInput: newStepTree,
      secondaryInput: newStepSecondaryInput,
    };
  } else {
    // Appending to the root node of a nested strategy
    const newStepParentNode = primaryInput.parentNode;

    newStepParentNode.secondaryInput = {
      stepId: newStepId,
      primaryInput: primaryInput.node,
      secondaryInput: newStepSecondaryInput,
    };

    return newStepTree;
  }
};

const insertBefore = (
  oldStepTree: StepTree,
  outputStepId: number,
  newStepId: number,
  newStepSecondaryInput: StepTree | undefined
): StepTree => {
  const newStepTree = copyStepTree(oldStepTree);
  const outputStep = getNodeMetadata(newStepTree, outputStepId);

  if (outputStep.type === 'not-in-tree') {
    // Trying to insert before an absent node

    return newStepTree;
  } else if (outputStep.node.primaryInput) {
    // Inserting before (client-side) Step >= 2
    outputStep.node.primaryInput = {
      stepId: newStepId,
      primaryInput: outputStep.node.primaryInput,
      secondaryInput: newStepSecondaryInput,
    };

    return newStepTree;
  } else if (outputStep.type === 'primary-input') {
    // Inserting before (client-side) Step 1 in a strategy with more than one leaf
    outputStep.parentNode.primaryInput = {
      stepId: newStepId,
      primaryInput: newStepSecondaryInput,
      secondaryInput: outputStep.node,
    };

    return newStepTree;
  } else if (outputStep.type === 'root') {
    // Inserting before (client-side) Step 1 in a one-leaf "main" streategy

    return {
      stepId: newStepId,
      primaryInput: newStepSecondaryInput,
      secondaryInput: outputStep.node,
    };
  } else {
    // Inserting before (client-side) Step 1 in a one-leaf nested strategy
    outputStep.parentNode.secondaryInput = {
      stepId: newStepId,
      primaryInput: newStepSecondaryInput,
      secondaryInput: outputStep.node,
    };

    return newStepTree;
  }
};

export const getOutputStep = (stepTree: StepTree, addType: AddType) => {
  if (addType.type === 'append') {
    const primaryInputMetadata = getNodeMetadata(stepTree, addType.stepId);

    return primaryInputMetadata.type === 'not-in-tree' ||
      primaryInputMetadata.type === 'root'
      ? undefined
      : primaryInputMetadata.parentNode;
  } else {
    const outputMetadata = getNodeMetadata(stepTree, addType.stepId);

    return outputMetadata.type === 'not-in-tree'
      ? undefined
      : outputMetadata.node;
  }
};

const copyStepTree = (stepTree: StepTree): StepTree => ({
  stepId: stepTree.stepId,
  primaryInput: stepTree.primaryInput && copyStepTree(stepTree.primaryInput),
  secondaryInput:
    stepTree.secondaryInput && copyStepTree(stepTree.secondaryInput),
});

export const getPreviousStep = (stepTree: StepTree, addType: AddType) => {
  if (addType.type === 'append') {
    return findSubtree(stepTree, addType.stepId);
  }

  const insertionPointSubtree = findSubtree(stepTree, addType.stepId);

  return insertionPointSubtree && insertionPointSubtree.primaryInput;
};

export const findSubtree = (
  stepTree: StepTree | undefined,
  targetStepId: number
): StepTree | undefined =>
  stepTree === undefined
    ? undefined
    : stepTree.stepId === targetStepId
    ? stepTree
    : findSubtree(stepTree.primaryInput, targetStepId) ||
      findSubtree(stepTree.secondaryInput, targetStepId);

export const findNestedStrategyRoot = (
  root: PartialUiStepTree,
  targetStepId: number
) => {
  return traverse(root, root);

  function traverse(
    node: PartialUiStepTree | undefined,
    currentNestedRoot: PartialUiStepTree
  ): PartialUiStepTree | undefined {
    return node == null
      ? undefined
      : node.step.id === targetStepId
      ? currentNestedRoot
      : node.secondaryInput == null
      ? traverse(node.primaryInput, currentNestedRoot)
      : traverse(node.primaryInput, currentNestedRoot) ||
        traverse(node.secondaryInput, node.secondaryInput);
  }
};

export const findSlotNumber = (
  root: PartialUiStepTree,
  targetStepId: number
): number => {
  return root.primaryInput == null || root.step.id === targetStepId
    ? root.slotNumber
    : findSlotNumber(root.primaryInput, targetStepId);
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

/**
 * Creates a new step tree with the target step and affected steps removed from
 * the step tree.
 *
 * Note that this function does not perform any validation on the resulting step
 * tree. It is expected that either: a) it has already been determined that the
 * removal of the target step is a valid operation, or b) that code downstream
 * of this function will handle invalid step trees.
 */
export const removeStep = (
  stepTree: StepTree,
  targetStepId: number,
  deleteSubtree: boolean = false
): StepTree | undefined => {
  return _recurse(stepTree);

  function _recurse(stepTree: StepTree | undefined): StepTree | undefined {
    if (stepTree == null) return stepTree;

    // Remove a step which the root of the stepTree
    // In this case, return its primary input
    if (stepTree.stepId === targetStepId) {
      return stepTree.primaryInput;
    }

    // Remove a step which is the secondary input of the stepTree's root
    if (
      stepTree.secondaryInput &&
      stepTree.secondaryInput.stepId === targetStepId
    ) {
      // If the target is a secondary leaf of stepTree's root, or deleteSubtree is true,
      // return the primary input of stepTree (that is, "delete every step of the nested strategy, not just the target")
      if (stepTree.secondaryInput.primaryInput == null || deleteSubtree) {
        return stepTree.primaryInput;
      }

      // Otherwise, replace the target with its primary input
      return {
        ...stepTree,
        secondaryInput: stepTree.secondaryInput.primaryInput,
      };
    }

    // Remove a step from non-head position of a strategy.
    // Replace the primary input for which it is the primary input with its primary input.
    if (
      stepTree.primaryInput != null &&
      (stepTree.primaryInput.stepId === targetStepId ||
        (stepTree.primaryInput.secondaryInput &&
          stepTree.primaryInput.secondaryInput.stepId === targetStepId &&
          deleteSubtree))
    ) {
      return stepTree.primaryInput.primaryInput == null
        ? stepTree.secondaryInput
        : {
            ...stepTree,
            primaryInput: stepTree.primaryInput.primaryInput,
          };
    }

    return {
      ...stepTree,
      primaryInput: _recurse(stepTree.primaryInput),
      secondaryInput: _recurse(stepTree.secondaryInput),
    };
  }
};

/**
 * Create a new copy of the provided stepTree, converting stepIds using
 * the provided mapStepId function.
 */
export function mapStepTreeIds(
  stepTree: StepTree,
  mapStepId: (stepId: number) => number
): StepTree {
  if (stepTree.primaryInput && stepTree.secondaryInput) {
    return {
      stepId: mapStepId(stepTree.stepId),
      primaryInput: mapStepTreeIds(stepTree.primaryInput, mapStepId),
      secondaryInput: mapStepTreeIds(stepTree.secondaryInput, mapStepId),
    };
  }
  if (stepTree.primaryInput) {
    return {
      stepId: mapStepId(stepTree.stepId),
      primaryInput: mapStepTreeIds(stepTree.primaryInput, mapStepId),
    };
  }
  return {
    stepId: mapStepId(stepTree.stepId),
  };
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
        ...getStepIds(stepTree.secondaryInput),
      ];
}
