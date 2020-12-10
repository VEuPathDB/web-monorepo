import React from 'react';
import {hierarchy, Tree} from "@visx/hierarchy";
import {Group} from "@visx/group";
import {HierarchyPointNode} from "@visx/hierarchy/lib/types";
import OffsetLine from "./OffsetLine";

export interface Variables {
  id: string
  providerLabel: string
  displayName: string
  type: string
  isContinuous?: boolean
  precision?: number
  units?: string
}

export interface StudyData {
  id: string
  displayName: string
  description: string
  children?: this[],
  variables?: Variables[]
}

interface MiniDiagram {
  treeData: StudyData,
  orientation: string,
  highlightedEntityID: string
}

interface CustomNode {
  node: HierarchyPointNode<StudyData>
}

export default function MiniDiagram({treeData, orientation, highlightedEntityID}: MiniDiagram) {
  const data = hierarchy(treeData);

  function CustomNode({node}: CustomNode) {
    const width = 30;
    const height  = 20;

    // get acronym of displayName
    const matches = node.data.displayName.match(/\b(\w)/g);
    const displayNameAcronym = matches.join('');

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
          style={highlightedEntityID == node.data.displayName ? { 'cursor': 'pointer', 'outline': 'yellow 3px solid' } : {'cursor': 'pointer'} }
        />
        <text
          fontSize={12}
          textAnchor="middle"
          style={{'cursor': 'pointer'}}
          dy=".33em"
        >
          {displayNameAcronym}
        </text>
      </Group>
    )
  }

  return (
    <svg width="1000px" height="1000px">
      <defs>
        <marker
          id="arrow"
          viewBox="0 -5 10 10"
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
            {tree.links().map((link, i)=> {
              return <OffsetLine
                link={link}
                orientation={orientation }
                key={`link-${i}`}
              />
            })}
            {tree.descendants().map((node, i) => (
                <CustomNode node={node} key={`node-${i}`}/>
            ))}
          </Group>
        )}
      </Tree>
    </svg>
  )
}