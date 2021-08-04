import { orderBy } from 'lodash';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { RestrictedPage } from '@veupathdb/web-common/lib/App/DataRestriction/RestrictedPage';
import { useApprovalStatus } from '@veupathdb/web-common/lib/hooks/dataRestriction';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';
import { AnalysisClient } from '../core';
import { useRouteMatch } from 'react-router';

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
      .map((analyses) =>
        orderBy(
          analyses.filter((analysis) => analysis.studyId === studyId),
          (analysis) => analysis.modified
        )
      )
      .chain((analyses) =>
        analyses.length === 0
          ? Task.fromPromise(() =>
              analysisClient.createAnalysis({
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
