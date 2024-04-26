// Types required for creating networks
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

export type NetworkPartition = {
  nodeIds: string[];
};

/** Bipartite network data is a regular network with addiitonal declarations of
 * nodes in each of the two columns. IDs in columnXNodeIDs must match node ids exactly.
 */
export type BipartiteNetworkData = {
  partitions: NetworkPartition[];
} & NetworkPlotData;
