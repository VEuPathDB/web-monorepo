import {Line} from "@visx/shape";
import React from "react";
import {HierarchyPointLink} from "@visx/hierarchy/lib/types";

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
// ToDo: Add StudyData as a global type in a separate file
interface OffsetLine {
  link: HierarchyPointLink<StudyData>
  orientation: string
}
export default function OffsetLine({link, orientation}: OffsetLine){
    let to, from;
    if (orientation == 'horizontal') {
      to = {
        x: ((link.target.y - link.source.y) * .5) + link.source.y,
        y: ((link.target.x - link.source.x) * .5) + link.source.x
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
    />
  }