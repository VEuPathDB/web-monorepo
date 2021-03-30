import { Line } from '@visx/shape';
import React from 'react';
import { HierarchyPointLink } from '@visx/hierarchy/lib/types';
import { StudyData } from './EntityDiagram';

interface OffsetLine {
  link: HierarchyPointLink<StudyData>;
  orientation: string;
}

export default function OffsetLine({ link, orientation }: OffsetLine) {
  let to, from;
  if (orientation == 'horizontal') {
    to = {
      x: (link.target.y - link.source.y) * 0.5 + link.source.y,
      y: (link.target.x - link.source.x) * 0.5 + link.source.x,
    };
    from = { x: link.source.y, y: link.source.x };
  } else {
    to = {
      x: (link.target.x - link.source.x) * 0.6 + link.source.x,
      y: (link.target.y - link.source.y) * 0.6 + link.source.y,
    };
    from = { x: link.source.x, y: link.source.y };
  }

  return <Line to={to} from={from} stroke="black" markerEnd="url(#arrow)" />;
}
