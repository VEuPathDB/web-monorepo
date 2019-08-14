import { CustomBinaryOperation } from 'wdk-client/Utils/Operations';

import { ColocateStepMenu } from './ColocateStepMenu';
import { ColocateStepForm } from './ColocateStepForm';

export const apiCustomBinaryOperations: CustomBinaryOperation[] = [
  {
    name: 'colocate',
    AddStepMenuComponent: ColocateStepMenu,
    addStepFormComponents: {
      'colocate': ColocateStepForm
    },
    isOperation: step => step.searchName.endsWith('BySpanLogic'),
    operatorBaseClassName: 'SpanOperator'
  }
];
