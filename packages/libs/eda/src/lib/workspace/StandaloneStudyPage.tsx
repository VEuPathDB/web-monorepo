import { ApprovalStatus } from '@veupathdb/study-data-access/lib/data-restriction/dataRestrictionHooks';
import { usePermissions } from '@veupathdb/study-data-access/lib/data-restriction/permissionsHooks';
import { RestrictedPage } from '@veupathdb/study-data-access/lib/data-restriction/RestrictedPage';
import { Tabs } from '@veupathdb/wdk-client/lib/Components';
import { RecordController } from '@veupathdb/wdk-client/lib/Controllers';
import { useState } from 'react';
import { useDownloadClient, useStudyRecord } from '../core';
import DownloadTab from './DownloadTab';
import { EDAWorkspaceHeading } from './EDAWorkspaceHeading';

interface Props {
  studyId: string;
  showUnreleasedData: boolean;
  isStudyExplorerWorkspace?: boolean;
}

/**
 * Determine if a user is allow to access a study. If not, then
 * @param props
 */
export function StandaloneStudyPage(props: Props) {
  const {
    studyId,
    showUnreleasedData,
    isStudyExplorerWorkspace = false,
  } = props;
  const studyRecord = useStudyRecord();
  const downloadClient = useDownloadClient();
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
  const [activeTab, setActiveTab] = useState('details');
  return (
    <RestrictedPage approvalStatus={approvalStatus}>
      <EDAWorkspaceHeading
        isStudyExplorerWorkspace={isStudyExplorerWorkspace}
      />
      <Tabs
        tabs={[
          {
            key: 'details',
            display: 'Study details',
            content: (
              <div style={{ minHeight: '10em' }}>
                <RecordController recordClass="dataset" primaryKey={studyId} />
              </div>
            ),
          },
          {
            key: 'downloads',
            display: 'Download',
            content: (
              <DownloadTab
                downloadClient={downloadClient}
                analysisState={undefined}
                totalCounts={undefined}
                filteredCounts={undefined}
              />
            ),
          },
        ]}
        activeTab={activeTab}
        onTabSelected={setActiveTab}
      />
    </RestrictedPage>
  );
}
