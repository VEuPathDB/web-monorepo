import { QuestionController } from '@veupathdb/wdk-client/lib/Controllers';
import { Plugin } from '@veupathdb/wdk-client/lib/Utils/ClientPlugin';

export function BlastWorkspaceNew() {
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
      }}
      defaultComponent={QuestionController}
    />
  );
}
