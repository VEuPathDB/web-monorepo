import { removeStep, addStep } from 'wdk-client/Utils/StrategyUtils';
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

  describe('with a nested strategy root target', () => {
    //                   9
    //                   |
    //                   v
    //     8 -> 7   6 -> 5
    //          |        |
    //          v        v
    // 3 -----> 2 -----> 1
    const stepTree: StepTree = {
      stepId: 1,
      primaryInput: {
        stepId: 2,
        primaryInput: {
          stepId: 3
        },
        secondaryInput: {
          stepId: 7,
          primaryInput: {
            stepId: 8
          }
        }
      },
      secondaryInput: {
        stepId: 5,
        primaryInput: {
          stepId: 6
        },
        secondaryInput: {
          stepId: 9
        }
      }
    };

    it('should remove the entire nested strategy, if deleteSubtree is true', () => {
      //    8 -> 7
      //         |
      //         v
      // 3 ----> 2
      const resultStepTree1: StepTree = {
        stepId: 2,
        primaryInput: {
          stepId: 3
        },
        secondaryInput: {
          stepId: 7,
          primaryInput: {
            stepId: 8
          }
        }
      };
      expect(removeStep(stepTree, 5, true)).toEqual(resultStepTree1);

      //          9
      //          |
      //          v
      //     6 -> 5
      //          |
      //          v
      // 3 -----> 1
      const resultStepTree2: StepTree = {
        stepId: 1,
        primaryInput: {
          stepId: 3
        },
        secondaryInput: {
          stepId: 5,
          primaryInput: {
            stepId: 6
          },
          secondaryInput: {
            stepId: 9
          }
        }
      };
      expect(removeStep(stepTree, 7, true)).toEqual(resultStepTree2);
    });

    it('should preserve the other steps of the nested strategy, if deleteSubtree is false', () => {
      //     8 -> 7        6
      //          |        |
      //          v        v
      // 3 -----> 2 -----> 1
      const resultStepTree1: StepTree = {
        stepId: 1,
        primaryInput: {
          stepId: 2,
          primaryInput: {
            stepId: 3
          },
          secondaryInput: {
            stepId: 7,
            primaryInput: {
              stepId: 8
            }
          }
        },
        secondaryInput: {
          stepId: 6
        }
      };
      expect(removeStep(stepTree, 5, false)).toEqual(resultStepTree1);

      //                   9
      //                   |
      //                   v
      //          8   6 -> 5
      //          |        |
      //          v        v
      // 3 -----> 2 -----> 1
      const resultStepTree2: StepTree = {
        stepId: 1,
        primaryInput: {
          stepId: 2,
          primaryInput: {
            stepId: 3
          },
          secondaryInput: {
            stepId: 8
          }
        },
        secondaryInput: {
          stepId: 5,
          primaryInput: {
            stepId: 6
          },
          secondaryInput: {
            stepId: 9
          }
        }
      };
      expect(removeStep(stepTree, 7, false)).toEqual(resultStepTree2);

    });
  });
})

