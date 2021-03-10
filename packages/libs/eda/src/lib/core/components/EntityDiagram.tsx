import { useStudyMetadata } from '../hooks/study';
import { useEntityCounts } from '../hooks/entityCounts';
import { SessionState, useSession } from '../hooks/session';
import { SubsettingClient } from '../api/subsetting-api';
import MiniDiagram from '@veupathdb/components/lib/EntityDiagram/MiniDiagram';
import ExpandedDiagram from '@veupathdb/components/lib/EntityDiagram/ExpandedDiagram';
import { useState } from 'react';

interface Props {
  studyId: string;
  sessionId: string;
  subsettingClient: SubsettingClient;
  expanded: boolean;
  orientation: 'horizontal' | 'vertical';
}

export function EntityDiagram(props: Props) {
  const { studyId, sessionId, subsettingClient, expanded, orientation } = props;

  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const { value: studyMetadata, error: studyMetadataError } = useStudyMetadata(
    studyId,
    subsettingClient
  );
  const { session } = useSession(sessionId);
  // const { value: filteredCounts, error: filteredCountsError} = useEntityCounts(sessionState.session?.filters);
  const { value: filteredCounts, error: filteredCountsError } = useEntityCounts(
    session?.filters
  );

  if (studyMetadata) {
    setSelectedEntity(studyMetadata.rootEntity.displayName);
    const commonProps = {
      treeData: studyMetadata.rootEntity,
      highlightedEntityID: selectedEntity,
      orientation: orientation,
    };

    if (expanded) {
      const shadingData: {
        [index: string]: { value: number; color?: string };
      } = {};

      if (filteredCounts) {
        for (const [key, val] of Object.entries(filteredCounts)) {
          shadingData[key] = { value: val };
        }
      } else {
        console.log('Could not retrieve entity counts.');
      }

      return <ExpandedDiagram {...commonProps} shadingData={shadingData} />;
    } else {
      return <MiniDiagram {...commonProps} />;
    }
  } else {
    return (
      <div>
        {studyMetadataError
          ? String(studyMetadataError)
          : 'No studyMetadata found.'}
      </div>
    );
  }
}
