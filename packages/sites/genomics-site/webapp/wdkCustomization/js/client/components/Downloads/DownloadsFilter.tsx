import { SubmissionMetadata } from '@veupathdb/wdk-client/lib/Actions/QuestionActions';
import { QuestionController } from '@veupathdb/wdk-client/lib/Controllers';
import { RootState } from '@veupathdb/wdk-client/lib/Core/State/Types';
import { SearchConfig } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { Props as FormProps } from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

interface Props {
  recordName: string;
  questionName: string;
  onChange: (searchConfig: SearchConfig) => void;
}

const submissionMetadata: SubmissionMetadata = {
  type: 'submit-custom-form',
  onStepSubmitted: () => {},
};

export function DownloadsFilter(props: Props) {
  const { recordName, questionName, onChange } = props;
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
    />
  );
}

function FormComponent(props: FormProps) {
  const { parameterElements } = props;
  return <>{Object.values(parameterElements)}</>;
}
