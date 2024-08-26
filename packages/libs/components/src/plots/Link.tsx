import { LinkData } from '../types/plots/network';

export interface LinkProps {
  link: LinkData;
  // onClick?: () => void; To add in the future, maybe also some hover action
}

// Link component draws a linear edge between two nodes.
// Eventually can grow into drawing directed edges (edges with arrows) when the time comes.
export function Link(props: LinkProps) {
  const DEFAULT_LINK_WIDTH = 1;
  const DEFAULT_COLOR = '#222';
  const DEFAULT_OPACITY = 0.95;

  const { link } = props;

  return (
    <line
      x1={link.source.x}
      y1={link.source.y}
      x2={link.target.x}
      y2={link.target.y}
      strokeWidth={link.strokeWidth ?? DEFAULT_LINK_WIDTH}
      stroke={link.color ?? DEFAULT_COLOR}
      strokeOpacity={link.opacity ?? DEFAULT_OPACITY}
    />
  );
}
