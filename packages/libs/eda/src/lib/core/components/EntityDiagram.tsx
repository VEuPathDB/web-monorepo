import { useStudyMetadata } from '../hooks/workspace';
import EntityDiagramComponent, {
  Orientation,
  StudyData,
} from '@veupathdb/components/lib/EntityDiagram/EntityDiagram';
import { StudyEntity } from '../types/study';
import {
  mapStructure,
  preorder,
} from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { reduce } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import { useEffect, useMemo, useState } from 'react';
import { VariableLink, VariableLinkConfig } from './VariableLink';

interface Props {
  expanded: boolean;
  orientation: 'horizontal' | 'vertical';
  selectedEntity?: string;
  selectedVariable?: string;
  entityCounts?: Record<string, number>;
  filteredEntities?: string[];
  filteredEntityCounts?: Record<string, number>;
  variableLinkConfig: VariableLinkConfig;
}

export function EntityDiagram(props: Props) {
  const { selectedEntity, selectedVariable, variableLinkConfig } = props;
  const studyMetadata = useStudyMetadata();
  const entityTree = useMemo((): StudyEntity => {
    return mapStructure(
      (node, children) => ({
        ...node,
        children: children.slice().reverse(),
      }),
      (entity) => entity.children ?? [],
      studyMetadata.rootEntity
    );
  }, [studyMetadata.rootEntity]);
  const [lastVariableMap, setLastVariableMap] = useState<
    Record<string, string>
  >({});
  const entityCounts = useMemo(
    () =>
      props.entityCounts &&
      props.filteredEntityCounts &&
      combineCounts(props.entityCounts, props.filteredEntityCounts),
    [props.entityCounts, props.filteredEntityCounts]
  );

  useEffect(() => {
    if (selectedEntity && selectedVariable) {
      setLastVariableMap((prev) => ({
        ...prev,
        [selectedEntity]: selectedVariable,
      }));
    }
  }, [selectedEntity, selectedVariable]);

  // Renders a VariableLink with optional children passed through
  const renderNode = (node: StudyData, children?: React.ReactNode) => {
    return (
      <VariableLink
        entityId={node.id}
        variableId={lastVariableMap[node.id]}
        children={children}
        replace={false}
        style={{ textDecoration: 'none' }}
        linkConfig={variableLinkConfig}
      ></VariableLink>
    );
  };

  const dimensions = getDimensions(
    entityTree,
    props.orientation,
    props.expanded
  );

  // TODO Update props of EntityDiagramComponent in web-components to be more
  // generic. Until then, we have to cast the StudyData type.

  return (
    <EntityDiagramComponent
      isExpanded={props.expanded}
      treeData={entityTree as StudyData}
      highlightedEntityID={props.selectedEntity}
      orientation={props.orientation}
      filteredEntities={props.filteredEntities}
      entityCounts={entityCounts}
      renderNode={renderNode}
      selectedBorderWeight={4}
      selectedHighlightColor="#666685"
      shadingColor="#E39C9C"
      shadowDispersion={2}
      shadowOpacity={0.4}
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
  miniNodeHeight: number;
  miniNodeWidth: number;
}

function getDimensions(
  tree: StudyEntity,
  orientation: Orientation,
  isExpanded: boolean
): Dimensions {
  const isVertical = orientation === 'vertical';
  const treeWidth = getTreeWidth(tree);
  const treeHeight = getTreeHeight(tree);
  const expandedNodeHeight = 45;
  const expandedNodeWidth = 220;
  const miniNodeHeight = 30;
  const miniNodeWidth = 40;
  const nodeVerticalSpacingConstant = isExpanded ? 1 / 3 : 3 / 4;
  const nodeHorizontalSpacingConstant = isVertical ? 3 / 2 : 3 / 4;
  const nodeHeight = isExpanded ? expandedNodeHeight : miniNodeHeight;
  const nodeWidth = isExpanded ? expandedNodeWidth : miniNodeWidth;
  const height =
    (isVertical ? treeHeight : treeWidth) *
    (nodeHeight + nodeHeight * nodeHorizontalSpacingConstant);
  const width =
    (isVertical ? treeWidth : treeHeight) *
    (nodeWidth + nodeWidth * nodeVerticalSpacingConstant);
  return {
    size: {
      height,
      width,
    },
    expandedNodeHeight,
    expandedNodeWidth,
    miniNodeHeight,
    miniNodeWidth,
  };
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

function combineCounts(
  entityCounts: Record<string, number>,
  filteredEntityCounts: Record<string, number>
): Record<string, { total: number; filtered: number }> {
  return Object.keys(entityCounts).reduce(
    (counts, entityId) =>
      Object.assign(counts, {
        [entityId]: {
          total: entityCounts[entityId],
          filtered: filteredEntityCounts[entityId],
        },
      }),
    {}
  );
}
