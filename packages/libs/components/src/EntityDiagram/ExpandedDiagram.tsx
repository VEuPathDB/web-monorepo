import React, {Fragment} from 'react';

import {hierarchy, Tree} from "@visx/hierarchy";
import {LinearGradient} from "@visx/gradient";
import {Group} from "@visx/group";
import {Line, LinkHorizontalLine, LinkVerticalLine} from "@visx/shape";
import {Text} from "@visx/text";

interface Variables {
  id: string
  providerLabel: string
  displayName: string
  type: string
  isContinuous?: boolean
  precision?: number
  units?: string
}

interface StudyData {
  id: string
  displayName: string
  description: string
  children?: this[],
  variables?: Variables[]
}

interface ShadingData {
  entityId: string
  value: number
  color?: string
}

interface ExpandedDiagram {
  treeData: StudyData
  orientation: string
  highlightedEntityID: string
  shadingData: ShadingData[]
}



// Todo: There MUST be a smarter way to center the text
function CalculateDYSize(nodeLength: number) {
  switch (nodeLength) {
    case 1:
      return '.33em'
    case 2:
      return '.80em'
    case 3:
      return '1.35em'
    case 4:
      return '1.8em'
    case 5:
      return '1.8em'
  }
}

export default function MiniDiagram({treeData, orientation, highlightedEntityID, shadingData}: ExpandedDiagram) {
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
        >
          <path d="M0,-5L10,0L0,5" />
        </marker>
      </defs>

      {/* TODO: Background definitions: Please change this if you can think of a better way! :) */}
      <LinearGradient vertical={false} x1={0} x2={0} fromOffset={1} id="rect-gradient-0" from="#e4c8c8" to="white" />
      <LinearGradient vertical={false} x1={0} x2={.1} fromOffset={1} id="rect-gradient-1" from="#e4c8c8" to="white" />
      <LinearGradient vertical={false} x1={0} x2={.2} fromOffset={1} id="rect-gradient-2" from="#e4c8c8" to="white" />
      <LinearGradient vertical={false} x1={0} x2={.3} fromOffset={1} id="rect-gradient-3" from="#e4c8c8" to="white" />
      <LinearGradient vertical={false} x1={0} x2={.4} fromOffset={1} id="rect-gradient-4" from="#e4c8c8" to="white" />
      <LinearGradient vertical={false} x1={0} x2={.5} fromOffset={1} id="rect-gradient-5" from="#e4c8c8" to="white" />
      <LinearGradient vertical={false} x1={0} x2={.6} fromOffset={1} id="rect-gradient-6" from="#e4c8c8" to="white" />
      <LinearGradient vertical={false} x1={0} x2={.7} fromOffset={1} id="rect-gradient-7" from="#e4c8c8" to="white" />
      <LinearGradient vertical={false} x1={0} x2={.8} fromOffset={1} id="rect-gradient-8" from="#e4c8c8" to="white" />
      <LinearGradient vertical={false} x1={0} x2={.9} fromOffset={1} id="rect-gradient-9" from="#e4c8c8" to="white" />
      <LinearGradient vertical={false} x1={0} x2={1} fromOffset={1} id="rect-gradient-10" from="#e4c8c8" to="white" />

      <Tree
        root={data}
        size={[500, 500]}
      >
        {tree => (
          <Group left={80} top={50}>
            {tree.links().map((link, i)=> {
              let to, from;
              // Determine a new end location for the lines. The default is to end in the middle of
              // the target node.
              if (orientation == 'horizontal') {
                to = {
                  x: ((link.target.y - link.source.y) * .45) + link.source.y,
                  y: ((link.target.x - link.source.x) * .45) + link.source.x
                }
                from = {x: link.source.y, y: link.source.x}
              }
              else {
                to = {
                  x: ((link.target.x - link.source.x) * .6) + link.source.x,
                  y: ((link.target.y - link.source.y) * .6) + link.source.y
                }
                from={x: link.source.x, y: link.source.y}
              }

              return <Line
                to={to}
                from={from}
                stroke="black"
                markerEnd="url(#arrow)"
                key={`link-${i}`}
              />
            })}
            {tree.descendants().map((node, i) => {
              const shadingObject: undefined | ShadingData = shadingData.find(o => o.entityId === node.data.id);
              const width = 120;
              const height = 70;

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
                  fill={`url('#rect-gradient-${shadingObject ? shadingObject.value : 0}')`}
                  stroke={"black"}
                  style={highlightedEntityID == node.data.displayName ? {'outline': 'yellow 3px solid', 'overflowWrap': 'normal' } : {'overflowWrap': 'normal'} }
                />
                <Text
                  fontSize={12}
                  textAnchor={"middle"}
                  style={{'cursor': 'default'}}
                  dy={CalculateDYSize(node.data.displayName.split(' ').length)}
                  width={100}
                >
                  {node.data.displayName}
                </Text>
              </Group>)
            })}
          </Group>
        )}
      </Tree>
    </svg>
  )
}
