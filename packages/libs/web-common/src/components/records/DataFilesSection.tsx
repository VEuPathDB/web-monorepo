import React from 'react';
import { CollapsibleSection } from '@veupathdb/wdk-client/lib/Components';
import { Props } from '@veupathdb/wdk-client/lib/Views/Records/RecordAttributes/RecordAttributeSection';
import { DefaultSectionTitle } from '@veupathdb/wdk-client/lib/Views/Records/SectionTitle';
import { ErrorBoundary } from '@veupathdb/wdk-client/lib/Controllers';
import { wdkRecordIdToDiyUserDatasetId } from '@veupathdb/user-datasets/lib/Utils/diyDatasets';
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

  // Try to convert to VDI dataset ID, render nothing if it's not a valid user dataset
  let vdiDatasetId: string;
  try {
    vdiDatasetId = wdkRecordIdToDiyUserDatasetId(datasetID);
  } catch (error) {
    // Not a user dataset record, don't render this section
    return null;
  }

  return (
    <CollapsibleSection
      id={name}
      className={`wdk-RecordAttributeSectionItem`}
      headerContent={headerContent}
      isCollapsed={isCollapsed}
      onCollapsedChange={onCollapsedChange}
    >
      <ErrorBoundary>
        <UserDatasetFiles
          datasetId={vdiDatasetId}
          installStatus="complete"
          showHeader={false}
        />
      </ErrorBoundary>
    </CollapsibleSection>
  );
}
