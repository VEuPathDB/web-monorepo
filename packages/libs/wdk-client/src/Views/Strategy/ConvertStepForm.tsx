import React, { useMemo } from 'react';

import { SubmissionMetadata } from 'wdk-client/Actions/QuestionActions';
import { Loading } from 'wdk-client/Components';
import { Plugin } from 'wdk-client/Utils/ClientPlugin';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import { AddStepOperationFormProps } from 'wdk-client/Views/Strategy/AddStepPanel';

import 'wdk-client/Views/Strategy/ConvertStepForm.scss';

const cx = makeClassNameHelper('ConvertStepForm');

export const ConvertStepForm = ({
  addType,
  currentPage,
  inputRecordClass,
  questionsByUrlSegment,
  recordClassesByUrlSegment,
  stepsCompletedNumber,
  strategy
}: AddStepOperationFormProps) => {
  const transformQuestion = questionsByUrlSegment[currentPage];
  const outputRecordClassName = transformQuestion && transformQuestion.outputRecordClassName;
  const outputRecordClass = recordClassesByUrlSegment[outputRecordClassName];

  const submissionMetadata: SubmissionMetadata = useMemo(
    () => ({
      type: 'add-unary-step',
      strategyId: strategy.strategyId,
      addType
    }),
    [strategy.strategyId]
  );

  return (
    <div className={cx()}>
      <div className={cx('--Header')}>
        <h2>
          {
            inputRecordClass.urlSegment === outputRecordClassName
              ? `Your ${inputRecordClass.shortDisplayNamePlural} from Step ${stepsCompletedNumber} will be converted into ${transformQuestion && transformQuestion.shortDisplayName}`
              : `Your ${inputRecordClass.shortDisplayNamePlural} from Step ${stepsCompletedNumber} will be converted into ${outputRecordClass && outputRecordClass.shortDisplayNamePlural}`
          }
        </h2>
      </div>
      <div className={cx('--Body')}>
        <Plugin
          context={{
            type: 'questionController',
            searchName: currentPage,
            recordClassName: inputRecordClass.urlSegment
          }}
          pluginProps={{
            question: currentPage,
            recordClass: inputRecordClass.urlSegment,
            submissionMetadata
          }}
          fallback={<Loading />}
        />
      </div>
    </div>
  );
};
