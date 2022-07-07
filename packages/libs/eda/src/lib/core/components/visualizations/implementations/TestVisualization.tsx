import { createVisualizationPlugin } from '../VisualizationPlugin';
import { VisualizationProps } from '../VisualizationTypes';

export const testVisualization = createVisualizationPlugin({
  selectorComponent: SelectorComponent,
  fullscreenComponent: FullscreenComponent,
  createDefaultConfig: () => undefined,
});

function SelectorComponent() {
  return <div>Test in selector</div>;
}

function FullscreenComponent(props: VisualizationProps) {
  return <div>Test in fullscreen</div>;
}
