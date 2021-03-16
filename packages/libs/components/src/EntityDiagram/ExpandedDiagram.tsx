import React from 'react';
import { hierarchy, Tree } from '@visx/hierarchy';
import { LinearGradient } from '@visx/gradient';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import OffsetLine from './OffsetLine';
import { StudyData } from './Types';

interface ShadingValues {
  value: number;
  color?: string;
}

interface ShadingData {
  [index: string]: ShadingValues;
}

interface ExpandedDiagram {
  treeData: StudyData;
  orientation: string;
  highlightedEntityID: string;
  shadingData: ShadingData;
  renderNode?: (
    node: StudyData,
    children: Array<React.ReactElement>
  ) => React.ReactElement | null;
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

export default function ExpandedDiagram({
  treeData,
  orientation,
  highlightedEntityID,
  shadingData,
  renderNode,
}: ExpandedDiagram) {
  const data = hierarchy(treeData);

  return (
    <svg width="1000px" height="1000px">
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
        // Node background definitions
        Array(11)
          .fill(null)
          .map((_, index) => (
            <LinearGradient
              key={index}
              vertical={false}
              x1={0}
              x2={index * 0.1}
              fromOffset={1}
              id={`rect-gradient-${index}`}
              from="#e4c8c8"
              to="white"
            />
          ))
      }
      <Tree root={data} size={[500, 500]}>
        {(tree) => (
          <Group left={80} top={50}>
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
              const shadingObject: undefined | ShadingValues =
                shadingData[node.data.id];
              const width = 120;
              const height = 70;

              const rectangle = (
                <rect
                  height={height}
                  width={width}
                  y={-height / 2}
                  x={-width / 2}
                  fill={`url('#rect-gradient-${
                    shadingObject ? shadingObject.value : 0
                  }')`}
                  stroke={'black'}
                  style={
                    highlightedEntityID == node.data.displayName
                      ? {
                          outline: 'yellow 3px solid',
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
