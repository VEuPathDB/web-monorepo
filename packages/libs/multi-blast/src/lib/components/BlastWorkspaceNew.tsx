import { useCallback } from 'react';
import { RouteComponentProps, StaticContext } from 'react-router';

import { QuestionController } from '@veupathdb/wdk-client/lib/Controllers';
import { Plugin } from '@veupathdb/wdk-client/lib/Utils/ClientPlugin';
import { ParameterValues } from '@veupathdb/wdk-client/lib/Utils/WdkModel';
import { Props as FormProps } from '@veupathdb/wdk-client/lib/Views/Question/DefaultQuestionForm';

import { BlastForm } from './BlastForm';

export function BlastWorkspaceNew(
  props: RouteComponentProps<
    {},
    StaticContext,
    { parameterValues?: ParameterValues }
  >
) {
  const FormComponent = useCallback(
    (props: FormProps) => <BlastForm {...props} isMultiBlast />,
    []
  );

  return (
    <Plugin
      context={{
        type: 'questionController',
        recordClassName: 'transcript',
        searchName: 'GenesByMultiBlast',
      }}
      pluginProps={{
        question: 'GenesByMultiBlast',
        recordClass: 'transcript',
        submissionMetadata: {
          type: 'create-strategy',
        } as const,
        shouldChangeDocumentTitle: false,
        autoRun: false,
        prepopulateWithLastParamValues: false,
        submitButtonText: 'BLAST',
        initialParamData: props.location?.state?.parameterValues ?? undefined,
        FormComponent,
      }}
      defaultComponent={QuestionController}
    />
  );
}
