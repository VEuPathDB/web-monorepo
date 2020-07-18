export type EdgeType = 'O' | 'C' | 'P' | 'L' | 'M' | 'N';

export const edgeTypeDisplayNames: Record<EdgeType, string> = {
  'O': 'Ortholog',
  'C': 'Coortholog',
  'P': 'Inparalog',
  'L': 'PeripheralCore',
  'M': 'PeripheralPeripheral',
  'N': 'Normal'
};
