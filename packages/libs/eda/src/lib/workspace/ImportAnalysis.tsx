import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import Path from 'path';

import { RestrictedPage } from '@veupathdb/study-data-access/lib/data-restriction/RestrictedPage';
import { useApprovalStatus } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';
import { useSetDocumentTitle } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';

import { AnalysisClient } from '../core';
import { convertISOToDisplayFormat } from '../core/utils/date-conversion';

interface Props {
  analysisClient: AnalysisClient;
  studyId: string;
  analysisId: string;
  ownerUserId: string;
  ownerName?: string;
  description?: string;
}

export function ImportAnalysis({
  analysisClient,
  analysisId,
  ownerUserId,
  ownerName,
  description,
  studyId,
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

    const importDescription = makeImportDescription(ownerName, description);

    return Task.fromPromise(() =>
      analysisClient.copyAnalysis(analysisId, Number(ownerUserId))
    )
      .chain(({ analysisId: analysisCopyId }) =>
        Task.fromPromise(() =>
          analysisClient.updateAnalysis(analysisCopyId, {
            description: importDescription,
          })
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
    ownerName,
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

function makeImportDescription(ownerName?: string, description?: string) {
  return !description?.trim()
    ? makeImportMetadata(ownerName)
    : `${description}\n\n(${makeImportMetadata(ownerName)})`;
}

function makeImportMetadata(ownerName?: string) {
  const timestamp = convertISOToDisplayFormat(new Date().toISOString());

  return ownerName == null
    ? `Imported on ${timestamp}.`
    : `Imported from ${ownerName} on ${timestamp}.`;
}
