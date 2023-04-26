import React from 'react';
import { hierarchy, Tree } from '@visx/hierarchy';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import {
  HierarchyPointLink,
  HierarchyPointNode,
} from '@visx/hierarchy/lib/types';
import { Line } from '@visx/shape';
import { LinearGradient } from '@visx/gradient';
import './diagram.css';

interface CustomNodeProps {
  node: HierarchyPointNode<StudyData>;
}

interface OffsetLine {
  link: HierarchyPointLink<StudyData>;
  nodeHeight: number;
  nodeWidth: number;
  orientation: Orientation;
}

type NodePoint = {
  x: number;
  y: number;
};

export type VariableType =
  | 'category'
  | 'string'
  | 'number'
  | 'date'
  | 'longitude';

export interface Variables {
  id: string;
  providerLabel: string;
  displayName: string;
  type: VariableType;
  isContinuous?: boolean;
  precision?: number;
  units?: string;
  isMultiValued: boolean;
}

export interface StudyData {
  id: string;
  displayName: string;
  displayNamePlural?: string;
  description: string;
  children?: this[];
  isManyToOneWithParent?: boolean;
  variables: Variables[];
}

export type EntityCounts = Record<string, { filtered: number; total: number }>;

export type Orientation = 'horizontal' | 'vertical';

export interface EntityDiagramProps {
  /** Data that defines the tree structure */
  treeData: StudyData;
  /** Which direction the tree is oriented */
  orientation: Orientation;
  /** Whether the diagram is expanded */
  isExpanded: boolean;
  /** Array of entity IDs that have filters applied */
  filteredEntities?: string[];
  /** The tree's dimensions. If the tree is horizontal, it may not take up the
   * whole height; if it's vertical, it may not take up the full width. */
  size: {
    height: number;
    width: number;
  };
  /** Which entity to highlight */
  highlightedEntityID?: string;
  /** Counts used for red/gray bar and display */
  entityCounts?: EntityCounts;
  /** An optional function returning the element to render for a node given its
   * data */
  renderNode?: (
    node: StudyData,
    children?: React.ReactNode
  ) => React.ReactElement | null;
  selectedTextBold?: boolean;
  selectedBorderWeight?: number;
  selectedHighlightWeight?: number;
  selectedHighlightColor?: string;
  shadowDx?: number;
  shadowDy?: number;
  shadowDispersion?: number;
  shadowOpacity?: number;
  miniNodeWidth?: number;
  miniNodeHeight?: number;
  expandedNodeWidth?: number;
  expandedNodeHeight?: number;
  fontSize?: number;
  shadingColor?: string;
}

