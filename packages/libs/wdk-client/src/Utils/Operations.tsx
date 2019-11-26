import React, { ReactNode, useContext, useMemo, useCallback } from 'react';

import { pick, toUpper } from 'lodash/fp';

import { Question, RecordClass, SearchConfig } from 'wdk-client/Utils/WdkModel';
import { Step, StrategyDetails, NewStepSpec } from 'wdk-client/Utils/WdkUser';
import { AddStepOperationMenuProps, AddStepOperationFormProps } from 'wdk-client/Views/Strategy/AddStepPanel';
import { cxStepBoxes as cxOperator } from 'wdk-client/Views/Strategy/ClassNames';
import { ReviseOperatorMenuItem } from 'wdk-client/Views/Strategy/CombineStepDetails';
import { CombineStepMenu } from 'wdk-client/Views/Strategy/CombineStepMenu';
import { ConvertStepMenu, isValidTransformFactory } from 'wdk-client/Views/Strategy/ConvertStepMenu';
import { CombineStepForm } from 'wdk-client/Views/Strategy/CombineStepForm';
import { CombineWithStrategyForm } from 'wdk-client/Views/Strategy/CombineWithStrategyForm';
import { ConvertStepForm } from 'wdk-client/Views/Strategy/ConvertStepForm';

type OperatorMenuItem = {
  radioDisplay: ReactNode,
  value: string
}

type OperatorMenuGroup = {
  name: string,
  display: string,
  items: OperatorMenuItem[]
}

export type ReviseOperationFormProps = {
  searchName?: string,
  step: Step,
  strategy: StrategyDetails,
  primaryInputRecordClass?: RecordClass,
  primaryInputQuestion?: Question,
  secondaryInputRecordClass?: RecordClass
  secondaryInputQuestion?: Question,
  questions: Question[],
  onClose: () => void,
  requestUpdateStepSearchConfig: (strategyId: number, stepId: number, searchConfig: SearchConfig) => void,
  requestReplaceStep: (strategyId: number, stepId: number, newStepSpec: NewStepSpec) => void
};

export type ReviseOperationParameterConfiguration =
  | { type: 'form', FormComponent: React.ComponentType<ReviseOperationFormProps> }
  | { type: 'inline' };

export type BinaryOperation = {
  name: string,
  AddStepMenuComponent: React.ComponentType<AddStepOperationMenuProps>,
  addStepFormComponents: Record<string, React.ComponentType<AddStepOperationFormProps>>,
  isOperationSearchName: (searchName: string) => boolean,
  baseClassName: string,
  operatorParamName: string,
  reviseOperatorParamConfiguration: ReviseOperationParameterConfiguration,
  operatorMenuGroup: OperatorMenuGroup,
  isCompatibleAddStepSearch: (
    search: Question,
    questionsByUrlSegment: Record<string, Question>,
    recordClassesByUrlSegment: Record<string, RecordClass>,
    primaryOperandStep: Step,
    previousStep?: Step,
    outputStep?: Step
  ) => boolean
};

export const defaultBinaryOperations: BinaryOperation[] = [
  {
    name: 'combine',
    AddStepMenuComponent: CombineStepMenu,
    addStepFormComponents: {
      'combine-with-new-search': CombineStepForm,
      'combine-with-strategy': CombineWithStrategyForm
    },
    isOperationSearchName: searchName => searchName.startsWith('boolean_question'),
    baseClassName: 'CombineOperator',
    operatorParamName: 'bq_operator',
    reviseOperatorParamConfiguration: { type: 'inline' },
    operatorMenuGroup: {
      name: 'standard_boolean_operators',
      display: 'Revise as a boolean operation',
      items: [
        {
          radioDisplay: <React.Fragment>A <strong>INTERSECT</strong> B</React.Fragment>,
          value: '["INTERSECT"]'
        },
        {
          radioDisplay: <React.Fragment>A <strong>UNION</strong> B</React.Fragment>,
          value: '["UNION"]'
        },
        {
          radioDisplay: <React.Fragment>A <strong>MINUS</strong> B</React.Fragment>,
          value: '["MINUS"]'
        },
        {
          radioDisplay: <React.Fragment>B <strong>MINUS</strong> A</React.Fragment>,
          value: '["RMINUS"]'
        }
      ]
    },
    isCompatibleAddStepSearch: (
      search: Question,
      questionsByUrlSegment: Record<string, Question>,
      recordClassesByUrlSegment: Record<string, RecordClass>,
      primaryOperandStep: Step
    ) =>
      search.outputRecordClassName === primaryOperandStep.recordClassName &&
      search.urlSegment.startsWith('boolean_question')
  }
];

