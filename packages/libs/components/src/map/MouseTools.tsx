import React, {useState, CSSProperties, ReactElement} from "react";
// import { MapControl } from 'react-leaflet';

export type MouseMode = 'default' | 'magnification';

interface Props {
  clickHandler: (mode: MouseMode) => void,
}

export default function MouseTools({clickHandler}: Props) {
  return (
    // <MapControl position='topright'>
    <div className="leaflet-control-container">
      <div className="leaflet-top leaflet-right">
        <div className="mouse-toolbar leaflet-bar leaflet-control leaflet-touch">
          <a role="button" onClick={() => clickHandler('default')}><i className="fas fa-hand-point-up"></i></a>
          <a role="button" onClick={() => clickHandler('magnification')}><i className="fas fa-search-plus"></i></a>
        </div>
      </div>
    </div>
    // </MapControl>
  );
}