export default function EntityDiagram({
  treeData,
  orientation,
  isExpanded,
  highlightedEntityID,
  filteredEntities,
  entityCounts,
  renderNode,
  size,
  selectedTextBold = true,
  selectedBorderWeight = 1,
  selectedHighlightWeight = 3,
  selectedHighlightColor = 'rgba(60, 120, 216, 1)',
  shadowDx = 2,
  shadowDy = 2,
  shadowDispersion = 0.2,
  shadowOpacity = 0.3,
  miniNodeWidth = 35,
  miniNodeHeight = 20,
  expandedNodeWidth = 120,
  expandedNodeHeight = 40,
  fontSize = 12,
  shadingColor = '#e4c8c8',
}: EntityDiagramProps) {
  const data = hierarchy(treeData);

  const radius = '.3em';

  const nodeWidth = isExpanded ? expandedNodeWidth : miniNodeWidth;
  const nodeHeight = isExpanded ? expandedNodeHeight : miniNodeHeight;
  // Node border width
  const nodeStrokeWidth = 2;
  // Width of the highlight border around the highlighted node
  const nodeHighlightWidth = selectedHighlightWeight;
  // treeHeight is always from root to furthest leaf, regardless of orientation
  // (it's not always vertical on screen)
  const treeHeight =
    (orientation === 'horizontal'
      ? size.width - nodeWidth
      : size.height - nodeHeight) -
    nodeHighlightWidth * 2 -
    shadowDy;
  // Likewise for treeWidth (it's not always horizontal on screen)
  const treeWidth = orientation === 'horizontal' ? size.height : size.width;
  // The tree's edge is in the middle of the boundary nodes, so we shift it by
  // half a node dimension
  const treeLeft =
    orientation === 'horizontal' ? nodeWidth / 2 + nodeHighlightWidth : 0;
  const treeTop =
    (orientation === 'horizontal' ? 0 : nodeHeight / 2) + nodeHighlightWidth; // Where the baby rocks

  function CustomNode({ node }: CustomNodeProps) {
    let displayText: string;
    const isHighlighted = highlightedEntityID == node.data.id;

    if (isExpanded) {
      displayText = node.data.displayNamePlural ?? node.data.displayName;
    } else {
      // get acronym of displayName
      const matches = node.data.displayName.match(/\b(\w)/g) as string[];
      displayText = matches.join('');
    }

    // <rect>'s props don't account for stroke width, so we shrink them
    // accordingly to make sure the node is exactly the dimensions we want
    const rectHeight = nodeHeight - nodeStrokeWidth * 2;
    const rectWidth = nodeWidth - nodeStrokeWidth * 2;

    const borderWidth = isHighlighted ? selectedBorderWeight : nodeStrokeWidth;

    const shadingHeight = 8;

    const backgroundRect = (
      <rect
        height={rectHeight + borderWidth}
        width={rectWidth + borderWidth}
        y={-rectHeight / 2 - borderWidth / 2}
        x={-rectWidth / 2 - borderWidth / 2}
        rx={radius}
        fill="white"
        strokeWidth={borderWidth}
        stroke="transparent"
        style={{
          filter:
            shadowOpacity == 0
              ? undefined
              : isHighlighted
              ? 'url(#selected-shadow)'
              : 'url(#shadow)',
        }}
      />
    );

    const borderRect = (
      <rect
        height={rectHeight + borderWidth}
        width={rectWidth + borderWidth}
        y={-rectHeight / 2 - borderWidth / 2}
        x={-rectWidth / 2 - borderWidth / 2}
        rx={radius}
        fill="none"
        stroke={isHighlighted ? selectedHighlightColor : '#666'}
        strokeWidth={isHighlighted ? borderWidth + 1 : borderWidth}
      />
    );

    const shadingRect = (
      <rect
        height={isExpanded ? shadingHeight : rectHeight}
        width={rectWidth}
        y={isExpanded ? rectHeight / 2 - shadingHeight : -rectHeight / 2}
        x={-rectWidth / 2}
        fill={entityCounts ? `url('#rect-gradient-${node.data.id}')` : 'white'}
        style={{
          overflowWrap: isExpanded ? 'normal' : undefined,
        }}
      />
    );

    const text = (
      <Text
        fontSize={isHighlighted ? fontSize * 1.1 : fontSize}
        fontWeight={500}
        textAnchor="middle"
        verticalAnchor="middle"
        style={{
          userSelect: 'none',
          fontWeight: isHighlighted && selectedTextBold ? 'bold' : undefined,
        }}
        dy={isExpanded ? -shadingHeight : 0}
      >
        {displayText}
      </Text>
    );

    const count =
      entityCounts && isExpanded ? (
        <Text
          fontSize={isHighlighted ? fontSize * 1.1 * 0.8 : fontSize * 0.8}
          fontWeight={500}
          fill="#333"
          textAnchor="middle"
          verticalAnchor="end"
          y={fontSize * 0.8}
        >
          {`${entityCounts[
            node.data.id
          ].filtered.toLocaleString()} of ${entityCounts[
            node.data.id
          ].total.toLocaleString()}`}
        </Text>
      ) : (
        <></>
      );

    const filterIcon = filteredEntities?.includes(node.data.id) ? (
      <Group>
        <title>This entity has filters</title>
        <Text
          fontSize={14}
          fontFamily="FontAwesome"
          fill="green"
          textAnchor="start"
          x={rectWidth / 2 - 16}
          dy={-shadingHeight}
          verticalAnchor="middle"
        >
          &#xf0b0;
        </Text>
      </Group>
    ) : null;

    let children = (
      <>
        {backgroundRect}
        {shadingRect}
        {filterIcon}
        {text}
        {count}
        {borderRect}
      </>
    );

    return (
      <Group
        top={orientation == 'horizontal' ? node.x : node.y}
        left={orientation == 'horizontal' ? node.y : node.x}
      >
        {renderNode?.(node.data, children) ?? children}
        {!isExpanded && <title>{node.data.displayName}</title>}
      </Group>
    );
  }

  function OffsetLine({
    link,
    nodeHeight,
    nodeWidth,
    orientation,
  }: OffsetLine) {
    let to: NodePoint, from: NodePoint;

    const isOneToMany = link.target.data.isManyToOneWithParent;

    // TODO Compute angle of line so it points into center of node or edge,
    // but begins in same place as now. Use pythagorean theorem to compute
    // x coordinates, and use `link.source.children` to determine y coordinates.

    const maxOffset = 15;
    const offset =
      link.target.y - nodeWidth / 2 - (link.source.y + nodeWidth / 2) >
      maxOffset * 2 + 10
        ? maxOffset
        : 0;

    if (orientation == 'horizontal') {
      from = { x: link.source.y + nodeWidth / 2 + offset, y: link.source.x };
      to = {
        x: isOneToMany
          ? link.target.y - nodeWidth / 2 - 5 - offset * 2
          : link.target.y - nodeWidth / 2 - 5 - offset,
        y: link.target.x,
      };
    } else {
      from = { x: link.source.x, y: link.source.y };
      to = {
        x: link.target.x,
        y: link.target.y - nodeHeight / 2 - 5,
      };
    }

    const oneToManyNodeEndpoints = [];
    if (isOneToMany) {
      oneToManyNodeEndpoints.push(
        {
          x: to.x + (orientation == 'horizontal' ? offset : nodeHeight / 2),
          y: to.y + (orientation == 'horizontal' ? nodeHeight / 4 : 0),
        },
        {
          x: to.x + (orientation == 'horizontal' ? offset : 0),
          y: to.y,
        },
        {
          x:
            to.x +
            (orientation == 'horizontal' ? offset : (nodeHeight / 2) * -1),
          y: to.y - (orientation == 'horizontal' ? nodeHeight / 4 : 0),
        }
      );
    }

    return (
      <>
        <Line
          from={from}
          to={to}
          stroke="#777"
          strokeWidth={2}
          markerStart={'url(#dot)'}
          markerEnd={isOneToMany ? '' : 'url(#dot)'}
        />
        {isOneToMany
          ? oneToManyNodeEndpoints.map((endpoint, index) => {
              return (
                <Line
                  key={index}
                  from={to}
                  to={endpoint}
                  stroke="#777"
                  strokeWidth={2}
                  markerEnd="url(#dot)"
                />
              );
            })
          : null}
      </>
    );
  }

  // Can be used to adjust node size if/when this feature is implemented
  const nodeSize = isExpanded ? 4.25 : 3.5;
  return (
    <div className={isExpanded ? 'expanded-diagram' : 'mini-diagram'}>
      <svg width={size.width} height={size.height}>
        <defs>
          <marker
            id="dot"
            viewBox="0 0 10 10"
            markerWidth={nodeSize}
            markerHeight={nodeSize}
            orient="auto"
            fill="#777"
            refX={nodeSize}
            refY={nodeSize}
          >
            <circle cx={nodeSize} cy={nodeSize} r={nodeSize} />
          </marker>
          <filter id="shadow" x="-20%" y="-40%" width="150%" height="200%">
            <feDropShadow
              dx={shadowDx}
              dy={shadowDy}
              stdDeviation={shadowDispersion}
              floodOpacity={shadowOpacity}
            />
          </filter>
          <filter
            id="selected-shadow"
            x="-20%"
            y="-40%"
            width="150%"
            height="200%"
          >
            <feDropShadow
              dx={shadowDx * 1.5}
              dy={shadowDy * 1.5}
              stdDeviation={shadowDispersion * 2}
              floodOpacity={shadowOpacity}
            />
          </filter>
        </defs>
        {/*Node background shading definitions*/}
        {entityCounts &&
          Object.entries(entityCounts).map(
            ([entityId, { total, filtered }]) => (
              <LinearGradient
                key={entityId}
                vertical={false}
                x1={0}
                x2={filtered / total}
                fromOffset={1}
                id={`rect-gradient-${entityId}`}
                from={shadingColor}
                to={isExpanded ? '#cccccc' : 'white'}
              />
            )
          )}
        <Tree root={data} size={[treeWidth, treeHeight]}>
          {(tree) => (
            <Group left={treeLeft} top={treeTop}>
              {tree.links().map((link, i) => (
                <OffsetLine
                  link={link}
                  nodeHeight={nodeHeight}
                  nodeWidth={nodeWidth}
                  orientation={orientation}
                  key={`link-${i}`}
                />
              ))}
              {tree.descendants().map((node, i) => (
                <CustomNode node={node} key={`node-${i}`} />
              ))}
            </Group>
          )}
        </Tree>
      </svg>
    </div>
  );
}
