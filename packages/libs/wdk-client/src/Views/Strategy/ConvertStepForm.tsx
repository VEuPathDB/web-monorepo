import React, { useMemo } from 'react';

import { QuestionController } from 'wdk-client/Controllers';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { AddStepOperationFormProps } from 'wdk-client/Views/Strategy/AddStepPanel';

import 'wdk-client/Views/Strategy/ConvertStepForm.scss';

const cx = makeClassNameHelper('ConvertStepForm');

export const ConvertStepForm = ({
  addType,
  currentPage,
  inputRecordClass,
  questions,
  recordClasses,
  stepsCompletedNumber,
  strategy
}: AddStepOperationFormProps) => {
  const transformQuestion = useMemo(
    () => questions && questions.find(({ urlSegment }) => urlSegment === currentPage), 
    [ questions, currentPage ]
  );

  const outputRecordClassName = transformQuestion && transformQuestion.outputRecordClassName;

  const outputRecordClass = useMemo(
    () => recordClasses && recordClasses.find(({ urlSegment }) => urlSegment === outputRecordClassName),
    [ recordClasses, outputRecordClassName ]
  );

  return (
    <div className={cx()}>
      <div className={cx('--Header')}>
        <h2>
          {
            inputRecordClass.urlSegment === outputRecordClassName
              ? `Your ${inputRecordClass.shortDisplayNamePlural} from Step ${stepsCompletedNumber} will be converted by ${transformQuestion && transformQuestion.shortDisplayName}`
              : `Your ${inputRecordClass.shortDisplayNamePlural} from Step ${stepsCompletedNumber} will be converted into ${outputRecordClass && outputRecordClass.shortDisplayNamePlural}`
          }
        </h2>
      </div>
      <div className={cx('--Body')}>
        <QuestionController
          question={currentPage}
          recordClass={inputRecordClass.urlSegment}
          submissionMetadata={{
            type: 'add-unary-step',
            strategyId: strategy.strategyId,
            addType
          }}
        />
      </div>
    </div>
  );
};
