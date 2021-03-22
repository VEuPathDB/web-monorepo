export type VariableType =
  | 'category'
  | 'string'
  | 'number'
  | 'date'
  | 'longitude';

export interface Variables {
  id: string;
  providerLabel: string;
  displayName: string;
  type: VariableType;
  isContinuous?: boolean;
  precision?: number;
  units?: string;
  isMultiValued: boolean;
}

export interface StudyData {
  id: string;
  displayName: string;
  description: string;
  children?: this[];
  variables: Variables[];
}

export type ShadingValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface ShadingValues {
  /** The portion of the rectangle to shade (0: 0%, 1: 10%, ... 10: 100%) */
  value: ShadingValue;
  // color?: string;  // Not implemented yet
}

export interface ShadingData {
  /** The key should be the entity ID */
  [index: string]: ShadingValues;
}

export interface EntityDiagramProps {
  /** Data that defines the tree structure */
  treeData: StudyData;
  /** Which direction the tree is oriented */
  orientation: 'horizontal' | 'vertical';
  /** Which entity to highlight */
  highlightedEntityID: string;
  /** Data defining the background shading of each node */
  shadingData: ShadingData;
  /** An optional function returning the element to render for a node given its data */
  renderNode?: (
    node: StudyData,
    children?: Array<React.ReactElement>
  ) => React.ReactElement | null;
  // size: {}
}
