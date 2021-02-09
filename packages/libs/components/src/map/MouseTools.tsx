import React from 'react';
import '../styles/map_styles.css';

// Add new mouse modes here
const mouseModeConfig = [
  {
    name: 'default',
    icon: 'fa-hand-point-up',
    description: 'Default mouse mode',
  },
  {
    name: 'magnification',
    icon: 'fa-search',
    description: 'Magnification mode: Mouse over a marker to magnify it',
  },
] as const;

const mouseModesArray = mouseModeConfig.map((mode) => mode.name);
export type MouseMode = typeof mouseModesArray[number]; // Union of mode names

export interface MouseToolsProps {
  mouseMode: MouseMode;
  setMouseMode: (mode: MouseMode) => void;
}

export default function MouseTools(props: MouseToolsProps) {
  /**
   * A toolbar with buttons that control how the mouse behaves
   */
  const buttons = mouseModeConfig.map((mode) => {
    return (
      <a
        role="button"
        onClick={() => props.setMouseMode(mode.name)}
        className={
          'mapveu-button' +
          (props.mouseMode === mode.name ? ' mapveu-button-selected' : '')
        }
        title={mode.description}
        key={mode.name}
      >
        <i className={`fas ${mode.icon}`}></i>
      </a>
    );
  });

  return (
    <div className="leaflet-control-container">
      <div className="leaflet-top leaflet-right">
        <span className="mouse-toolbar leaflet-bar mapveu-hori-bar leaflet-control leaflet-touch">
          {buttons}
        </span>
      </div>
    </div>
  );
}
