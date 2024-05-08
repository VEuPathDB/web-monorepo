import { LabelPosition } from '../../plots/Node';

// Types required for creating networks
import { ReactNode } from 'react';

export interface NodeMenuAction {
  label: ReactNode;
  onClick?: () => void;
  href?: string;
}

export type NodeData = {
  /** Node ID. Must be unique in the network! */
  id: string;
  /** The x coordinate of the node */
  x?: number;
  /** The y coordinate of the node */
  y?: number;
  /** Node color */
  color?: string;
  /** Node radius */
  r?: number;
  /** User-friendly node label */
  label?: string;
  /** Color for the stroke of the node */
  stroke?: string;
  /** Width of node stroke */
  strokeWidth?: number;
  /** Should the node label be drawn to the right or left of the node? */
  labelPosition?: LabelPosition;
  /** Action menu items for the node */
  actions?: NodeMenuAction[];
};

export type LinkData = {
  /** The beginning node of the link */
  source: NodeData;
  /** The ending node of the link */
  target: NodeData;
  /** Link stroke width */
  strokeWidth?: number;
  /** Link color */
  color?: string;
  /** Link opacity. Must be between 0 and 1 */
  opacity?: number;
};

/** NetworkData is the same format accepted by visx's Graph component. */
export type NetworkPlotData = {
  nodes: NodeData[];
  links: LinkData[];
};

/** Bipartite network data is a regular network with addiitonal declarations of
 * nodes in each of the two columns.
 */
export type NetworkPartition = {
  /** Ids that allow us to match node ids in NodeData[] of a NetworkPlotData object to this partition. */
  nodeIds: string[];
  /** Name of the partition. Ex. "Species" */
  name?: string;
};
export type BipartiteNetworkData = {
  partitions: NetworkPartition[];
} & NetworkPlotData;
