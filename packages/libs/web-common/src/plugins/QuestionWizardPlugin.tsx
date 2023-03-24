//@ts-nocheck
// QuestionWizardController makes weird errors come here
import React from 'react';
import QuestionWizardController from '../controllers/QuestionWizardController';
import { SubmissionMetadata } from '@veupathdb/wdk-client/lib/Actions/QuestionActions';

type Props = {
  searchName: string;
  submissionMetadata: SubmissionMetadata;
  submitButtonText?: string;
  shouldChangeDocumentTitle?: boolean;
  prepopulateWithLastParamValues?: boolean;
  recordClassName: string;
};

export default function QuestionWizardPlugin(props: Props) {
  return (
    <QuestionWizardController
      searchName={props.searchName}
      recordClassName={props.recordClassName}
      submissionMetadata={props.submissionMetadata}
      shouldChangeDocumentTitle={props.shouldChangeDocumentTitle}
      prepopulateWithLastParamValues={props.prepopulateWithLastParamValues}
      submitButtonText={props.submitButtonText}
    />
  );
}
