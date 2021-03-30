import { useStudyMetadata } from '../hooks/workspace';
import { useEntityCounts } from '../hooks/entityCounts';
import { SessionState } from '../../core';
import MiniDiagram from '@veupathdb/components/lib/EntityDiagram/MiniDiagram';
import ExpandedDiagram from '@veupathdb/components/lib/EntityDiagram/ExpandedDiagram';
import {
  ShadingData,
  ShadingValue,
} from '@veupathdb/components/lib/EntityDiagram/Types';
import { StudyEntity } from '../types/study';
import { VariableLink } from './VariableLink';

interface Props {
  sessionState: SessionState;
  expanded: boolean;
  orientation: 'horizontal' | 'vertical';
  /** The tree's dimensions. If the tree is horizontal, it may not take up
   * the whole height; if it's vertical, it may not take up the full
   * width. */
  size: {
    height: number;
    width: number;
  };
  selectedEntity: string;
}

export function EntityDiagram(props: Props) {
  const { sessionState, expanded, orientation, size, selectedEntity } = props;

  const studyMetadata = useStudyMetadata();
  const { session } = sessionState;
  const { value: counts } = useEntityCounts();
  const { value: filteredCounts } = useEntityCounts(session?.filters);

  const shadingData: ShadingData = {};

  if (counts && filteredCounts) {
    Object.keys(counts).forEach((key, i) => {
      shadingData[key] = {
        value: Math.floor(
          (filteredCounts[key] / counts[key]) * 10
        ) as ShadingValue,
      };
    });
  } else {
    console.log('Could not retrieve entity counts.');
  }

  // Renders a VariableLink with optional children passed through
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
        replace={true}
      ></VariableLink>
    );
  };

  const diagramProps = {
    treeData: studyMetadata.rootEntity,
    highlightedEntityID: selectedEntity,
    orientation: orientation,
    size: size,
    shadingData: shadingData,
    renderNode: renderNode,
  };

  if (expanded) {
    return <ExpandedDiagram {...diagramProps} />;
  } else {
    return <MiniDiagram {...diagramProps} />;
  }
}
