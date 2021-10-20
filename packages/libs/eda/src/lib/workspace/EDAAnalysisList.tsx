import React, { useMemo } from 'react';

import { RestrictedPage } from '@veupathdb/study-data-access/lib/data-restriction/RestrictedPage';
import { useApprovalStatus } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';

import { AnalysisClient, EDAAnalysisListContainer } from '../core';
import { SubsettingClient } from '../core/api/subsetting-api';
import { DataClient } from '../core/api/data-api';
import { useConfiguredAnalysisClient } from '../core/hooks/analysisClient';
import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';
import { AnalysisList } from './AnalysisList';
import { cx } from './Utils';

export interface Props {
  studyId: string;
  subsettingServiceUrl: string;
  dataServiceUrl: string;
  userServiceUrl: string;
}

export function EDAAnalysisList(props: Props) {
  const subsettingClient: SubsettingClient = useMemo(
    () => new SubsettingClient({ baseUrl: props.subsettingServiceUrl }),
    [props.subsettingServiceUrl]
  );

  const dataClient: DataClient = useMemo(
    () => new DataClient({ baseUrl: props.dataServiceUrl }),
    [props.dataServiceUrl]
  );

  const analysisClient: AnalysisClient = useConfiguredAnalysisClient(
    props.userServiceUrl
  );

  const approvalStatus = useApprovalStatus(props.studyId, 'analysis');

  return (
    <RestrictedPage approvalStatus={approvalStatus}>
      <EDAAnalysisListContainer
        studyId={props.studyId}
        subsettingClient={subsettingClient}
        dataClient={dataClient}
        className={cx()}
        analysisClient={analysisClient}
      >
        <EDAWorkspaceHeading />
        <AnalysisList analysisStore={analysisClient} />
      </EDAAnalysisListContainer>
    </RestrictedPage>
  );
}
