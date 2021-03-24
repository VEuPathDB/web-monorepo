import { App, Visualization } from '../../types/visualization';

/**
 * Props passed to viz components
 */
export interface VizProps {
  visualization: Visualization;
  app: App;
}

export interface VisualizationType {
  type: string;
  displayName: string;
  gridComponent: React.ComponentType<VizProps>;
  fullscreenComponent: React.ComponentType<VizProps>;
  selectorComponent: React.ComponentType;
  createDefaultConfig: () => unknown;
}
