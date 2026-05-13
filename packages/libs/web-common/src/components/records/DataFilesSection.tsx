import React from 'react';
import {
  CollapsibleSection,
  Loading,
} from '@veupathdb/wdk-client/lib/Components';
import { Props } from '@veupathdb/wdk-client/lib/Views/Records/RecordAttributes/RecordAttributeSection';
import { DefaultSectionTitle } from '@veupathdb/wdk-client/lib/Views/Records/SectionTitle';
import { ErrorBoundary } from '@veupathdb/wdk-client/lib/Controllers';
import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { wdkRecordIdToDiyUserDatasetId } from '@veupathdb/user-datasets/lib/Utils/diyDatasets';
import { isVdiCompatibleWdkService } from '@veupathdb/user-datasets/lib/Service';
import { UserDatasetFiles } from '@veupathdb/user-datasets/lib/Components/UserDatasetFiles';

/** Display user dataset files in a collapsible section */
export function DataFilesSection(props: Props) {
  const { attribute, record, isCollapsed, onCollapsedChange, title } = props;
  const { displayName, help, name } = attribute;

  const headerContent = title ?? (
    <DefaultSectionTitle displayName={displayName} help={help} />
  );

  // Convert WDK record ID to VDI dataset ID
  const datasetID = record.id[0].value;
  const vdiDatasetId = wdkRecordIdToDiyUserDatasetId(datasetID);

  // Fetch user dataset files
  const userDatasetFilesResult = useWdkService(
    async (wdkService) => {
      if (!vdiDatasetId) {
        return { data: null, error: null };
      }

      if (!isVdiCompatibleWdkService(wdkService)) {
        return {
          data: null,
          error: 'VDI service is not configured. Unable to load dataset files.',
        };
      }

      try {
        const files = await wdkService.getUserDatasetFileListing(vdiDatasetId);
        return { data: files, error: null };
      } catch (error) {
        console.error('Failed to fetch user dataset files:', error);
        return {
          data: null,
          error: 'Failed to load dataset files. Please try again later.',
        };
      }
    },
    [vdiDatasetId]
  );

  return (
    <CollapsibleSection
      id={name}
      className={`wdk-RecordAttributeSectionItem`}
      headerContent={headerContent}
      isCollapsed={isCollapsed}
      onCollapsedChange={onCollapsedChange}
    >
      <ErrorBoundary>
        {userDatasetFilesResult?.error ? (
          <div className="error-message">
            <p>{userDatasetFilesResult.error}</p>
          </div>
        ) : userDatasetFilesResult?.data ? (
          <UserDatasetFiles
            datasetId={vdiDatasetId}
            files={userDatasetFilesResult.data}
            installStatus="complete"
          />
        ) : userDatasetFilesResult === undefined ? (
          <Loading />
        ) : null}
      </ErrorBoundary>
    </CollapsibleSection>
  );
}
