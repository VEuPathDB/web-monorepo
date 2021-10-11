import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import Path from 'path';

import { RestrictedPage } from '@veupathdb/web-common/lib/App/DataRestriction/RestrictedPage';
import { useApprovalStatus } from '@veupathdb/web-common/lib/hooks/dataRestriction';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';
import { AnalysisClient } from '../core';

interface Props {
  analysisClient: AnalysisClient;
  studyId: string;
  analysisId: string;
  ownerUserId: string;
  description?: string;
}

export function ImportAnalysis({
  analysisClient,
  analysisId,
  ownerUserId,
  studyId,
  description,
}: Props) {
  const approvalStatus = useApprovalStatus(studyId, 'analysis');
  const history = useHistory();
  const [error, setError] = useState<string | undefined>();

  useSetDocumentTitle(
    error == null ? 'Importing Analysis' : 'Import Unsuccessful'
  );

  useEffect(() => {
    if (approvalStatus !== 'approved') {
      return;
    }

    return Task.fromPromise(() =>
      analysisClient.copyAnalysis(analysisId, Number(ownerUserId))
    )
      .chain(({ analysisId: analysisCopyId }) =>
        description == null
          ? Task.of(analysisCopyId)
          : Task.fromPromise(() =>
              analysisClient.updateAnalysis(analysisCopyId, { description })
            ).map((_) => analysisCopyId)
      )
      .run(
        (analysisCopyId) => {
          const newLocation = {
            ...history.location,
            pathname: Path.join(
              history.location.pathname,
              '../../../..',
              studyId,
              analysisCopyId
            ),
          };
          history.replace(newLocation);
        },
        (error) =>
          setError(error instanceof Error ? error.message : String(error))
      );
  }, [
    analysisClient,
    history,
    studyId,
    analysisId,
    ownerUserId,
    description,
    approvalStatus,
  ]);

  return (
    <RestrictedPage approvalStatus={approvalStatus}>
      <h1>{error == null ? 'Importing Analysis...' : 'Import Unsuccessful'}</h1>
      {error && <pre>{error}</pre>}
    </RestrictedPage>
  );
}