export const BinaryOperationsContext = React.createContext<BinaryOperation[]>(defaultBinaryOperations);

export const useBinaryOperations = () => useContext(BinaryOperationsContext);

type AddStepMenuConfig = Pick<BinaryOperation, 'name' | 'AddStepMenuComponent' | 'addStepFormComponents' | 'isCompatibleAddStepSearch'>;

export type OperatorMetadata = {
  operatorName: string,
  searchName: string,
  baseClassName: string,
  paramName: string,
  paramValue: string,
  reviseOperatorParamConfiguration: ReviseOperationParameterConfiguration
};

export const useCompatibleOperatorMetadata = (questions: Question[] | undefined, outputRecordClass: string | undefined, primaryInputRecordClass: string | undefined, secondaryInputRecordClass: string | undefined): Record<string, OperatorMetadata> | undefined => {
  const binaryOperations = useBinaryOperations();

  const compatibleOperatorMetadata = useMemo(
    () => {
      if (!questions) {
        return undefined;
      }

      const compatibleOperatorMetadata = binaryOperations.reduce(
        (memo, { name, isOperationSearchName, operatorParamName, baseClassName, operatorMenuGroup, reviseOperatorParamConfiguration }) => {
          const operationQuestion = questions.find(
            question =>
              isOperationSearchName(question.urlSegment) &&
              (
                (
                  !!primaryInputRecordClass &&
                  !!secondaryInputRecordClass &&
                  !!question.allowedPrimaryInputRecordClassNames &&
                  !!question.allowedSecondaryInputRecordClassNames &&
                  question.outputRecordClassName === outputRecordClass &&
                  question.allowedPrimaryInputRecordClassNames.includes(primaryInputRecordClass) &&
                  question.allowedSecondaryInputRecordClassNames.includes(secondaryInputRecordClass)
                )
              )
          );

          const parameterValues = [
            ...operatorMenuGroup.items.map(({ value }) => value),
            ...(name === 'combine' ? [ '["LONLY"]', '["RONLY"]' ] : [])
          ];

          const newMetadataEntries = operationQuestion && parameterValues.reduce(
            (memo, itemValue) => ({
              ...memo,
              [itemValue]: {
                operatorName: name,
                searchName: operationQuestion.urlSegment,
                paramName: operatorParamName,
                baseClassName,
                paramValue: itemValue,
                reviseOperatorParamConfiguration
              }
            }),
            {} as Record<string, OperatorMetadata>
          );

          return {
            ...memo,
            ...newMetadataEntries
          };
        },
        {} as Record<string, OperatorMetadata>
      );

      return compatibleOperatorMetadata;
    },
    [ binaryOperations, outputRecordClass, primaryInputRecordClass, secondaryInputRecordClass, questions ]
  );

  return compatibleOperatorMetadata;
};

export type ReviseOperatorMenuGroup = {
  name: string,
  display: string,
  items: ReviseOperatorMenuItem[]
}

const ignoreOperators: ReviseOperatorMenuItem[] = [
  { display: <React.Fragment><strong>IGNORE</strong> B</React.Fragment>, value: '["LONLY"]', iconClassName: cxOperator('--CombineOperator', 'LONLY') },
  { display: <React.Fragment><strong>IGNORE</strong> A</React.Fragment>, value: '["RONLY"]', iconClassName: cxOperator('--CombineOperator', 'RONLY') }
];

export const useReviseOperatorConfigs = (questions: Question[] | undefined, outputRecordClass: string | undefined, primaryInputRecordClass: string | undefined, secondaryInputRecordClass: string | undefined) => {
  const binaryOperations = useBinaryOperations();
  const operatorMetadata = useCompatibleOperatorMetadata(questions, outputRecordClass, primaryInputRecordClass, secondaryInputRecordClass);

  const reviseOperatorConfigsWithoutIgnore = useMemo(
    () => operatorMetadata && binaryOperations.reduce(
      (memo, { baseClassName, operatorMenuGroup }) => {
        return operatorMenuGroup.items.some(menuItem => !operatorMetadata[menuItem.value])
          ? memo
          : [
              ...memo,
              {
                name: operatorMenuGroup.name,
                display: operatorMenuGroup.display,
                items: operatorMenuGroup.items.map(
                  (menuItem) => ({
                    display: menuItem.radioDisplay,
                    iconClassName: cxOperator(`--${baseClassName}`, toUpper(JSON.parse(menuItem.value)[0])),
                    value: menuItem.value
                  })
                )
              }
          ]
      },
      [] as ReviseOperatorMenuGroup[]
    ),
    [ binaryOperations, operatorMetadata ]
  );

  const reviseOperatorConfigs = useMemo(
    () => !reviseOperatorConfigsWithoutIgnore
      ? undefined
      : primaryInputRecordClass !== secondaryInputRecordClass
      ? reviseOperatorConfigsWithoutIgnore
      : [
          ...reviseOperatorConfigsWithoutIgnore,
          {
            name: 'ignore_boolean_operators',
            display: 'Ignore one of the inputs',
            items: ignoreOperators
          }
        ],
    [
      reviseOperatorConfigsWithoutIgnore,
      ignoreOperators,
      primaryInputRecordClass,
      secondaryInputRecordClass
    ]
  );

  return reviseOperatorConfigs;
};

