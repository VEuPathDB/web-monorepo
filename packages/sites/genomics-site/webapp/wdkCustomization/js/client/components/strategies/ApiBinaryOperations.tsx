import * as React from 'react';

import { BinaryOperation, defaultBinaryOperations } from 'wdk-client/Utils/Operations';

import { ColocateStepMenu } from './ColocateStepMenu';
import { ColocateStepForm } from './ColocateStepForm';

export const apiBinaryOperations: BinaryOperation[] = [
  ...defaultBinaryOperations,
  {
    name: 'colocate',
    AddStepMenuComponent: ColocateStepMenu,
    addStepFormComponents: {
      'colocate': ColocateStepForm
    },
    isOperationSearchName: searchName => searchName.endsWith('BySpanLogic'),
    baseClassName: 'SpanOperator',
    needsParameterConfiguration: true,
    operatorParamName: 'span_operation',
    operatorMenuGroup: {
      name: 'span_operation',
      display: 'Revise as a span operation',
      items: [
        { 
          radioDisplay: <React.Fragment>A <strong>RELATIVE TO</strong> B, using genomic colocation</React.Fragment>,
          dropdownDisplay: 'colocated with',
          value: 'overlap'
        }
      ]
    }
  }
];
