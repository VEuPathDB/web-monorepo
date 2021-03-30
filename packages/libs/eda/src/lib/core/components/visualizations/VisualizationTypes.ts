import { Filter } from '../../types/filter';
import { Computation, Visualization } from '../../types/visualization';

/**
 * Props passed to viz components
 */
export interface VisualizationProps {
  visualization: Visualization;
  updateVisualization?: (newViz: Visualization) => void;
  computation: Computation;
  filters: Filter[];
}

export interface VisualizationType {
  type: string;
  displayName: string;
  gridComponent: React.ComponentType<VisualizationProps>;
  fullscreenComponent: React.ComponentType<VisualizationProps>;
  selectorComponent: React.ComponentType;
  createDefaultConfig: () => unknown;
}
