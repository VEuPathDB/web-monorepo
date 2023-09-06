import { mapValues } from 'lodash';
import React, { useMemo } from 'react';
import { SubmissionMetadata } from '@veupathdb/wdk-client/lib/Actions/QuestionActions';
import { QuestionController } from '@veupathdb/wdk-client/lib/Controllers';
import {
  Props as FormProps,
  renderDefaultParamGroup,
} from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';

interface Props {
  recordName: string;
  questionName: string;
  initialParamData: Record<string, string>;
}

const submissionMetadata: SubmissionMetadata = {
  type: 'submit-custom-form',
  onStepSubmitted: () => {},
};

export function DownloadsFilter(props: Props) {
  const { recordName, questionName, initialParamData } = props;

  return (
    <QuestionController
      question={questionName}
      recordClass={recordName}
      submissionMetadata={submissionMetadata}
      FormComponent={FormComponent}
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
              parameterElement.props.chilren
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
