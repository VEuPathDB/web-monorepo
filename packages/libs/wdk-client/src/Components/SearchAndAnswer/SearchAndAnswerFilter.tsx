import React, { useMemo } from 'react';
import { SubmissionMetadata } from '../../Actions/QuestionActions';
import { QuestionController } from '../../Controllers';
import {
  Props as FormProps,
  renderDefaultParamGroup,
} from '../../Views/Question/DefaultQuestionForm';
import { mapValues } from 'lodash';

interface Props {
  recordName: string;
  questionName: string;
  initialParamData: Record<string, string>;
  formComponent?: (props: FormProps) => JSX.Element;
}

const submissionMetadata: SubmissionMetadata = {
  type: 'submit-custom-form',
  onStepSubmitted: () => {},
};

export function SearchAndAnswerFilter(props: Props) {
  const { recordName, questionName, initialParamData, formComponent } = props;

  return (
    <QuestionController
      question={questionName}
      recordClass={recordName}
      submissionMetadata={submissionMetadata}
      FormComponent={formComponent ?? FormComponent}
      initialParamData={initialParamData}
      prepopulateWithLastParamValues
    />
  );
}

function FormComponent(props: FormProps) {
  const { state } = props;
  // Need to add `isSearchPage` prop so that organism prefs are used
  const parameterElements = useMemo(
    () =>
      mapValues(props.parameterElements, (parameterElement) => {
        return React.isValidElement(parameterElement)
          ? React.cloneElement(
              parameterElement,
              {
                pluginProps: {
                  ...parameterElement.props.pluginProps,
                  isSearchPage: true,
                },
              } as any,
              parameterElement.props.children
            )
          : parameterElement;
      }),
    [props.parameterElements]
  );

  const updatedProps = useMemo(
    () => ({ ...props, parameterElements }),
    [props, parameterElements]
  );

  return (
    <>
      {state.question.groups
        .filter((group) => group.displayType !== 'hidden')
        .map((group) => renderDefaultParamGroup(group, updatedProps))}
    </>
  );
}
