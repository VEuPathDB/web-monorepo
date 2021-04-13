import { useStudyMetadata } from '../hooks/workspace';
import EntityDiagramComponent from '@veupathdb/components/lib/EntityDiagram/EntityDiagram';
import { StudyEntity } from '../types/study';
import { VariableLink } from './VariableLink';

interface Props {
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
  entityCounts?: Record<string, number>;
  filteredEntityCounts?: Record<string, number>;
}

export function EntityDiagram(props: Props) {
  const studyMetadata = useStudyMetadata();

  const shadingData: Record<string, number> =
    props.entityCounts && props.filteredEntityCounts
      ? Object.fromEntries(
          Object.entries(props.entityCounts).map(([key, value]) => [
            key,
            props.filteredEntityCounts![key] / value,
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
    highlightedEntityID: props.selectedEntity,
    orientation: props.orientation,
    size: props.size,
    shadingData: shadingData,
    renderNode: renderNode,
  };

  return (
    <EntityDiagramComponent isExpanded={props.expanded} {...diagramProps} />
  );
}
