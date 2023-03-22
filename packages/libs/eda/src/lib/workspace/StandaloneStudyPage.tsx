import { ApprovalStatus } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';
import { usePermissions } from '@veupathdb/study-data-access/lib/data-restriction/permissionsHooks';
import { RestrictedPage } from '@veupathdb/study-data-access/lib/data-restriction/RestrictedPage';
import { RecordController } from '@veupathdb/wdk-client/lib/Controllers';
import { useStudyRecord } from '../core';
import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';

interface Props {
  studyId: string;
  showUnreleasedData: boolean;
}

/**
 * Determine if a user is allow to access a study. If not, then
 * @param props
 */
export function StandaloneStudyPage(props: Props) {
  const { studyId, showUnreleasedData } = props;
  const studyRecord = useStudyRecord();
  const permissionsValue = usePermissions();
  const approvalStatus: ApprovalStatus = permissionsValue.loading
    ? 'loading'
    : permissionsValue.permissions.perDataset[studyId] == null ||
      (!showUnreleasedData && studyRecord.attributes.is_public === 'false')
    ? 'study-not-found'
    : permissionsValue.permissions.perDataset[studyId]?.actionAuthorization
        .studyMetadata
    ? 'approved'
    : 'not-approved';
  return (
    <RestrictedPage approvalStatus={approvalStatus}>
      <EDAWorkspaceHeading />
      <RecordController recordClass="dataset" primaryKey={studyId} />
    </RestrictedPage>
  );
}
