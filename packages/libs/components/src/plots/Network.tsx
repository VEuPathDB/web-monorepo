import {
  CSSProperties,
  forwardRef,
  Ref,
  useImperativeHandle,
  useRef,
} from 'react';
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
export function NodeWithLabel(props: NodeWithLabelProps) {
  const { node, onClick, labelPosition = 'right' } = props;

  // @ANN set some default consts like node.r

  const { x, y, id, label } = node;

  // Calculate some things for the text label
  let textX: number;
  let textY: number = 0;
  let textAnchor: 'start' | 'end';

  if (labelPosition === 'right') {
    textX = 4;
    if (node.r) textX = textX + node.r;
    if (node.strokeWidth) textX = textX + node.strokeWidth;
    textAnchor = 'start';
  } else {
    textX = -4;
    if (node.r) textX = textX - node.r;
    if (node.strokeWidth) textX = textX - node.strokeWidth;
    textAnchor = 'end';
  }

  return (
    <>
      <DefaultNode
        r={node.r ?? 4}
        fill={node.color ?? '#aaa'}
        onClick={onClick}
        stroke={node.strokeColor}
        strokeWidth={node.strokeWidth ?? 1}
      />
      <Text
        x={textX}
        y={textY}
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
