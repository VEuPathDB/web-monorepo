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

export interface ShadingData {
  /** The key is the entity ID and the value is a decimal representing the
   * fraction of the node to shade */
  [index: string]: number;
}

export interface EntityDiagramProps {
  /** Data that defines the tree structure */
  treeData: StudyData;
  /** Which direction the tree is oriented */
  orientation: 'horizontal' | 'vertical';
  /** The tree's dimensions. If the tree is horizontal, it may not take up the
   * whole height; if it's vertical, it may not take up the full width. */
  size: {
    height: number;
    width: number;
  };
  /** Which entity to highlight */
  highlightedEntityID: string;
  /** Data defining the background shading of each node */
  shadingData: ShadingData;
  /** An optional function returning the element to render for a node given its
   * data */
  renderNode?: (
    node: StudyData,
    children?: Array<React.ReactElement>
  ) => React.ReactElement | null;
}
