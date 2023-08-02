// Types required for creating networks
export type Node = {
  x?: number; // Maybe if these aren't provided then the network just puts the nodes in a circle?
  y?: number;
  color?: string;
  r?: number;
  id: string;
  label?: string;
  stroke?: string;
  strokeWidth?: number;
};

export type Link = {
  source: Node;
  target: Node;
  strokeWidth: number;
  color: string;
  opacity: number;
};

export type NetworkData = {
  nodes: Node[];
  links: Link[];
};

export type BipartiteNetworkData = {
  column1NodeIDs: string[];
  column2NodeIDs: string[];
} & NetworkData;
