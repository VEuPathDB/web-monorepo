import { orderBy } from 'lodash';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { RestrictedPage } from '@veupathdb/web-common/lib/App/DataRestriction/RestrictedPage';
import { useApprovalStatus } from '@veupathdb/web-common/lib/hooks/dataRestriction';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';
import { AnalysisClient } from '../core';

interface Props {
  analysisClient: AnalysisClient;
  studyId: string;
}

export function LatestAnalysis(props: Props) {
  const { analysisClient: analysisStore, studyId } = props;
  const approvalStatus = useApprovalStatus(studyId, 'analysis');
  const history = useHistory();
  useEffect(() => {
    if (approvalStatus !== 'approved') {
      return;
    }

    return Task.fromPromise(() => analysisStore.getAnalyses())
      .map((analyses) =>
        orderBy(
          analyses.filter((analysis) => analysis.studyId === studyId),
          (analysis) => analysis.modified
        )
      )
      .chain((analyses) =>
        analyses.length === 0
          ? Task.fromPromise(() =>
              analysisStore.createAnalysis({
                name: 'Unnamed Analysis',
                studyId,
                filters: [],
                starredVariables: [],
                derivedVariables: [],
                visualizations: [],
                computations: [],
                variableUISettings: {},
              })
            )
          : Task.of(analyses[0])
      )
      .run(({ id }) => {
        const newLocation = {
          ...history.location,
          pathname: `./${id}`,
        };
        history.replace(newLocation);
      });
  }, [analysisStore, history, studyId, approvalStatus]);

  return (
    <RestrictedPage approvalStatus={approvalStatus}>
      <div style={{ fontSize: '3em' }}>Finding analysis...</div>
    </RestrictedPage>
  );
}
