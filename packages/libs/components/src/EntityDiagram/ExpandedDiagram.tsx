import React from 'react';
import { hierarchy, Tree } from '@visx/hierarchy';
import { LinearGradient } from '@visx/gradient';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import OffsetLine from './OffsetLine';
import { EntityDiagramProps } from './Types';

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

export default function ExpandedDiagram({
  treeData,
  orientation,
  highlightedEntityID,
  shadingData,
  renderNode,
  size,
}: EntityDiagramProps) {
  const data = hierarchy(treeData);

  const nodeWidth = 120;
  const nodeHeight = 70;
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

  return (
    <svg width={size.width} height={size.height}>
      <defs>
        <marker
          id="arrow"
          viewBox="0 -5 10 10"
          markerWidth="18"
          markerHeight="18"
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
                  key={`expanded-link-${i}`}
                />
              );
            })}
            {tree.descendants().map((node, i) => {
              const rectangle = (
                <rect
                  // These props don't account for stroke width, so we shrink
                  // them accordingly to make sure the node is exactly the
                  // dimensions we want
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
                  style={
                    highlightedEntityID == node.data.displayName
                      ? {
                          outline: `yellow ${nodeHighlightWidth}px solid`,
                          overflowWrap: 'normal',
                        }
                      : { overflowWrap: 'normal' }
                  }
                />
              );

              const text = (
                <Text
                  fontSize={12}
                  textAnchor={'middle'}
                  style={{ cursor: 'default' }}
                  dy={CalculateDYSize(node.data.displayName.split(' ').length)}
                  width={100}
                >
                  {node.data.displayName}
                </Text>
              );

              return (
                <Group
                  top={orientation == 'horizontal' ? node.x : node.y}
                  left={orientation == 'horizontal' ? node.y : node.x}
                  key={node.x + node.y}
                >
                  {renderNode?.(node.data, [rectangle, text]) ?? [
                    rectangle,
                    text,
                  ]}
                </Group>
              );
            })}
          </Group>
        )}
      </Tree>
    </svg>
  );
}
