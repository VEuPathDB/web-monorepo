import { useStudyMetadata } from '../hooks/workspace';
import { useEntityCounts } from '../hooks/entityCounts';
import { useSession } from '../hooks/session';
import MiniDiagram from '@veupathdb/components/lib/EntityDiagram/MiniDiagram';
import ExpandedDiagram from '@veupathdb/components/lib/EntityDiagram/ExpandedDiagram';
import { useState } from 'react';

interface Props {
  sessionId: string;
  expanded: boolean;
  orientation: 'horizontal' | 'vertical';
}

export function EntityDiagram(props: Props) {
  const { sessionId, expanded, orientation } = props;

  const studyMetadata = useStudyMetadata();
  const { session } = useSession(sessionId);
  const { value: counts, error: countsError } = useEntityCounts();
  const { value: filteredCounts, error: filteredCountsError } = useEntityCounts(
    session?.filters
  );
  const [selectedEntity, setSelectedEntity] = useState(
    studyMetadata.rootEntity.displayName
  );

  const commonProps = {
    treeData: studyMetadata.rootEntity,
    highlightedEntityID: selectedEntity,
    orientation: orientation,
  };

  if (expanded) {
    const shadingData: {
      [index: string]: { value: number; color?: string };
    } = {};

    if (counts && filteredCounts) {
      Object.keys(counts).forEach((key, i) => {
        shadingData[key] = {
          value: (filteredCounts[key] / counts[key]) * 10,
        };
      });
    } else {
      console.log('Could not retrieve entity counts.');
    }

    return <ExpandedDiagram {...commonProps} shadingData={shadingData} />;
  } else {
    return <MiniDiagram {...commonProps} />;
  }
}
