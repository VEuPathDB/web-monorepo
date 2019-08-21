import React, { useCallback, useMemo } from 'react';

import { omit, pick } from 'lodash';
import { BinaryOperation, defaultBinaryOperations, ReviseOperationFormProps } from 'wdk-client/Utils/Operations';
import { Props as FormProps } from 'wdk-client/Views/Question/DefaultQuestionForm';

import { ColocateStepMenu } from './ColocateStepMenu';
import { ColocateStepForm } from './ColocateStepForm';
import { SpanLogicForm } from '../questions/SpanLogicForm';
import { WdkService } from 'wdk-client/Core';
import { NewStepSpec } from 'wdk-client/Utils/WdkUser';
import { QuestionController } from 'wdk-client/Controllers';
import { SubmissionMetadata } from 'wdk-client/Actions/QuestionActions';
import { Plugin } from 'wdk-client/Utils/ClientPlugin';
import NotFound from 'wdk-client/Views/NotFound/NotFound';

const colocationQuestionSuffix = 'BySpanLogic';

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
        questions,
        step,
        strategy,
        primaryInputQuestion,
        primaryInputRecordClass,
        secondaryInputRecordClass,
        onClose,
        requestUpdateStepSearchConfig,
        requestReplaceStep
      }: ReviseOperationFormProps) => {
        const colocationQuestionPrimaryInput = useMemo(
          () => questions.find(
            ({ outputRecordClassName, urlSegment }) =>
              urlSegment.endsWith(colocationQuestionSuffix) &&
              outputRecordClassName === primaryInputRecordClass.urlSegment
            ),
          [ questions, primaryInputRecordClass, colocationQuestionSuffix ]
        );
      
        const colocationQuestionSecondaryInput = useMemo(
          () => questions.find(
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
      
          const searchName = shouldUsePrimaryInputQuestion
            ? colocationQuestionPrimaryInput.urlSegment
            : colocationQuestionSecondaryInput.urlSegment;

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
            requestReplaceStep(
              strategy.strategyId,
              step.id,
              {
                ...colocationStepSpec,
                searchName
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
            />,
          [ primaryInputRecordClass, secondaryInputRecordClass, typeChangeAllowed ]
        );

        return (
          !colocationQuestionPrimaryInput || !colocationQuestionSecondaryInput
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
                FormComponent: FormComponent
              }}
            />;
      }
    },
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