const toAddStepMenuConfig = pick<BinaryOperation, keyof AddStepMenuConfig>(['name', 'AddStepMenuComponent', 'addStepFormComponents', 'isCompatibleAddStepSearch']);

const convertConfig: AddStepMenuConfig = {
  name: 'convert',
  AddStepMenuComponent: ConvertStepMenu,
  addStepFormComponents: {
    'convert': ConvertStepForm
  },
  isCompatibleAddStepSearch: (
    search: Question,
    questionsByUrlSegment: Record<string, Question>,
    recordClassesByUrlSegment: Record<string, RecordClass>,
    primaryOperandStep: Step,
    previousStep?: Step,
    outputStep?: Step
  ) =>
    !!previousStep &&
    isValidTransformFactory(
      recordClassesByUrlSegment[previousStep.recordClassName],
      outputStep && questionsByUrlSegment[outputStep.recordClassName]
    )(search)
};

export const useAddStepMenuConfigs = (
  questionsByUrlSegment?: Record<string, Question>,
  recordClassesByUrlSegment?: Record<string, RecordClass>,
  primaryOperandStep?: Step,
  previousStep?: Step,
  outputStep?: Step
): AddStepMenuConfig[] | undefined => {
  const binaryOperations = useBinaryOperations();

  const menuConfigs = useMemo(
    () => questionsByUrlSegment && recordClassesByUrlSegment && primaryOperandStep && [
      ...binaryOperations.filter(({ name }) => name === 'combine').map(toAddStepMenuConfig),
      convertConfig,
      ...binaryOperations.filter(({ name }) => name !== 'combine').map(toAddStepMenuConfig)
    ].filter(
      ({ isCompatibleAddStepSearch }) =>
        Object.values(questionsByUrlSegment)
          .some(search => isCompatibleAddStepSearch(
            search,
            questionsByUrlSegment,
            recordClassesByUrlSegment,
            primaryOperandStep,
            previousStep,
            outputStep
          )
        )
    ),
    [
      binaryOperations,
      questionsByUrlSegment,
      recordClassesByUrlSegment,
      primaryOperandStep,
      previousStep,
      outputStep
    ]
  );

  return menuConfigs;
};

export const useSelectedAddStepFormComponent = (
  formName: string | undefined,
  questionsByUrlSegment?: Record<string, Question>,
  recordClassesByUrlSegment?: Record<string, RecordClass>,
  primaryOperandStep?: Step,
  previousStep?: Step,
  outputStep?: Step
): React.ComponentType<AddStepOperationFormProps> => {
  const menuConfigs = useAddStepMenuConfigs(
    questionsByUrlSegment,
    recordClassesByUrlSegment,
    primaryOperandStep,
    previousStep,
    outputStep
  );

  const operationFormsByName = useMemo(
    () => menuConfigs && menuConfigs.reduce(
      (memo, { addStepFormComponents }) => ({ ...memo, ...addStepFormComponents }),
      {} as Record<string, React.ComponentType<AddStepOperationFormProps>>
    ),
    [ menuConfigs ]
  );

  const DefaultFormComponent = useCallback(
    () => null,
    []
  );

  return (formName && operationFormsByName && operationFormsByName[formName]) || DefaultFormComponent;
};

export const useBinaryStepBoxClassName = (step: Step) => {
  const binaryOperations = useBinaryOperations();

  const binaryOperation = useMemo(
    () => binaryOperations.find(({ isOperationSearchName }) => isOperationSearchName(step.searchName)),
    [ binaryOperations, step ]
  );

  if (!binaryOperation) {
    return undefined;
  }

  const { baseClassName, operatorParamName } = binaryOperation;

  const classNameModifier = toUpper(JSON.parse(step.searchConfig.parameters[operatorParamName])[0])

  return classNameModifier
    ? cxOperator(`--${baseClassName}`, classNameModifier)
    : cxOperator(`--${baseClassName}`);
};
