import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import Path from 'path';

import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';

import { AnalysisClient } from '../core';

interface Props {
  analysisClient: AnalysisClient;
  analysisId: string;
}

export function ImportAnalysis({ analysisClient, analysisId }: Props) {
  const history = useHistory();
  const [error, setError] = useState<string | undefined>();

  useSetDocumentTitle(
    error == null ? 'Importing Analysis' : 'Import Unsuccessful'
  );

  useEffect(() => {
    return Task.fromPromise(() => analysisClient.importAnalysis(analysisId))
      .chain(({ analysisId: analysisCopyId }) =>
        Task.fromPromise(() => analysisClient.getAnalysis(analysisCopyId)).map(
          ({ studyId }) => ({
            analysisCopyId,
            studyId,
          })
        )
      )
      .run(
        ({ analysisCopyId, studyId }) => {
          const newLocation = {
            ...history.location,
            pathname: Path.join(
              history.location.pathname,
              '../..',
              studyId,
              analysisCopyId
            ),
          };
          history.replace(newLocation);
        },
        (error) =>
          setError(error instanceof Error ? error.message : String(error))
      );
  }, [analysisClient, history, analysisId]);

  return (
    <div>
      <h1>{error == null ? 'Importing Analysis...' : 'Import Unsuccessful'}</h1>
      {error && <pre>{error}</pre>}
    </div>
  );
}
