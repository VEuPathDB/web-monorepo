import { createVisualizationPlugin } from '../VisualizationPlugin';
import { VisualizationProps } from '../VisualizationTypes';
import selectorIcon from './selectorIcons/box.svg';

export const testVisualization = createVisualizationPlugin({
  selectorIcon,
  fullscreenComponent: FullscreenComponent,
  createDefaultConfig: () => undefined,
});

function FullscreenComponent(props: VisualizationProps) {
  return <div>Test in fullscreen</div>;
}
