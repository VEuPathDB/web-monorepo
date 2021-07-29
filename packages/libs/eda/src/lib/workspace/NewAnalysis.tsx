import { RestrictedPage } from '@veupathdb/web-common/lib/App/DataRestriction/RestrictedPage';
import { useApprovalStatus } from '@veupathdb/web-common/lib/hooks/dataRestriction';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Task } from '@veupathdb/wdk-client/lib/Utils/Task';
import { AnalysisClient } from '../core';

interface Props {
  analysisClient: AnalysisClient;
  studyId: string;
}

export function NewAnalysis(props: Props) {
  const { analysisClient: analysisStore, studyId } = props;
  const approvalStatus = useApprovalStatus(studyId, 'analysis');
  const history = useHistory();
  useEffect(() => {
    if (approvalStatus !== 'approved') {
      return;
    }

    return Task.fromPromise(
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
    ).run(({ id }) => {
      const newLocation = {
        ...history.location,
        pathname: `./${id}`,
      };
      history.push(newLocation);
    });
  }, [analysisStore, history, studyId, approvalStatus]);

  return (
    <RestrictedPage approvalStatus={approvalStatus}>
      <div style={{ fontSize: '3em' }}>Creating new analysis...</div>
    </RestrictedPage>
  );
}
