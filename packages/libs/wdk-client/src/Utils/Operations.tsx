import React, { useContext, useMemo, useCallback } from 'react';

import { pick, toUpper } from 'lodash/fp';

import { Step } from 'wdk-client/Utils/WdkUser';
import { AddStepOperationMenuProps, AddStepOperationFormProps } from 'wdk-client/Views/Strategy/AddStepPanel';
import { CombineStepMenu } from 'wdk-client/Views/Strategy/CombineStepMenu';
import { ConvertStepMenu } from 'wdk-client/Views/Strategy/ConvertStepMenu';
import { CombineStepForm } from 'wdk-client/Views/Strategy/CombineStepForm';
import { CombineWithStrategyForm } from 'wdk-client/Views/Strategy/CombineWithStrategyForm';
import { ConvertStepForm } from 'wdk-client/Views/Strategy/ConvertStepForm';

import { cxStepBoxes as cxOperator } from 'wdk-client/Views/Strategy/ClassNames';

type CustomBinaryOperation = {
  name: string,
  AddStepMenuComponent: React.ComponentType<AddStepOperationMenuProps>,
  addStepFormComponents: Record<string, React.ComponentType<AddStepOperationFormProps>>,
  isOperation: (step: Step) => boolean,
  operatorBaseClassName: string,
  operatorParamName?: string
};

export const defaultCustomBinaryOperations = [];

export const CustomBinaryOperationsContext = React.createContext<CustomBinaryOperation[]>(defaultCustomBinaryOperations);

type AddStepMenuConfig = Pick<CustomBinaryOperation, 'name' | 'AddStepMenuComponent' | 'addStepFormComponents'>;

const defaultAddStepMenuConfigs: AddStepMenuConfig[] = [
  {
    name: 'combine',
    AddStepMenuComponent: CombineStepMenu,
    addStepFormComponents: {
      'combine-with-new-search': CombineStepForm,
      'combine-with-strategy': CombineWithStrategyForm
    }
  },
  {
    name: 'convert',
    AddStepMenuComponent: ConvertStepMenu,
    addStepFormComponents: {
      'convert': ConvertStepForm
    }
  }
];

export const useAddStepMenuConfigs = (): AddStepMenuConfig[] => {
  const customBinaryOperations = useContext(CustomBinaryOperationsContext);
  const menuConfigs = useMemo(
    () => [
      ...defaultAddStepMenuConfigs,
      ...customBinaryOperations.map(pick(['name', 'AddStepMenuComponent', 'addStepFormComponents']))
    ],
    [ customBinaryOperations ]
  );

  return menuConfigs;
};

export const useSelectedFormComponent = (formName: string | undefined): React.ComponentType<AddStepOperationFormProps> => {
  const menuConfigs = useAddStepMenuConfigs();
  const operationFormsByName = useMemo(
    () => menuConfigs.reduce(
      (memo, { addStepFormComponents }) => ({ ...memo, ...addStepFormComponents }), 
      {} as Record<string, React.ComponentType<AddStepOperationFormProps>>
    ),
    [ menuConfigs ]
  );

  const DefaultFormComponent = useCallback(
    () => null, 
    []
  );

  return (formName && operationFormsByName[formName]) || DefaultFormComponent;
};

export const useBinaryOperatorClassName = (step: Step) => {
  const customBinaryOperations = useContext(CustomBinaryOperationsContext);
  
  const customBinaryOperation = useMemo(
    () => customBinaryOperations.find(({ isOperation }) => isOperation(step)),
    [ customBinaryOperations, step ]
  );
  
  const { operatorBaseClassName, operatorParamName } = customBinaryOperation || {
    operatorBaseClassName: 'CombineOperator',
    operatorParamName: 'bq_operator'
  };

  const classNameModifier = operatorParamName
    ? toUpper(step.searchConfig.parameters[operatorParamName])
    : undefined;

  return classNameModifier
    ? cxOperator(`--${operatorBaseClassName}`, classNameModifier)
    : cxOperator(`--${operatorBaseClassName}`);
};
