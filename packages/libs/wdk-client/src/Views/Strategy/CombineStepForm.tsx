import React from 'react';

import { AddStepOperationFormProps } from 'wdk-client/Views/Strategy/AddStepPanel';
import { QuestionController } from 'wdk-client/Controllers';

export const CombineStepForm = ({
  currentPage,
  recordClass
}: AddStepOperationFormProps) => (
  <QuestionController
    question={currentPage}
    recordClass={recordClass.urlSegment}
  />
);