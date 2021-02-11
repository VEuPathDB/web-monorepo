import React from 'react';

export type EdgeType = 'O' | 'C' | 'P' | 'L' | 'M' | 'N';

export const edgeTypeDisplayNames: Record<EdgeType, string> = {
  'O': 'Ortholog',
  'C': 'Coortholog',
  'P': 'Inparalog',
  'L': 'Peripheral-Core',
  'M': 'Peripheral-Peripheral',
  'N': 'Other Similarities'
};

export const edgeTypeOptionOrder: EdgeType[] = [
  'O',
  'C',
  'P',
  'L',
  'M',
  'N'
];

export const initialEdgeTypeSelections: Record<EdgeType, boolean> = {
  O: true,
  C: true,
  P: true,
  L: true,
  M: true,
  N: false
};

export interface EdgeTypeOption {
  key: EdgeType;
  display: string;
  isSelected: boolean;
  onChange: (selected: boolean) => void;
  onMouseOver: () => void;
  onMouseOut: () => void;
}

export type NodeDisplayType = 'taxa' | 'ec-numbers' | 'pfam-domains' | 'core-peripheral';

export const nodeDisplayTypeDisplayNames: Record<NodeDisplayType, string> = {
  'taxa': 'Taxa',
  'ec-numbers': 'EC Numbers',
  'pfam-domains': 'PFam Domains',
  'core-peripheral': 'Core/Peripheral'
};

export const nodeDisplayTypeOrder: NodeDisplayType[] = [
  'taxa',
  'ec-numbers',
  'pfam-domains',
  'core-peripheral'
];

export type ProteinType = 'Core' | 'Peripheral';

export const corePeripheralLegendOrder: ProteinType[] = [
  'Core',
  'Peripheral'
];

export const corePeripheralLegendColors: Record<ProteinType, string> = {
  Core: '#0000FF',
  Peripheral: '#FFFFFF'
};

export const PAGE_TITLE_HELP = (
  <div>
    This graph shows the sequence relatedness of the proteins in this ortholog group. Proteins are represented by Nodes (circles) while protein-protein relationships are represented by edges (lines connecting circles). Shorter edges indicate higher relatedness (i.e., better Blast score). Click on a node to view detailed information about the protein in the "Node Details" panel. Mouse over an edge to view the protein names, edge type, and blast score.
  </div>
);

export const EDGE_OPTIONS_HELP = (
  <div>
    Choose an edge type or use the Blast score slider to control which edges are shown on the graph.
  </div>
);

export const NODE_OPTIONS_HELP = (
  <div>
    Change the "Show Nodes By" option to control the coloring of the nodes. With the "Taxa" option selected, mouse over each taxon in the legend to show organism information and to highlight nodes on the graph. With the "PFam Domains" option selected, mouse over each domain in the legend to show domain full names.
  </div>
);

export const SEQUENCE_LIST_HELP = (
  <div>
    This tab lists all the proteins in this ortholog group. Mouse over the protein row to highlight the node in the graph.
  </div>
);

export const NODE_DETAILS_HELP = (
  <div>
    This tab presents all of the edges, PFam Domains, and EC numbers of a selected Node (protein).
  </div>
);