describe('addStep', () => {

  it('should return the same step tree structure, if an unknown step id is provided in the AddType', () => {
    const stepTree: StepTree = {
      stepId: 1
    }
    expect(addStep(stepTree, { type: 'append', stepId: 2 }, 3, { stepId: 4 })).toEqual(stepTree);
    expect(addStep(stepTree, { type: 'insert-before', stepId: 2 }, 3, { stepId: 4 })).toEqual(stepTree);
  });

  it('should insert a step between the append point and the append point\'s output, if trying to append a step to a non-head step', () => {
    //          5
    //          |
    //          v
    //     4 -> 3
    //          |
    //          v
    // 2 -----> 1    
    const stepTree: StepTree = {
      stepId: 1,
      primaryInput: {
        stepId: 2
      },
      secondaryInput: {
        stepId: 3,
        primaryInput: {
          stepId: 4
        },
        secondaryInput: {
          stepId: 5
        }
      }
    };

    //              5
    //              |
    //              v
    //      7  4 -> 3
    //      |       |
    //      v       v
    // 2 -> 6 ----> 1    
    const resultStepTree1: StepTree = {
      stepId: 1,
      primaryInput: {
        stepId: 6,
        primaryInput: {
          stepId: 2
        },
        secondaryInput: {
          stepId: 7
        }
      },
      secondaryInput: {
        stepId: 3,
        primaryInput: {
          stepId: 4
        },
        secondaryInput: {
          stepId: 5
        }
      }
    };
    expect(addStep(stepTree, { type: 'append', stepId: 2 }, 6, { stepId: 7 })).toEqual(resultStepTree1);

    //          7    5
    //          |    |
    //          v    v
    //     4 -> 6 -> 3
    //               |
    //               v
    // 2 ----------> 1    
    const resultStepTree2: StepTree = {
      stepId: 1,
      primaryInput: {
        stepId: 2
      },
      secondaryInput: {
        stepId: 3,
        primaryInput: {
          stepId: 6,
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
    };    
    expect(addStep(stepTree, { type: 'append', stepId: 4 }, 6, { stepId: 7 })).toEqual(resultStepTree2);
  });

  it('should return a step tree with a properly appended step, if trying to append a step to a head step', () => {
    //           5
    //           |
    //           v
    //      4 -> 3
    //           |
    //           v
    // 2 ------> 1        
    const stepTree: StepTree = {
      stepId: 1,
      primaryInput: {
        stepId: 2
      },
      secondaryInput: {
        stepId: 3,
        primaryInput: {
          stepId: 4
        },
        secondaryInput: {
          stepId: 5
        }
      }
    };

    //           5
    //           |
    //           v
    //      4 -> 3        7
    //           |        |
    //           v        v
    // 2 ------> 1 -----> 6      
    const resultStepTree1: StepTree = {
      stepId: 6,
      primaryInput: {
        stepId: 1,
        primaryInput: {
          stepId: 2
        },
        secondaryInput: {
          stepId: 3,
          primaryInput: {
            stepId: 4
          },
          secondaryInput: {
            stepId: 5
          }
        }        
      },
      secondaryInput: {
        stepId: 7
      }
    };
    expect(addStep(stepTree, { type: 'append', stepId: 1 }, 6, { stepId: 7 })).toEqual(resultStepTree1);
 
    //      5    7
    //      |    |
    //      v    v
    // 4 -> 3 -> 6
    //           | 
    //           v
    // 2 ------> 1   
    const resultStepTree2: StepTree = {
      stepId: 1,
      primaryInput: {
        stepId: 2
      },
      secondaryInput: {
        stepId: 6,
        primaryInput: {
          stepId: 3,
          primaryInput: {
            stepId: 4
          },
          secondaryInput: {
            stepId: 5
          }
        },
        secondaryInput: {
          stepId: 7
        }
      }
    };
    expect(addStep(stepTree, { type: 'append', stepId: 3 }, 6, { stepId: 7 })).toEqual(resultStepTree2);    

    //           7
    //           |
    //           v
    //      5 -> 6 
    //           |
    //           v
    //      4 -> 3
    //           |
    //           v
    // 2 ------> 1        
    const resultStepTree3: StepTree = {
      stepId: 1,
      primaryInput: {
        stepId: 2
      },
      secondaryInput: {
        stepId: 3,
        primaryInput: {
          stepId: 4
        },
        secondaryInput: {
          stepId: 6,
          primaryInput: {
            stepId: 5
          },
          secondaryInput: {
            stepId: 7
          }
        }
      }
    };
    expect(addStep(stepTree, { type: 'append', stepId: 5 }, 6, { stepId: 7 })).toEqual(resultStepTree3);    
  });

  it('should return a step tree with a properly inserted step, if trying to insert a step before Step >= 2', () => {
    //                     5
    //                     |
    //                     v
    //                4 -> 3
    //                     |
    //                     v
    // 6 ------> 2 ------> 1        
    const stepTree: StepTree = {
      stepId: 1,
      primaryInput: {
        stepId: 2,
        primaryInput: {
          stepId: 6
        }
      },
      secondaryInput: {
        stepId: 3,
        primaryInput: {
          stepId: 4
        },
        secondaryInput: {
          stepId: 5
        }
      }
    };

    //                       5
    //                       |
    //                       v
    //       8          4 -> 3
    //       |               |
    //       v               v
    // 6 --> 7 --> 2 ------> 1        
    const resultStepTree1: StepTree = {
      stepId: 1,
      primaryInput: {
        stepId: 2,
        primaryInput: {
          stepId: 7,
          primaryInput: {
            stepId: 6
          },
          secondaryInput: {
            stepId: 8
          }
        }
      },
      secondaryInput: {
        stepId: 3,
        primaryInput: {
          stepId: 4
        },
        secondaryInput: {
          stepId: 5
        }
      }
    };
    expect(addStep(stepTree, { type: 'insert-before', stepId: 2 }, 7, { stepId: 8 })).toEqual(resultStepTree1);   

    //                             5
    //                             |
    //                             v
    //                    8   4 -> 3
    //                    |        |
    //                    v        v
    // 6 ------> 2 -----> 7 -----> 1        
    const resultStepTree2: StepTree = {
      stepId: 1,
      primaryInput: {
        stepId: 7,
        primaryInput: {
          stepId: 2,
          primaryInput: {
            stepId: 6
          }
        },
        secondaryInput: {
          stepId: 8
        }
      },
      secondaryInput: {
        stepId: 3,
        primaryInput: {
          stepId: 4
        },
        secondaryInput: {
          stepId: 5
        }
      }
    };
    expect(addStep(stepTree, { type: 'insert-before', stepId: 1 }, 7, { stepId: 8 })).toEqual(resultStepTree2);
    
    //                     8    5
    //                     |    |
    //                     v    v
    //                4 -> 7 -> 3
    //                          |
    //                          v
    // 6 ------> 2 -----------> 1            
    const resultStepTree3: StepTree = {
      stepId: 1,
      primaryInput: {
        stepId: 2,
        primaryInput: {
          stepId: 6
        }
      },
      secondaryInput: {
        stepId: 3,
        primaryInput: {
          stepId: 7,
          primaryInput: {
            stepId: 4
          },
          secondaryInput: {
            stepId: 8
          }
        },
        secondaryInput: {
          stepId: 5
        }
      }
    };
    expect(addStep(stepTree, { type: 'insert-before', stepId: 3 }, 7, { stepId: 8 })).toEqual(resultStepTree3);
  });

  it('should return a step tree with a properly inserted step, if trying to insert a step before Step 1', () => {
    // 1
    const stepTree1: StepTree = {
      stepId: 1
    };

    //      1
    //      |
    //      v
    // 3 <- 2
    const resultStepTree1: StepTree = {
      stepId: 2,
      primaryInput: {
        stepId: 3
      },
      secondaryInput: {
        stepId: 1
      }
    };
    expect(addStep(stepTree1, { type: 'insert-before', stepId: 1 }, 2, { stepId: 3 })).toEqual(resultStepTree1);

    //                     5
    //                     |
    //                     v
    //                4 -> 3
    //                     |
    //                     v
    // 6 ------> 2 ------> 1        
    const stepTree2: StepTree = {
      stepId: 1,
      primaryInput: {
        stepId: 2,
        primaryInput: {
          stepId: 6
        }
      },
      secondaryInput: {
        stepId: 3,
        primaryInput: {
          stepId: 4
        },
        secondaryInput: {
          stepId: 5
        }
      }
    };

    //                               5
    //                               |
    //                               v
    //           6              4 -> 3
    //           |                   |
    //           V                   v
    // 8 ------> 7 ------> 2 ------> 1        
    const resultStepTree2: StepTree = {
      stepId: 1,
      primaryInput: {
        stepId: 2,
        primaryInput: {
          stepId: 7,
          primaryInput: {
            stepId: 8
          },
          secondaryInput: {
            stepId: 6
          }
        }
      },
      secondaryInput: {
        stepId: 3,
        primaryInput: {
          stepId: 4
        },
        secondaryInput: {
          stepId: 5
        }
      }
    };    
    expect(addStep(stepTree2, { type: 'insert-before', stepId: 6 }, 7, { stepId: 8 })).toEqual(resultStepTree2);

    //                4    5
    //                |    |
    //                v    v
    //           8 -> 7 -> 3
    //                     |
    //                     v
    // 6 ------> 2 ------> 1        
    const resultStepTree3: StepTree = {
      stepId: 1,
      primaryInput: {
        stepId: 2,
        primaryInput: {
          stepId: 6
        }
      },
      secondaryInput: {
        stepId: 3,
        primaryInput: {
          stepId: 7,
          primaryInput: {
            stepId: 8
          },
          secondaryInput: {
            stepId: 4
          }
        },
        secondaryInput: {
          stepId: 5
        }
      }
    };
    expect(addStep(stepTree2, { type: 'insert-before', stepId: 4 }, 7, { stepId: 8 })).toEqual(resultStepTree3);

    //                     5
    //                     |
    //                     v
    //                8 -> 7
    //                     |
    //                     v
    //                4 -> 3
    //                     |
    //                     v
    // 6 ------> 2 ------> 1        
    const resultStepTree4: StepTree = {
      stepId: 1,
      primaryInput: {
        stepId: 2,
        primaryInput: {
          stepId: 6
        }
      },
      secondaryInput: {
        stepId: 3,
        primaryInput: {
          stepId: 4
        },
        secondaryInput: {
          stepId: 7,
          primaryInput: {
            stepId: 8
          },
          secondaryInput: {
            stepId: 5
          }
        }
      }
    };
    expect(addStep(stepTree2, { type: 'insert-before', stepId: 5 }, 7, { stepId: 8 })).toEqual(resultStepTree4);
  });
});
