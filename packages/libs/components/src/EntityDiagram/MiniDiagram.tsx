import React from 'react';
import {hierarchy, Tree} from "@visx/hierarchy";
import {Group} from "@visx/group";
import {LinkHorizontalLine, LinkVerticalLine} from "@visx/shape";
import {HierarchyPointNode, HierarchyPointLink} from "@visx/hierarchy/lib/types";

interface TreeData {
  name: string;
  children?: this[];
}

interface MiniDiagram {
  treeData: TreeData,
  orientation: string,
  highlightedEntityID: string
}

interface CustomNode {
  node: HierarchyPointNode<TreeData>
}

interface CustomHorizontalLinkLine {
  link: HierarchyPointLink<TreeData>
}


export default function MiniDiagram({treeData, orientation, highlightedEntityID}: MiniDiagram) {
  const data = hierarchy(treeData);

  function CustomNode({node}: CustomNode) {
    const width = 30;
    const height = 20;

    return (
      <Group
        top={orientation == 'horizontal' ? node.x : node.y}
        left={orientation == 'horizontal' ? node.y : node.x}
      >
        <rect
          height={height}
          width={width}
          y={-height / 2}
          x={-width / 2}
          fill={"white"}
          stroke={"black"}
          style={highlightedEntityID == node.data.name ? { 'cursor': 'pointer', 'outline': 'yellow 3px solid' } : {'cursor': 'pointer'} }
        />
        <text
          fontSize={12}
          textAnchor="middle"
          style={{'cursor': 'pointer'}}
          dy=".33em"
        >
          {node.data.name}
        </text>
      </Group>
    )
  }

  function CustomLinkHorizontalLine({link}: CustomHorizontalLinkLine) {
    return (
      <LinkHorizontalLine
        data={link}
        stroke={"black"}
        strokeWidth={1}
        markerEnd="url(#arrow)"
      />
    )
  }

  function CustomLinkVerticalLine({link}: CustomHorizontalLinkLine) {
    return (
      <LinkVerticalLine
        data={link}
        stroke={"black"}
        strokeWidth={1}
        markerEnd="url(#arrow)"
      />
    )
  }

  return (
    <svg width="1000px" height="1000px">
      <defs>
        <marker
          id="arrow"
          viewBox="0 -5 10 10"
          refX={orientation == 'horizontal' ? '26' : "21"}
          markerWidth="10"
          markerHeight="10"
          orient="auto"
          fill="black"
        >
          <path d="M0,-5L10,0L0,5" />
        </marker>
      </defs>
      <Tree
        root={data}
        size={[150, 200]}
      >
        {tree => (
          <Group
              left={orientation == 'horizontal' ? 50 : 10}
              top={orientation == 'horizontal' ? 0 : 50}
          >
            {tree.links().map((link, i)=> (
                orientation == 'horizontal'
                ? <CustomLinkHorizontalLine link={link} key={`link-${i}`}/>
                : <CustomLinkVerticalLine link={link} key={`link-${i}`} />
            ))}
            {tree.descendants().map((node, i) => (
                <CustomNode node={node} key={`node-${i}`}/>
            ))}
          </Group>
        )}
      </Tree>
    </svg>
  )
}