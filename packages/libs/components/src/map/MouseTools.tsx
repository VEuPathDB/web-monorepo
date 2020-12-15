import React, {useState, CSSProperties, ReactElement} from "react";
import '../styles/map_styles.css';
// import { MapControl } from 'react-leaflet';

const mouseModeConfig = [
  {
    name: 'default',
    icon: 'fa-hand-point-up',
  },
  {
    name: 'magnification',
    icon: 'fa-search-plus',
  },
] as const;

const mouseModesArray = mouseModeConfig.map(mode => mode.name);
export type MouseMode = (typeof mouseModesArray)[number];  // Union of mode names

export interface MouseToolsProps {
  mouseMode: MouseMode,
  setMouseMode: (mode: MouseMode) => void,
}

export default function MouseTools(props: MouseToolsProps) {
  const buttons = mouseModeConfig.map((mode) => {
    return (
      <a role="button"
        onClick={() => props.setMouseMode(mode.name)}
        className={'mapveu-button' + (props.mouseMode === mode.name ? ' mapveu-button-selected' : '')}
        key={mode.name}
      >
        <i className={`fas ${mode.icon}`}></i>
      </a>
    );
  });

  return (
    // <MapControl position='topright'>
    <div className="leaflet-control-container">
      <div className="leaflet-top leaflet-right">
        <span className="mouse-toolbar leaflet-bar mapveu-hori-bar leaflet-control leaflet-touch">
          {buttons}
        </span>
      </div>
    </div>
    // </MapControl>
  );
}
