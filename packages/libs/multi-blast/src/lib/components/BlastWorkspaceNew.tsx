import { RouteComponentProps, StaticContext } from 'react-router';

import { QuestionController } from '@veupathdb/wdk-client/lib/Controllers';
import { Plugin } from '@veupathdb/wdk-client/lib/Utils/ClientPlugin';
import { ParameterValues } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

export function BlastWorkspaceNew(
  props: RouteComponentProps<{}, StaticContext, ParameterValues | undefined>
) {
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
        initialParamData: props.location.state ?? undefined,
      }}
      defaultComponent={QuestionController}
    />
  );
}
