// Types required for creating networks.
// These types are intended to be generally useful for the final plotting
// stage of visualizing networks. They do not attempt to corral any data used
// to define network properties. That role is left to the application and context in which
// these types are used.
export type NetworkNode = {
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

export type NetworkLink = {
  /** The beginning node of the link */
  source: NetworkNode;
  /** The ending node of the link */
  target: NetworkNode;
  /** Link stroke width */
  strokeWidth?: number;
  /** Link color */
  color?: string;
  /** Link opacity. Must be between 0 and 1 */
  opacity?: number;
};

/** Network is the same format accepted by visx's Graph component. */
export type Network = {
  nodes: NetworkNode[];
  links: NetworkLink[];
};

/** Bipartite network data is a regular network with addiitonal declarations of
 * nodes in each of the two columns. IDs in columnXNodeIDs must match node ids exactly.
 */
export type BipartiteNetwork = {
  column1NodeIDs: string[];
  column2NodeIDs: string[];
} & Network;
