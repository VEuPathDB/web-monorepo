import { DefaultNode } from '@visx/network';
import { Text } from '@visx/text';
import { LinkData, NodeData } from '../types/plots/network';

interface NodeWithLabelProps {
  /** Network node */
  node: NodeData;
  /** Function to run when a user clicks either the node or label */
  onClick?: () => void;
  /** Should the label be drawn to the left or right of the node? */
  labelPosition?: 'right' | 'left';
  /** Font size for the label. Ex. "1em" */
  fontSize?: string;
  /** Font weight for the label */
  fontWeight?: number;
  /** Color for the label */
  labelColor?: string;
}

// NodeWithLabel draws one node and an optional label for the node. Both the node and
// label can be styled.
export function NodeWithLabel(props: NodeWithLabelProps) {
  const DEFAULT_NODE_RADIUS = 4;
  const DEFAULT_NODE_COLOR = '#aaa';
  const DEFAULT_STROKE_WIDTH = 1;

  const {
    node,
    onClick,
    labelPosition = 'right',
    fontSize = '1em',
    fontWeight = 200,
    labelColor = '#000',
  } = props;

  const { color, label, stroke, strokeWidth } = node;

  const nodeRadius = node.r ?? DEFAULT_NODE_RADIUS;

  // Calculate where the label should be posiitoned based on
  // total size of the node.
  let textXOffset: number;
  let textAnchor: 'start' | 'end';

  if (labelPosition === 'right') {
    textXOffset = 4 + nodeRadius;
    if (strokeWidth) textXOffset = textXOffset + strokeWidth;
    textAnchor = 'start';
  } else {
    textXOffset = -4 - nodeRadius;
    if (strokeWidth) textXOffset = textXOffset - strokeWidth;
    textAnchor = 'end';
  }

  return (
    <>
      <DefaultNode
        r={nodeRadius}
        fill={color ?? DEFAULT_NODE_COLOR}
        onClick={onClick}
        stroke={stroke}
        strokeWidth={strokeWidth ?? DEFAULT_STROKE_WIDTH}
      />
      {/* Note that Text becomes a tspan */}
      <Text
        x={textXOffset}
        textAnchor={textAnchor}
        fontSize={fontSize}
        verticalAnchor="middle"
        onClick={onClick}
        fontWeight={fontWeight}
        fill={labelColor}
        style={{ cursor: 'pointer' }}
      >
        {label}
      </Text>
    </>
  );
}

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
