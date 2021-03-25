import React from 'react';
import { hierarchy, Tree } from '@visx/hierarchy';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import OffsetLine from './OffsetLine';
import { LinearGradient } from '@visx/gradient';

interface CustomNode {
  node: HierarchyPointNode<StudyData>;
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

export interface EntityDiagramProps {
  /** Data that defines the tree structure */
  treeData: StudyData;
  /** Which direction the tree is oriented */
  orientation: 'horizontal' | 'vertical';
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
}

export default function EntityDiagram({
  treeData,
  orientation,
  isExpanded,
  highlightedEntityID,
  shadingData,
  renderNode,
  size,
}: EntityDiagramProps) {
  const data = hierarchy(treeData);

  const nodeWidth = isExpanded ? 120 : 30;
  const nodeHeight = isExpanded ? 70 : 20;
  // Node border width
  const nodeStrokeWidth = 1;
  // Width of the highlight border around the highlighted node
  const nodeHighlightWidth = 3;
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
        strokeWidth={nodeStrokeWidth}
        style={{
          outline: isHighlighted
            ? `yellow ${nodeHighlightWidth}px solid`
            : undefined,
          overflowWrap: isExpanded ? 'normal' : undefined,
        }}
      />
    );

    const text = (
      <Text
        fontSize={12}
        textAnchor="middle"
        style={{ userSelect: 'none' }}
        dy={
          isExpanded
            ? CalculateDYSize(node.data.displayName.split(' ').length)
            : '.33em'
        }
        width={isExpanded ? 100 : undefined}
      >
        {displayText}
      </Text>
    );

    return (
      <Group
        top={orientation == 'horizontal' ? node.x : node.y}
        left={orientation == 'horizontal' ? node.y : node.x}
        key={node.x + node.y}
      >
        {renderNode?.(node.data, [rectangle, text]) ?? [rectangle, text]}
        {!isExpanded && <title>{node.data.displayName}</title>}
      </Group>
    );
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
            style={{ opacity: 0.7 }}
          >
            <path d="M0,-5L10,0L0,5" />
          </marker>
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
              {tree.links().map((link, i) => {
                return (
                  <OffsetLine
                    link={link}
                    orientation={orientation}
                    key={isExpanded ? `expanded-link-${i}` : `link-${i}`}
                  />
                );
              })}
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
