import { useState } from 'react';
import { DefaultNode } from '@visx/network';
import { Text } from '@visx/text';
import { NodeData } from '../types/plots/network';
import { truncateWithEllipsis } from '../utils/axis-tick-label-ellipsis';
import './NetworkPlot.css';

export type LabelPosition = 'right' | 'left';

interface NodeWithLabelProps {
  /** Network node */
  node: NodeData;
  /** Function to run when a user clicks either the node or label */
  onClick?: () => void;
  /** Should the label be drawn to the left or right of the node? */
  labelPosition?: LabelPosition;
  /** Font size for the label. Ex. "1em" */
  fontSize?: string;
  /** Font weight for the label */
  fontWeight?: number;
  /** Color for the label */
  labelColor?: string;
  /** Length for labels before being truncated by ellipsis. Default 20 */
  truncationLength?: number;
  /** selected node labels */
  selectedNodeLabels?: (string | undefined)[];
  /** show node labels */
  showNodeLabels?: boolean;
}

// NodeWithLabel draws one node and an optional label for the node. Both the node and
// label can be styled.
export function NodeWithLabel(props: NodeWithLabelProps) {
  const DEFAULT_NODE_RADIUS = 6;
  const DEFAULT_NODE_COLOR = '#fff';
  const DEFAULT_STROKE_WIDTH = 1;
  const DEFAULT_STROKE = '#111';

  const {
    node,
    onClick,
    labelPosition = 'right',
    fontSize = '1em',
    fontWeight = 400,
    labelColor = '#000',
    truncationLength = 20,
    selectedNodeLabels = [''],
    showNodeLabels = false,
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

  // mouse hover state
  const [hover, setHover] = useState(false);

  return (
    <>
      <g onClick={onClick}>
        <DefaultNode
          r={nodeRadius}
          fill={color ?? DEFAULT_NODE_COLOR}
          stroke={stroke ?? DEFAULT_STROKE}
          strokeWidth={strokeWidth ?? DEFAULT_STROKE_WIDTH}
          className="NodeWithLabel_Node"
          // hover event
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        />
        {/* Note that Text becomes a tspan */}
        <Text
          x={textXOffset}
          textAnchor={textAnchor}
          fontSize={fontSize}
          verticalAnchor="middle"
          fontWeight={fontWeight}
          fill={labelColor}
          id="NodeLabelText"
          style={{
            cursor: 'ponter',
            zIndex: 1000,
            backgroundColor: 'red',
            display:
              label && showNodeLabels && selectedNodeLabels.includes(label)
                ? 'block'
                : hover
                ? 'block'
                : 'none',
          }}
        >
          {label && truncateWithEllipsis(label, truncationLength)}
        </Text>
        <title>{label}</title>
      </g>
      {/* <use xlinkHref=".NodeLables" /> */}
    </>
  );
}
