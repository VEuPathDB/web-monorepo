import { SubmissionMetadata } from '@veupathdb/wdk-client/lib/Actions/QuestionActions';
import {
  QuestionController,
  ResultTableSummaryViewController,
} from '@veupathdb/wdk-client/lib/Controllers';
import { ResultType } from '@veupathdb/wdk-client/lib/Utils/WdkResult';
import { NewStepSpec } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import React, { useMemo, useState } from 'react';

const RECORD_NAME = 'dfile';
const QUESTION_NAME = 'GetAllFileRecords';

export function Downloads() {
  const [resultType, setResultType] = useState<ResultType>();

  const submissionMetadata: SubmissionMetadata = useMemo(
    () => ({
      type: 'submit-custom-form',
      onStepSubmitted: (wdkService, submissionSpec) => {
        setResultType({
          type: 'answerSpec',
          displayName: 'Download Files',
          answerSpec: {
            searchName: submissionSpec.searchName,
            searchConfig: submissionSpec.searchConfig,
          },
        });
      },
    }),
    []
  );

  return (
    <div>
      <h1>Downloads Page</h1>
      <QuestionController
        question={QUESTION_NAME}
        recordClass={RECORD_NAME}
        submissionMetadata={submissionMetadata}
      />
      {resultType && (
        <ResultTableSummaryViewController
          viewId="DownloadPage"
          resultType={resultType}
        />
      )}
    </div>
  );
}
