import { VisualizationProps, VisualizationType } from '../VisualizationTypes';

export const testVisualization: VisualizationType = {
  selectorComponent: SelectorComponent,
  fullscreenComponent: FullscreenComponent,
  createDefaultConfig: () => undefined,
};

function SelectorComponent() {
  return <div>Test in selector</div>;
}

function FullscreenComponent(props: VisualizationProps) {
  return <div>Test in fullscreen</div>;
}
