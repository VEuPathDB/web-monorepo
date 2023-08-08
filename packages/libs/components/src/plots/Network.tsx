import { DefaultNode, Graph } from '@visx/network';
import { Text } from '@visx/text';
import { Link, NetworkData, Node } from '../types/plots/network';

interface NodeWithLabelProps {
  node: Node;
  onClick?: () => void;
  labelPosition?: 'right' | 'left';
  labelFontSize?: string;
  fontWeight?: number;
  labelColor?: string;
}

// NodeWithLabel creates one node with an optional label. Both the node and
// label can be styled.
export function NodeWithLabel(props: NodeWithLabelProps) {
  const {
    node,
    onClick,
    labelPosition = 'right',
    labelFontSize = '1em',
    fontWeight = 200,
    labelColor = '#000',
  } = props;

  const { color, label, stroke, strokeWidth } = node;

  const nodeRadius = node.r ?? 4;

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
        fill={color ?? '#aaa'}
        onClick={onClick}
        stroke={stroke}
        strokeWidth={strokeWidth ?? 1}
      />
      {/* Note that Text becomes a tspan */}
      <Text
        x={textXOffset}
        textAnchor={textAnchor}
        fontSize={labelFontSize}
        verticalAnchor="middle"
        onClick={onClick}
        fontWeight={fontWeight}
        fill={labelColor}
      >
        {label}
      </Text>
    </>
  );
}

// Link Component
export interface LinkProps {
  link: Link;
  // onClick?: () => void; To add in the future, maybe also some hover action
}

export function Link(props: LinkProps) {
  const { link } = props;

  return (
    <line
      x1={link.source.x}
      y1={link.source.y}
      x2={link.target.x}
      y2={link.target.y}
      strokeWidth={link.strokeWidth ?? 1}
      stroke={link.color ?? '#222'}
      strokeOpacity={link.opacity ?? 0.95}
    />
  );
}
