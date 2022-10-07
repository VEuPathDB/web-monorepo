import { createVisualizationPlugin } from '../VisualizationPlugin';
import selectorIcon from './selectorIcons/BoxSVG';

export const testVisualization = createVisualizationPlugin({
  selectorIcon,
  fullscreenComponent: FullscreenComponent,
  createDefaultConfig: () => undefined,
});

function FullscreenComponent() {
  return <div>Test in fullscreen</div>;
}
