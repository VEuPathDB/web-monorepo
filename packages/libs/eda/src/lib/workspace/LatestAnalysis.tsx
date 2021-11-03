import { orderBy } from 'lodash';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { RestrictedPage } from '@veupathdb/study-data-access/lib/data-restriction/RestrictedPage';
import { useApprovalStatus } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';
import { AnalysisClient } from '../core';

interface Props {
  analysisClient: AnalysisClient;
  studyId: string;
  replaceRegexp: RegExp;
}

export function LatestAnalysis(props: Props) {
  const { analysisClient, studyId, replaceRegexp } = props;
  const approvalStatus = useApprovalStatus(studyId, 'analysis');
  const history = useHistory();
  useEffect(() => {
    if (approvalStatus !== 'approved') {
      return;
    }

    return Task.fromPromise(() => analysisClient.getAnalyses())
      .map(
        (analyses) =>
          orderBy(
            analyses.filter((analysis) => analysis.studyId === studyId),
            (analysis) => analysis.modificationTime,
            ['desc']
          )[0]
      )
      .run((analysis) => {
        const id = analysis?.analysisId ?? 'new';
        const newLocation = {
          ...history.location,
          pathname: history.location.pathname.replace(replaceRegexp, id),
        };
        history.replace(newLocation);
      });
  }, [analysisClient, history, studyId, approvalStatus, replaceRegexp]);

  return (
    <RestrictedPage approvalStatus={approvalStatus}>
      <div style={{ fontSize: '3em' }}>Finding analysis...</div>
    </RestrictedPage>
  );
}
