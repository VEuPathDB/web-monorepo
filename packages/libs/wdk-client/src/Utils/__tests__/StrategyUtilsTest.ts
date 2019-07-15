import { removeStep } from 'wdk-client/Utils/StrategyUtils';
import { StepTree } from 'wdk-client/Utils/WdkUser';

// NOTE:
// - *N* is calculated by adding the number of primary inputs, plus one (for the root step).
// - Step A is *upstream* of step B if A is an input to B, recursively.
// - Step A is *downstream* of step B if B is an input to A, recursively.
// - Step A is an *immediate upstream* step of B if A is a primary or secondary input to B.
// - Step A is an *immediate downstream* step of B if B is a primary of secondary input to A.

describe('removeStep', () => {

  describe('with a stepTree of any size', () => {
    it('should return the same step tree structure, if an unknown step id is provided', () => {
      const stepTree: StepTree = {
        stepId: 1
      }
      expect(removeStep(stepTree, 2)).toEqual(stepTree);
    });
    it('should return the primary input of the root step, if the root step is removed', () => {
      const stepTree: StepTree = {
        stepId: 1,
        primaryInput: {
          stepId: 2
        },
        secondaryInput: {
          stepId: 3
        }
      };
      expect(removeStep(stepTree, 1)).toEqual({stepId: 2});
    });
  })

  describe('with a stepTree of N=1', () => {
    it('should return undefined, if the single step is removed', () => {
      const stepTree: StepTree = {
        stepId: 1
      }
      expect(removeStep(stepTree, 1)).toBe(undefined);
    });
  })

  describe('with a stepTree of N=2', () => {
    it('should return a step tree with the secondary input of the root step as the new root step, if the second step is removed', () => {
      const stepTree: StepTree = {
        stepId: 1,
        primaryInput: { stepId: 2 },
        secondaryInput: { stepId: 3 }
      };
      expect(removeStep(stepTree, 2)).toEqual({ stepId: 3 });
    });
    it('should reutrn undefined, if the root step does not have a secondary input, and the second step is removed', () => {
      const stepTree: StepTree = {
        stepId: 1,
        primaryInput: {
          stepId: 2
        }
      };
      expect(removeStep(stepTree, 2)).toEqual(undefined);
    });
  })
  
  describe('with a stepTree of N>2', () => {
    it('should return a step tree with the primary input of the target step as the new primary input of the immediate downstream step of the target step', () => {

      //      7    6    5
      //      |    |    |
      //      v    v    v
      // 4 -> 3 -> 2 -> 1
      const stepTree = {
        stepId: 1,
        primaryInput: {
          stepId: 2,
          primaryInput: {
            stepId: 3,
            primaryInput: {
              stepId: 4
            },
            secondaryInput: {
              stepId: 7
            }
          },
          secondaryInput: { stepId: 6 }
        },
        secondaryInput: { stepId: 5 }
      };

      //      7    5
      //      |    |
      //      v    v
      // 4 -> 3 -> 1
      const resultStepTree1 = {
        stepId: 1,
        primaryInput: {
          stepId: 3,
          primaryInput: {
            stepId: 4
          },
          secondaryInput: {
            stepId: 7
          }
        },
        secondaryInput: {
          stepId: 5
        }
      }
      expect(removeStep(stepTree, 2)).toEqual(resultStepTree1);
      expect(removeStep(stepTree, 6)).toEqual(resultStepTree1);

      //      6    5
      //      |    |
      //      v    v
      // 4 -> 2 -> 1
      const resultStepTree2 = {
        stepId: 1,
        primaryInput: {
          stepId: 2,
          primaryInput: {
            stepId: 4
          },
          secondaryInput: {
            stepId: 6
          }
        },
        secondaryInput: {
          stepId: 5
        }
      }
      expect(removeStep(stepTree, 3)).toEqual(resultStepTree2);
      expect(removeStep(stepTree, 7)).toEqual(resultStepTree2);

      //      6    5
      //      |    |
      //      v    v
      // 7 -> 2 -> 1
      const resultStepTree3 = {
        stepId: 1,
        primaryInput: {
          stepId: 2,
          primaryInput: {
            stepId: 7,
          },
          secondaryInput: { stepId: 6 }
        },
        secondaryInput: { stepId: 5 }
      };
      expect(removeStep(stepTree, 4)).toEqual(resultStepTree3);

    });
  });
})
