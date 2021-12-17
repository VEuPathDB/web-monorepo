import { VisualizationProps, VisualizationType } from '../VisualizationTypes';
import map from './selectorIcons/map.svg';

export const mapVisualization: VisualizationType = {
  selectorComponent: SelectorComponent,
  fullscreenComponent: FullscreenComponent,
  createDefaultConfig: createDefaultConfig,
};

function SelectorComponent() {
  return (
    <img alt="Box plot" style={{ height: '100%', width: '100%' }} src={map} />
  );
}

function FullscreenComponent() {
  return <div>Coming soon!</div>;
}

function createDefaultConfig() {
  return {};
}
