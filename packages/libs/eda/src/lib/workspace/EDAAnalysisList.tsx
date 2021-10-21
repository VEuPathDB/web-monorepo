import React, { useMemo } from 'react';

import { RestrictedPage } from '@veupathdb/web-common/lib/App/DataRestriction/RestrictedPage';
import { useApprovalStatus } from '@veupathdb/web-common/lib/hooks/dataRestriction';

import {
  AnalysisClient,
  EDAAnalysisListContainer,
  useConfiguredDataClient,
  useConfiguredSubsettingClient,
  useSubsettingClient,
} from '../core';
import { SubsettingClient } from '../core/api/subsetting-api';
import { DataClient } from '../core/api/data-api';
import { useConfiguredAnalysisClient } from '../core/hooks/client';
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
  const subsettingClient = useConfiguredSubsettingClient(
    props.subsettingServiceUrl
  );

  const dataClient = useConfiguredDataClient(props.dataServiceUrl);

  const analysisClient = useConfiguredAnalysisClient(props.userServiceUrl);

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
