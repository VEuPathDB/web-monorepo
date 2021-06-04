import { Filter } from '../../types/filter';
import {
  Computation,
  DataElementConstraint,
  Visualization,
  VisualizationOverview,
} from '../../types/visualization';

/**
 * Props passed to viz components
 */
export interface VisualizationProps {
  visualization: Visualization;
  dataElementConstraints?: Record<string, DataElementConstraint>[];
  dataElementDependencyOrder?: string[];
  updateVisualization?: (newViz: Visualization) => void;
  computation: Computation;
  filters: Filter[];
  starredVariables: string[];
  toggleStarredVariable: (targetVariableId: string) => void;
}

export type SelectorProps = VisualizationOverview;

export interface VisualizationType {
  gridComponent: React.ComponentType<VisualizationProps>;
  fullscreenComponent: React.ComponentType<VisualizationProps>;
  selectorComponent: React.ComponentType<SelectorProps>;
  createDefaultConfig: () => unknown;
}
