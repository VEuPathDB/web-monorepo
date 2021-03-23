import React, { useState } from 'react';
import { hierarchy, Tree } from '@visx/hierarchy';
import { Group } from '@visx/group';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import OffsetLine from './OffsetLine';
import { StudyData } from './Types';
import { Tooltip } from '@visx/tooltip';
import { LinearGradient } from '@visx/gradient';
import { EntityDiagramProps, ShadingValues } from './Types';

interface CustomNode {
  node: HierarchyPointNode<StudyData>;
}

export default function MiniDiagram({
  treeData,
  orientation,
  highlightedEntityID,
  shadingData,
  renderNode,
  size,
}: EntityDiagramProps) {
  const data = hierarchy(treeData);
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);
  const [tooltipLeft, setTooltipLeft] = useState<number>(0);
  const [tooltipTop, setTooltipTop] = useState<number>(0);
  const [tooltipNode, setTooltipNode] = useState<null | HierarchyPointNode<
    StudyData
  >>(null);

  const nodeWidth = 30;
  const nodeHeight = 20;
  const nodeStrokeWidth = 1;
  const treeWidth = orientation === 'horizontal' ? size.height : size.width;
  const treeHeight =
    orientation === 'horizontal'
      ? size.width - nodeWidth
      : size.height - nodeHeight;
  const treeLeft = orientation === 'horizontal' ? nodeWidth / 2 : 0;
  const treeTop = orientation === 'horizontal' ? 0 : nodeHeight / 2;

  function CustomNode({ node }: CustomNode) {
    // get acronym of displayName
    const matches = node.data.displayName.match(/\b(\w)/g);
    //DKDK could use ! or ? to avoid ts error, but used ? here (optional chaining)
    const displayNameAcronym = matches?.join('');

    const handleTooltipOpen = () => {
      const topOffset = orientation == 'horizontal' ? 30 : 80; // offsets are based on margins
      const leftOffset = orientation == 'horizontal' ? 95 : 55; // offsets are based on margins
      setTooltipOpen(true);
      setTooltipLeft(
        (orientation == 'horizontal' ? node.y : node.x) + leftOffset
      );
      setTooltipTop(
        (orientation == 'horizontal' ? node.x : node.y) + topOffset
      );
      setTooltipNode(node);
    };

    const shadingObject: undefined | ShadingValues = shadingData[node.data.id];

    const rectangle = (
      <rect
        height={nodeHeight - nodeStrokeWidth * 2}
        width={nodeWidth - nodeStrokeWidth * 2}
        y={-nodeHeight / 2}
        x={-nodeWidth / 2}
        fill={`url('#rect-gradient-${
          shadingObject ? shadingObject.value : 0
        }')`}
        stroke={'black'}
        strokeWidth={nodeStrokeWidth}
        style={
          highlightedEntityID == node.data.displayName
            ? { cursor: 'pointer', outline: 'yellow 3px solid' }
            : { cursor: 'pointer' }
        }
        onMouseEnter={() => handleTooltipOpen()}
        onMouseLeave={() => setTooltipOpen(false)}
      />
    );

    const text = (
      <text
        fontSize={12}
        textAnchor="middle"
        style={{ cursor: 'pointer' }}
        dy=".33em"
        onMouseEnter={() => handleTooltipOpen()}
        onMouseLeave={() => setTooltipOpen(false)}
      >
        {displayNameAcronym}
      </text>
    );

    return (
      <Group
        top={orientation == 'horizontal' ? node.x : node.y}
        left={orientation == 'horizontal' ? node.y : node.x}
      >
        {renderNode?.(node.data, [rectangle, text]) ?? [rectangle, text]}
      </Group>
    );
  }

  return (
    <div className="mini-diagram">
      <svg width={size.width} height={size.height}>
        <defs>
          <marker
            id="arrow"
            viewBox="0 -5 10 10"
            markerWidth="10"
            markerHeight="10"
            orient="auto"
            fill="black"
            style={{ opacity: 0.7 }}
          >
            <path d="M0,-5L10,0L0,5" />
          </marker>
        </defs>
        {
          // Node background shading definitions
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
        <Tree root={data} size={[treeWidth, treeHeight]}>
          {(tree) => (
            <Group left={treeLeft} top={treeTop}>
              {tree.links().map((link, i) => {
                return (
                  <OffsetLine
                    link={link}
                    orientation={orientation}
                    key={`link-${i}`}
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
      {tooltipOpen && tooltipNode && (
        <Tooltip left={tooltipLeft} top={tooltipTop}>
          <div>{tooltipNode.data.displayName}</div>
        </Tooltip>
      )}
    </div>
  );
}
