import { SubmissionMetadata } from '@veupathdb/wdk-client/lib/Actions/QuestionActions';
import { QuestionController } from '@veupathdb/wdk-client/lib/Controllers';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { SearchConfig } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import {
  Props as FormProps,
  renderDefaultParamGroup,
} from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';
import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { mapValues } from 'lodash';

interface Props {
  recordName: string;
  questionName: string;
  initialParamData: Record<string, string>;
  onChange: (searchConfig: SearchConfig) => void;
}

const submissionMetadata: SubmissionMetadata = {
  type: 'submit-custom-form',
  onStepSubmitted: () => {},
};

export function DownloadsFilter(props: Props) {
  const { recordName, questionName, initialParamData, onChange } = props;
  const paramValues = useSelector(
    (state: RootState) => state.question.questions[questionName]?.paramValues
  );
  useEffect(() => {
    if (paramValues) {
      onChange({
        parameters: paramValues,
      });
    }
  }, [paramValues, onChange]);

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
