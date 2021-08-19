import React, { useCallback, useMemo } from 'react';

import { BinaryOperation, defaultBinaryOperations, ReviseOperationFormProps } from '@veupathdb/wdk-client/lib/Utils/Operations';
import { Props as FormProps } from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';

import { ColocateStepMenu } from './ColocateStepMenu';
import { ColocateStepForm } from './ColocateStepForm';
import { SpanLogicForm } from '../questions/SpanLogicForm';
import { Loading } from '@veupathdb/wdk-client/lib/Components';
import { WdkService } from '@veupathdb/wdk-client/lib/Core';
import { NewStepSpec, Step } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { SubmissionMetadata } from '@veupathdb/wdk-client/lib/Actions/QuestionActions';
import { Plugin } from '@veupathdb/wdk-client/lib/Utils/ClientPlugin';
import { RecordClass, Question } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import NotFound from '@veupathdb/wdk-client/lib/Views/NotFound/NotFound';
import { cxStepBoxes } from '@veupathdb/wdk-client/lib/Views/Strategy/ClassNames';
import { LeafPreview, combinedPreviewFactory } from '@veupathdb/wdk-client/lib/Views/Strategy/StepBoxes';

import './ColocateStepBoxIcon.scss';

const ColocatePreview = combinedPreviewFactory(cxStepBoxes('--SpanOperator', 'OVERLAP'));

export const colocationQuestionSuffix = 'BySpanLogic';

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
    reviseOperatorParamConfiguration: {
      type: 'form',
      FormComponent: ({
        uiStepTree,
        questions,
        step,
        strategy,
        primaryInputRecordClass,
        secondaryInputRecordClass,
        onClose,
        requestUpdateStepSearchConfig,
        requestReplaceStep
      }: ReviseOperationFormProps) => {
        const colocationQuestionPrimaryInput = useMemo(
          () => primaryInputRecordClass && questions.find(
            ({ outputRecordClassName, urlSegment }) =>
              urlSegment.endsWith(colocationQuestionSuffix) &&
              outputRecordClassName === primaryInputRecordClass.urlSegment
            ),
          [ questions, primaryInputRecordClass, colocationQuestionSuffix ]
        );

        const colocationQuestionSecondaryInput = useMemo(
          () => secondaryInputRecordClass && questions.find(
            ({ outputRecordClassName, urlSegment }) =>
              urlSegment.endsWith(colocationQuestionSuffix) &&
              outputRecordClassName === secondaryInputRecordClass.urlSegment
            ),
          [ questions, secondaryInputRecordClass, colocationQuestionSuffix ]
        );

        const typeChangeAllowed = strategy.rootStepId === step.id;

        const onStepSubmitted = useCallback((wdkService: WdkService, colocationStepSpec: NewStepSpec) => {
          onClose();

          if (!colocationQuestionPrimaryInput || !colocationQuestionSecondaryInput) {
            throw new Error(`Could not find the necessary questions to perform span logic operation '${JSON.stringify(colocationStepSpec)}'`);
          }

          const shouldUsePrimaryInputQuestion = colocationStepSpec.searchConfig.parameters['span_output'] === 'a';

          const { urlSegment: searchName, shortDisplayName: customName } = shouldUsePrimaryInputQuestion
            ? colocationQuestionPrimaryInput
            : colocationQuestionSecondaryInput;

          if (step.searchName === searchName) {
            requestUpdateStepSearchConfig(
              strategy.strategyId,
              step.id,
              {
                ...step.searchConfig,
                parameters: colocationStepSpec.searchConfig.parameters
              }
            );
          } else {
            const { span_a, span_b, ...nonAnswerParams } = colocationStepSpec.searchConfig.parameters

            requestReplaceStep(
              strategy.strategyId,
              step.id,
              {
                ...colocationStepSpec,
                searchConfig: {
                  ...colocationStepSpec.searchConfig,
                  parameters: {
                    ...nonAnswerParams,
                    span_a: '',
                    span_b: ''
                  }
                },
                searchName,
                customName
              }
            )
          }
        }, [ colocationQuestionPrimaryInput, colocationQuestionSecondaryInput ]);

        const submissionMetadata = useMemo(
          () => ({
            type: 'submit-custom-form',
            stepId: step.searchName.endsWith(colocationQuestionSuffix) ? step.id : undefined,
            onStepSubmitted
          }) as SubmissionMetadata,
          [ onStepSubmitted ]
        );

        const FormComponent = useCallback(
          (props: FormProps) =>
            <SpanLogicForm
              {...props}
              currentStepRecordClass={primaryInputRecordClass}
              newStepRecordClass={secondaryInputRecordClass}
              insertingBeforeFirstStep={false}
              typeChangeAllowed={typeChangeAllowed}
              currentStepName={`Step ${uiStepTree.slotNumber - 1}`}
              newStepName={`Step ${uiStepTree.slotNumber}`}
            />,
          [ primaryInputRecordClass, secondaryInputRecordClass, typeChangeAllowed ]
        );

        return (
          !colocationQuestionPrimaryInput || !colocationQuestionSecondaryInput || !primaryInputRecordClass
        ) ? <NotFound />
          : <Plugin
              context={{
                type: 'questionController',
                searchName: colocationQuestionPrimaryInput.urlSegment,
                recordClassName: colocationQuestionPrimaryInput.outputRecordClassName
              }}
              pluginProps={{
                question: colocationQuestionPrimaryInput.urlSegment,
                recordClass: primaryInputRecordClass.urlSegment,
                submissionMetadata: submissionMetadata,
                FormComponent: FormComponent,
                submitButtonText: 'Revise'
              }}
              fallback={<Loading />}
            />;
      }
    },
    operatorParamName: 'span_operation',
    operatorMenuGroup: {
      name: 'span_operation',
      display: 'Revise as a span operation',
      items: [
        {
          radioDisplay: (stepALabel, stepBLabel) =>
            <React.Fragment>{stepALabel} <strong>RELATIVE TO</strong> {stepBLabel}, using genomic colocation</React.Fragment>,
          value: 'overlap'
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
      search.urlSegment.endsWith(colocationQuestionSuffix),
    AddStepHeaderComponent: () =>
      <React.Fragment>
        Use <strong>Genomic Colocation</strong> to combine with other features
      </React.Fragment>,
    AddStepNewInputComponent: LeafPreview,
    AddStepNewOperationComponent: ColocatePreview
  }
];
