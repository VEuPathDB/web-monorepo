// Components
import { RestrictedPage } from '@veupathdb/study-data-access/lib/data-restriction/RestrictedPage';
import { EDAAnalysisListContainer } from '../core';
import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';
import { AnalysisList } from './AnalysisList';

// Hooks
import { useApprovalStatus } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';
import {
  useConfiguredAnalysisClient,
  useConfiguredDataClient,
  useConfiguredSubsettingClient,
} from '../core/hooks/client';

// Data and Utilities
import { cx } from './Utils';
export interface Props {
  studyId: string;
  subsettingServiceUrl: string;
  dataServiceUrl: string;
  userServiceUrl: string;
}

/**
 * Component displayed when a study is chosen from StudyList.
 */
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
