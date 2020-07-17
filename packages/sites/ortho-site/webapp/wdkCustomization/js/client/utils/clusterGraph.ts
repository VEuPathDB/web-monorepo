export type EdgeType = 'O' | 'C' | 'P' | 'L' | 'M' | 'N';

export const edgeTypeDisplayNames: Record<EdgeType, string> = {
  'O': 'Ortholog',
  'C': 'Coortholog',
  'P': 'Inparalog',
  'L': 'PeripheralCore',
  'M': 'PeripheralPeripheral',
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
