import { useStudyMetadata } from '../hooks/workspace';
import { useEntityCounts } from '../hooks/entityCounts';
import { SessionState } from '../../core';
import MiniDiagram from '@veupathdb/components/src/EntityDiagram/MiniDiagram';
import ExpandedDiagram from '@veupathdb/components/src/EntityDiagram/ExpandedDiagram';
import { StudyEntity } from '../types/study';
import { VariableLink } from './VariableLink';

interface Props {
  sessionState: SessionState;
  expanded: boolean;
  orientation: 'horizontal' | 'vertical';
  selectedEntity: string;
}

export function EntityDiagram(props: Props) {
  const { sessionState, expanded, orientation, selectedEntity } = props;

  const studyMetadata = useStudyMetadata();
  const { session } = sessionState;
  const { value: counts, error: countsError } = useEntityCounts();
  const { value: filteredCounts, error: filteredCountsError } = useEntityCounts(
    session?.filters
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
          value: Math.floor((filteredCounts[key] / counts[key]) * 10),
        };
      });
    } else {
      console.log('Could not retrieve entity counts.');
    }

    const renderNode = (
      node: StudyEntity,
      children?: Array<React.ReactElement>
    ) => {
      const variable = node.variables.find(
        (variable) => variable.displayType != null
      );
      if (variable == null) return null;
      return (
        <VariableLink
          entityId={node.id}
          variableId={variable.id}
          children={children}
        ></VariableLink>
      );
    };

    return (
      <ExpandedDiagram
        {...commonProps}
        shadingData={shadingData}
        renderNode={renderNode}
      />
    );
  } else {
    return <MiniDiagram {...commonProps} />;
  }
}
