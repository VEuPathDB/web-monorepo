import { VisualizationProps, VisualizationType } from '../VisualizationTypes';

export const testVisualization: VisualizationType = {
  type: 'test',
  displayName: 'Test visualization',
  gridComponent: GridComponent,
  selectorComponent: SelectorComponent,
  fullscreenComponent: FullscreenComponent,
  createDefaultConfig: () => undefined,
};

function GridComponent(props: VisualizationProps) {
  return <div>Test in grid</div>;
}

function SelectorComponent() {
  return <div>Test in selector</div>;
}

function FullscreenComponent(props: VisualizationProps) {
  return <div>Test in fullscreen</div>;
}
