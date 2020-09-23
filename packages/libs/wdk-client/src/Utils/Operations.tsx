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
import { PartialUiStepTree } from 'wdk-client/Views/Strategy/Types';
import { BOOLEAN_OPERATOR_PARAM_NAME, CombineOperator, IgnoreOperator } from 'wdk-client/Views/Strategy/StrategyUtils';
import { LeafPreview, BooleanPreview, TransformPreview } from 'wdk-client/Views/Strategy/StepBoxes';

type OperatorMenuItem = {
  radioDisplay: (stepALabel: ReactNode, stepBLabel: ReactNode) => ReactNode,
  value: string
}

type OperatorMenuGroup = {
  name: string,
  display: string,
  items: OperatorMenuItem[]
}

export type ReviseOperationFormProps = {
  uiStepTree: PartialUiStepTree,
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
  ) => boolean,
  AddStepHeaderComponent: React.ComponentType<{ inputRecordClass: RecordClass }>,
  AddStepNewInputComponent: React.ComponentType<{}>,
  AddStepNewOperationComponent: React.ComponentType<{}>
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
    operatorParamName: BOOLEAN_OPERATOR_PARAM_NAME,
    reviseOperatorParamConfiguration: { type: 'inline' },
    operatorMenuGroup: {
      name: 'standard_boolean_operators',
      display: 'Revise as a boolean operation',
      items: [
        {
          radioDisplay: (stepALabel, stepBLabel) =>
            <React.Fragment>{stepALabel} <strong>INTERSECT</strong> {stepBLabel}</React.Fragment>,
          value: CombineOperator.Intersect
        },
        {
          radioDisplay: (stepALabel, stepBLabel) =>
            <React.Fragment>{stepALabel} <strong>UNION</strong> {stepBLabel}</React.Fragment>,
          value: CombineOperator.Union
        },
        {
          radioDisplay: (stepALabel, stepBLabel) =>
            <React.Fragment>{stepALabel} <strong>MINUS</strong> {stepBLabel}</React.Fragment>,
          value: CombineOperator.LeftMinus
        },
        {
          radioDisplay: (stepALabel, stepBLabel) =>
            <React.Fragment>{stepBLabel} <strong>MINUS</strong> {stepALabel}</React.Fragment>,
          value: CombineOperator.RightMinus
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
      search.urlSegment.startsWith('boolean_question'),
    AddStepHeaderComponent: ({ inputRecordClass }) =>
      <React.Fragment>
        <strong>Combine</strong> with other {inputRecordClass.displayNamePlural}
      </React.Fragment>,
    AddStepNewInputComponent: LeafPreview,
    AddStepNewOperationComponent: BooleanPreview
  }
];

export const BinaryOperationsContext = React.createContext<BinaryOperation[]>(defaultBinaryOperations);

export const useBinaryOperations = () => useContext(BinaryOperationsContext);

export type AddStepMenuConfig = Pick<
  BinaryOperation,
  | 'name'
  | 'AddStepMenuComponent'
  | 'addStepFormComponents'
  | 'isCompatibleAddStepSearch'
  | 'AddStepHeaderComponent'
  | 'AddStepNewInputComponent'
  | 'AddStepNewOperationComponent'
>;

export type OperatorMetadata = {
  operatorName: string,
  searchName: string,
  baseClassName: string,
  paramName: string,
  paramValue: string,
  reviseOperatorParamConfiguration: ReviseOperationParameterConfiguration
};

export const useCompatibleOperatorMetadata = (questions: Question[] | undefined, uiStepTree: PartialUiStepTree): Record<string, OperatorMetadata> | undefined => {
  const { outputRecordClass, primaryInputRecordClass, secondaryInputRecordClass } = makeStepRecordClassNames(uiStepTree);

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
            ...(name === 'combine' ? [ 'LONLY', 'RONLY' ] : [])
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

const ignoreOperators = (stepALabel: string, stepBLabel: string): ReviseOperatorMenuItem[] => [
  {
    display: <React.Fragment><strong>IGNORE</strong> {stepBLabel}</React.Fragment>,
    value: IgnoreOperator.LeftOnly,
    iconClassName: cxOperator('--CombineOperator', 'LONLY')
  },
  {
    display: <React.Fragment><strong>IGNORE</strong> {stepALabel}</React.Fragment>,
    value: IgnoreOperator.RightOnly,
    iconClassName: cxOperator('--CombineOperator', 'RONLY')
  }
];

export const useReviseOperatorConfigs = (
  questions: Question[] | undefined, 
  uiStepTree: PartialUiStepTree,
) => {
  const { primaryInputRecordClass, secondaryInputRecordClass } = makeStepRecordClassNames(uiStepTree);

  const binaryOperations = useBinaryOperations();
  const operatorMetadata = useCompatibleOperatorMetadata(questions, uiStepTree);

  const stepALabel = `${uiStepTree.slotNumber - 1}`;
  const stepBLabel = `${uiStepTree.slotNumber}`;

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
                    display: menuItem.radioDisplay(stepALabel, stepBLabel),
                    iconClassName: cxOperator(`--${baseClassName}`, toUpper(menuItem.value)),
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
            items: ignoreOperators(stepALabel, stepBLabel)
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

const makeStepRecordClassNames = (uiStepTree: PartialUiStepTree) => {
  return {
    outputRecordClass: uiStepTree.step.recordClassName,
    primaryInputRecordClass: uiStepTree.primaryInput?.recordClass?.urlSegment,
    secondaryInputRecordClass: uiStepTree.secondaryInput?.recordClass?.urlSegment
  };
};

const toAddStepMenuConfig = pick<BinaryOperation, keyof AddStepMenuConfig>(
  [
    'name',
    'AddStepMenuComponent',
    'addStepFormComponents',
    'isCompatibleAddStepSearch',
    'AddStepHeaderComponent',
    'AddStepNewInputComponent',
    'AddStepNewOperationComponent'
  ]
);

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
    )(search),
  AddStepHeaderComponent: () =>
    <React.Fragment>
      <strong>Transform</strong> into related records
    </React.Fragment>,
  AddStepNewInputComponent: () => null,
  AddStepNewOperationComponent: TransformPreview
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

  const classNameModifier = toUpper(step.searchConfig.parameters[operatorParamName])

  return classNameModifier
    ? cxOperator(`--${baseClassName}`, classNameModifier)
    : cxOperator(`--${baseClassName}`);
};
