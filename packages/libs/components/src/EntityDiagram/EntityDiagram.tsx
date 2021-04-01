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

interface CustomNode {
  node: HierarchyPointNode<StudyData>;
}

interface OffsetLine {
  link: HierarchyPointLink<StudyData>;
  nodeHeight: number;
  nodeWidth: number;
  orientation: Orientation;
}

// Todo: There MUST be a smarter way to center the text
function CalculateDYSize(nodeLength: number) {
  switch (nodeLength) {
    case 1:
      return '.33em';
    case 2:
      return '.80em';
    case 3:
      return '1.35em';
    case 4:
      return '1.8em';
    case 5:
      return '1.8em';
  }
}

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
  description: string;
  children?: this[];
  variables: Variables[];
}

export interface ShadingData {
  /** The key is the entity ID and the value is a decimal representing the
   * fraction of the node to shade */
  [index: string]: number;
}

export type Orientation = 'horizontal' | 'vertical';

export interface EntityDiagramProps {
  /** Data that defines the tree structure */
  treeData: StudyData;
  /** Which direction the tree is oriented */
  orientation: Orientation;
  /** Whether the diagram is expanded */
  isExpanded: boolean;
  /** The tree's dimensions. If the tree is horizontal, it may not take up the
   * whole height; if it's vertical, it may not take up the full width. */
  size: {
    height: number;
    width: number;
  };
  /** Which entity to highlight */
  highlightedEntityID: string;
  /** Data defining the background shading of each node */
  shadingData: ShadingData;
  /** An optional function returning the element to render for a node given its
   * data */
  renderNode?: (
    node: StudyData,
    children?: Array<React.ReactElement>
  ) => React.ReactElement | null;
  selectedTextBold?: boolean;
  selectedBorderWeight?: number;
  selectedHighlightWeight?: number;
  selectedHighlightColor?: string;
  shadowDx?: number;
  shadowDy?: number;
  shadowDispersion?: number;
  shadowOpacity?: number;
}

export default function EntityDiagram({
  treeData,
  orientation,
  isExpanded,
  highlightedEntityID,
  shadingData,
  renderNode,
  size,
  selectedTextBold = true,
  selectedBorderWeight = 2,
  selectedHighlightWeight = 2,
  selectedHighlightColor = 'orange',
  shadowDx = 1,
  shadowDy = 1,
  shadowDispersion = 0,
  shadowOpacity = 1,
}: EntityDiagramProps) {
  const data = hierarchy(treeData);

  const nodeWidth = isExpanded ? 120 : 30;
  const nodeHeight = isExpanded ? 70 : 20;
  // Node border width
  const nodeStrokeWidth = 1;
  // Width of the highlight border around the highlighted node
  const nodeHighlightWidth = selectedHighlightWeight;
  // treeHeight is always from root to furthest leaf, regardless of orientation
  // (it's not always vertical on screen)
  const treeHeight =
    (orientation === 'horizontal'
      ? size.width - nodeWidth
      : size.height - nodeHeight) -
    nodeHighlightWidth * 2;
  // Likewise for treeWidth (it's not always horizontal on screen)
  const treeWidth = orientation === 'horizontal' ? size.height : size.width;
  // The tree's edge is in the middle of the boundary nodes, so we shift it by
  // half a node dimension
  const treeLeft =
    orientation === 'horizontal' ? nodeWidth / 2 + nodeHighlightWidth : 0;
  const treeTop =
    (orientation === 'horizontal' ? 0 : nodeHeight / 2) + nodeHighlightWidth; // Where the baby rocks

  function CustomNode({ node }: CustomNode) {
    let displayText: string;
    const isHighlighted = highlightedEntityID == node.data.displayName;

    if (isExpanded) {
      displayText = node.data.displayName;
    } else {
      // get acronym of displayName
      const matches = node.data.displayName.match(/\b(\w)/g) as string[];
      displayText = matches.join('');
    }

    const rectangle = (
      <rect
        // These props don't account for stroke width, so we shrink them
        // accordingly to make sure the node is exactly the dimensions we want
        height={nodeHeight - nodeStrokeWidth * 2}
        width={nodeWidth - nodeStrokeWidth * 2}
        y={-nodeHeight / 2}
        x={-nodeWidth / 2}
        fill={
          shadingData[node.data.id]
            ? `url('#rect-gradient-${node.data.id}')`
            : 'white'
        }
        stroke={'black'}
        strokeWidth={isHighlighted ? selectedBorderWeight : nodeStrokeWidth}
        // strokeWidth={nodeStrokeWidth}
        style={{
          outline: isHighlighted
            ? `${selectedHighlightColor} ${nodeHighlightWidth}px solid`
            : undefined,
          overflowWrap: isExpanded ? 'normal' : undefined,
        }}
        key={`rect-${node.data.id}`}
      />
    );

    const text = (
      <Text
        fontSize={12}
        textAnchor="middle"
        style={{
          userSelect: 'none',
          fontWeight: isHighlighted && selectedTextBold ? 'bold' : undefined,
        }}
        dy={
          isExpanded
            ? CalculateDYSize(node.data.displayName.split(' ').length)
            : '.33em'
        }
        width={isExpanded ? 100 : undefined}
        key={`text-${node.data.id}`}
      >
        {displayText}
      </Text>
    );

    return (
      <Group
        top={orientation == 'horizontal' ? node.x : node.y}
        left={orientation == 'horizontal' ? node.y : node.x}
        key={node.x + node.y}
        style={{
          filter:
            shadowOpacity == 0 || (isHighlighted && nodeHighlightWidth > 0)
              ? undefined
              : 'url(#shadow)',
        }}
      >
        {renderNode?.(node.data, [rectangle, text]) ?? [rectangle, text]}
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
    let to, from;

    if (orientation == 'horizontal') {
      to = {
        x: link.target.y - nodeWidth / 2,
        y: link.target.x - 5,
      };
      from = { x: link.source.y, y: link.source.x };
    } else {
      to = {
        x: link.target.x,
        y: link.target.y - nodeHeight / 2 - 5,
      };
      from = { x: link.source.x, y: link.source.y };
    }

    return <Line to={to} from={from} stroke="black" markerEnd="url(#arrow)" />;
  }

  return (
    <div className={isExpanded ? '' : 'mini-diagram'}>
      <svg width={size.width} height={size.height}>
        <defs>
          <marker
            id="arrow"
            viewBox="0 -5 10 10"
            markerWidth={isExpanded ? '18' : '10'}
            markerHeight={isExpanded ? '18' : '10'}
            orient="auto"
            fill="black"
            refX={10}
          >
            <path d="M0,-5L10,0L0,5" />
          </marker>
          <filter id="shadow">
            <feDropShadow
              dx={shadowDx}
              dy={shadowDy}
              stdDeviation={shadowDispersion}
              floodOpacity={shadowOpacity}
            />
          </filter>
        </defs>
        {
          // Node background shading definitions
          Object.keys(shadingData).map((key, index) => (
            <LinearGradient
              key={index}
              vertical={false}
              x1={0}
              x2={shadingData[key]}
              fromOffset={1}
              id={`rect-gradient-${key}`}
              from="#e4c8c8"
              to="white"
            />
          ))
        }
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
