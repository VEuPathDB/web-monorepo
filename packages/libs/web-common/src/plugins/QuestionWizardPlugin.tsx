import React from 'react';
import QuestionWizardController from 'ebrc-client/controllers/QuestionWizardController';
import { SubmissionMetadata } from 'wdk-client/Actions/QuestionActions';

interface Props {
  searchName: string;
  submissionMetadata: SubmissionMetadata;
}

export default function QuestionWizardPlugin(props: Props) {
  return (
    <QuestionWizardController
      questionName={props.searchName}
      submissionMetadata={props.submissionMetadata}
    />
  );
}
