import {
  BipartiteNetworkData,
  NetworkPartition,
  NodeData,
} from '../types/plots/network';
import { partition } from 'lodash';
import { LabelPosition } from './Node';
import { Ref, forwardRef, useMemo, SVGAttributes } from 'react';
import { gray } from '@veupathdb/coreui/lib/definitions/colors';
import { Text } from '@visx/text';

import './BipartiteNetworkPlot.css';
import NetworkPlot, { NetworkPlotProps } from './NetworkPlot';

export interface BipartiteNetworkSVGStyles extends SVGAttributes<SVGElement> {
  topPadding?: number; // space between the top of the svg and the top-most node
  nodeSpacing?: number; // space between vertically adjacent nodes
  columnPadding?: number; // space between the left of the svg and the left column, also the right of the svg and the right column.
}

export interface BipartiteNetworkPlotProps extends NetworkPlotProps {
  /** Partitions. An array of NetworkPartitions (an array of node ids and optional name) that defines the two node groups */
  partitions: NetworkPartition[] | undefined;
  /** bipartite network-specific styling for the svg itself. These
   * properties will override any adaptation the network may try to do based on the container styles.
   */
  svgStyleOverrides?: BipartiteNetworkSVGStyles;
}

const DEFAULT_TOP_PADDING = 40;
const DEFAULT_NODE_SPACING = 30;
const DEFAULT_SVG_WIDTH = 400;

// Show a few gray nodes when there is no real data.
const EmptyBipartiteNetworkData: BipartiteNetworkData = {
  partitions: [
    { nodeIds: ['0', '1', '2', '3', '4', '5'], name: '' },
    { nodeIds: ['6', '7', '8'], name: '' },
  ],
  nodes: [...Array(9).keys()].map((item) => ({
    id: item.toString(),
    color: gray[100],
    stroke: gray[300],
    y: item < 6 ? 40 + 30 * item : 40 + 30 * (item - 6),
  })),
  links: [],
};

// The BipartiteNetworkPlot function takes a network w two partitions of nodes and draws those partitions as columns.
// This component handles the positioning of each column, and consequently the positioning of nodes and links.
// The BipartiteNetworkPlot effectively wraps NetworkPlot by using the 'partitions' argument
// to layout the network and assigning helpful defaults.
function BipartiteNetworkPlot(
  props: BipartiteNetworkPlotProps,
  ref: Ref<HTMLDivElement>
) {
  const {
    nodes = EmptyBipartiteNetworkData.nodes,
    links = EmptyBipartiteNetworkData.links,
    partitions = EmptyBipartiteNetworkData.partitions,
    containerStyles,
    svgStyleOverrides,
  } = props;

  // Set up styles for the bipartite network and incorporate overrides
  const svgStyles = {
    width: Number(containerStyles?.width) || DEFAULT_SVG_WIDTH,
    height:
      Math.max(partitions[1].nodeIds.length, partitions[0].nodeIds.length) *
        DEFAULT_NODE_SPACING +
      DEFAULT_TOP_PADDING,
    topPadding:
      partitions[0].name || partitions[1].name ? 60 : DEFAULT_TOP_PADDING,
    nodeSpacing: DEFAULT_NODE_SPACING,
    columnPadding: 100,
    ...svgStyleOverrides,
  };

  const column1Position = svgStyles.columnPadding;
  const column2Position = Number(svgStyles.width) - svgStyles.columnPadding;

  // Assign coordinates to each node
  // We'll draw the bipartite network in two columns. Nodes in the first partition will
  // get drawn in the left column, and nodes in the second partition will get drawn in the right column.
  const nodesWithCoordinates = useMemo(
    () =>
      nodes.map((node) => {
        // Determine if the node is in the left or right partition (partitionIndex = 0 or 1, respectively)
        const partitionIndex = partitions[0].nodeIds.includes(node.id) ? 0 : 1;
        const nodeIndexInPartition = partitions[
          partitionIndex
        ].nodeIds.findIndex((id) => id === node.id);

        return {
          // Recall partitionIndex = 0 refers to the left-column nodes whereas 1 refers to right-column nodes
          x: partitionIndex === 0 ? column1Position : column2Position,
          y:
            svgStyles.topPadding + svgStyles.nodeSpacing * nodeIndexInPartition,
          labelPosition:
            partitionIndex === 0 ? 'left' : ('right' as LabelPosition),
          ...node,
        };
      }),
    [
      nodes,
      partitions,
      column1Position,
      column2Position,
      svgStyles.nodeSpacing,
      svgStyles.topPadding,
    ]
  );

  // Create column labels if any exist
  const leftColumnLabel = partitions[0].name && (
    <Text
      x={column1Position}
      y={svgStyles.topPadding / 2}
      textAnchor="end"
      className="BipartiteNetworkPartitionTitle"
    >
      {partitions[0].name}
    </Text>
  );
  const rightColumnLabel = partitions[1].name && (
    <Text
      x={column2Position}
      y={svgStyles.topPadding / 2}
      textAnchor="start"
      className="BipartiteNetworkPartitionTitle"
    >
      {partitions[1].name}
    </Text>
  );

  return (
    <NetworkPlot
      {...props}
      nodes={nodesWithCoordinates}
      links={links}
      annotations={[leftColumnLabel, rightColumnLabel]}
      svgStyleOverrides={svgStyles}
      ref={ref}
    />
  );
}

export default forwardRef(BipartiteNetworkPlot);
