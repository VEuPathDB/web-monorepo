import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import Path from 'path';

import { RestrictedPage } from '@veupathdb/web-common/lib/App/DataRestriction/RestrictedPage';
import { useApprovalStatus } from '@veupathdb/web-common/lib/hooks/dataRestriction';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';
import { AnalysisClient } from '../core';

interface Props {
  analysisClient: AnalysisClient;
  studyId: string;
  analysisId: string;
}

export function ImportAnalysis({ analysisClient, analysisId, studyId }: Props) {
  const approvalStatus = useApprovalStatus(studyId, 'analysis');
  const history = useHistory();
  useEffect(() => {
    if (approvalStatus !== 'approved') {
      return;
    }

    return Task.fromPromise(() => analysisClient.copyAnalysis(analysisId)).run(
      ({ analysisId: analysisCopyId }) => {
        const newLocation = {
          ...history.location,
          pathname: Path.join(
            history.location.pathname,
            '../../..',
            studyId,
            analysisCopyId
          ),
        };
        history.replace(newLocation);
      }
    );
  }, [analysisClient, history, studyId, analysisId, approvalStatus]);

  return (
    <RestrictedPage approvalStatus={approvalStatus}>
      <div style={{ fontSize: '3em' }}>Copying analysis...</div>
    </RestrictedPage>
  );
}
