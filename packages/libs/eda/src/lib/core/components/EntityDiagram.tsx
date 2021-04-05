import { useStudyMetadata } from '../hooks/workspace';
import { useEntityCounts } from '../hooks/entityCounts';
import { SessionState } from '../../core';
import EntityDiagramComponent from '@veupathdb/components/lib/EntityDiagram/EntityDiagram';
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

  const shadingData: Record<string, number> =
    counts && filteredCounts
      ? Object.fromEntries(
          Object.entries(counts).map(([key, value]) => [
            key,
            filteredCounts[key] / value,
          ])
        )
      : {};
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

  return <EntityDiagramComponent isExpanded={expanded} {...diagramProps} />;
}
