import { DefaultNode } from '@visx/network';
import { Text } from '@visx/text';
import { Node } from '../types/plots/network';

interface NodeWithLabelProps {
  node: Node;
  onClick: () => void;
  labelPosition?: 'right' | 'left';
}

// This should take node color and such. It should do zero thinking except
// for where to place the label.

// To Dos
// [ ] Style text with whatevs
// [ ] Style node with whatevs (maybe onClick gets moved to restProps?)

export function NodeWithLabel(props: NodeWithLabelProps) {
  const { node, onClick, labelPosition = 'right' } = props;

  const { id, label } = node;

  const nodeRadius = node.r ?? 4;

  // Calculate some things for the text label
  let textXOffset: number;
  let textAnchor: 'start' | 'end';

  if (labelPosition === 'right') {
    textXOffset = 4 + nodeRadius;
    if (node.strokeWidth) textXOffset = textXOffset + node.strokeWidth;
    textAnchor = 'start';
  } else {
    textXOffset = -4 - nodeRadius;
    if (node.strokeWidth) textXOffset = textXOffset - node.strokeWidth;
    textAnchor = 'end';
  }

  return (
    <>
      <DefaultNode
        r={nodeRadius}
        fill={node.color ?? '#aaa'}
        onClick={onClick}
        stroke={node.stroke}
        strokeWidth={node.strokeWidth ?? 1}
        // @ANN should just take {...nodeProps or whatevs}
      />
      <Text
        x={textXOffset}
        textAnchor={textAnchor}
        fontSize={'1em'}
        verticalAnchor="middle"
        onClick={onClick}
      >
        {label ?? id}
      </Text>
    </>
  );
}
