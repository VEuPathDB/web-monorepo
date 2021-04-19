import { useStudyMetadata } from '../hooks/workspace';
import EntityDiagramComponent, {
  Orientation,
} from '@veupathdb/components/lib/EntityDiagram/EntityDiagram';
import { StudyEntity } from '../types/study';
import { VariableLink } from './VariableLink';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { reduce } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';

interface Props {
  expanded: boolean;
  orientation: 'horizontal' | 'vertical';
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
            props.filteredEntityCounts![key] === 0
              ? 0
              : // min width is 1%
                Math.max(0.01, props.filteredEntityCounts![key] / value),
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

  const dimensions = getDimensions(studyMetadata.rootEntity, props.orientation);

  return (
    <EntityDiagramComponent
      isExpanded={props.expanded}
      treeData={studyMetadata.rootEntity}
      highlightedEntityID={props.selectedEntity}
      orientation={props.orientation}
      shadingData={shadingData}
      renderNode={renderNode}
      selectedHighlightColor="#069"
      shadowDispersion={3}
      shadowOpacity={0.3}
      {...dimensions}
    />
  );
}

interface Dimensions {
  size: {
    height: number;
    width: number;
  };
  expandedNodeHeight: number;
  expandedNodeWidth: number;
}

function getDimensions(
  tree: StudyEntity,
  orientation: Orientation
): Dimensions {
  switch (orientation) {
    case 'horizontal': {
      const treeWidth = getTreeWidth(tree);
      const treeHeight = getTreeHeight(tree);
      const expandedNodeHeight = 30;
      const expandedNodeWidth = 200;
      const height = treeWidth * (expandedNodeHeight + expandedNodeHeight / 2);
      const width = treeHeight * (expandedNodeWidth + expandedNodeWidth / 3);
      return {
        size: {
          height,
          width,
        },
        expandedNodeHeight,
        expandedNodeWidth,
      };
    }
    case 'vertical': {
      const treeWidth = getTreeWidth(tree);
      const treeHeight = getTreeHeight(tree);
      const expandedNodeHeight = 30;
      const expandedNodeWidth = 200;
      const height = treeHeight * (expandedNodeHeight + expandedNodeHeight / 2);
      const width = treeWidth * (expandedNodeWidth + expandedNodeWidth / 3);
      return {
        size: {
          height,
          width,
        },
        expandedNodeHeight,
        expandedNodeWidth,
      };
    }
    default: {
      throw new Error('No defaults allowed!');
    }
  }
}

function getTreeHeight(tree: StudyEntity): number {
  if (tree.children == null || tree.children.length === 0) return 1;
  const heights = tree.children.map(getTreeHeight);
  return 1 + Math.max(...heights);
}

function getTreeWidth(tree: StudyEntity): number {
  return reduce(
    (width, node) =>
      node.children == null || node.children.length === 0
        ? width
        : node.children.length - 1 + width,
    1,
    preorder(tree, (node) => node.children ?? [])
  );
}
