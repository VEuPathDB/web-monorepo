import { MapTypePlugin } from '../types';

const displayName = 'Bar plots';

export const plugin: MapTypePlugin = {
  displayName,
  ConfigPanelComponent,
  MapLayerComponent,
  MapOverlayComponent,
  MapTypeHeaderDetails,
};

function ConfigPanelComponent() {
  return <div>I am a config component</div>;
}

function MapLayerComponent() {
  return <div>I am a map layer component</div>;
}

function MapOverlayComponent() {
  return <div>I am a map overlay component</div>;
}

function MapTypeHeaderDetails() {
  return <div>I am a map type header details component</div>;
}
