import React, { useState } from "react";
import { MapVEuMapProps } from "./Types";
import { Viewport, Map, TileLayer } from "react-leaflet";
import SemanticMarkers from "./SemanticMarkers";
import 'leaflet/dist/leaflet.css';


/**
 * Renders a Leaflet map with semantic zooming markers
 * 
 * 
 * @param props 
 */
export default function MapVEuMap({ viewport, height, width, onViewportChanged, markers }: MapVEuMapProps) {

  // this is the React Map component's onViewPortChanged handler
  // we may not need to use it.
  // onViewportchanged in SemanticMarkers is more relevant
  // because it can access the map's bounding box (aka bounds)
  // which is useful for fetching data to show on the map.
  // The Viewport info (center and zoom) handled here would be useful for saving a
  // 'bookmarkable' state of the map.
  const [ state, updateState ] = useState<Viewport>(viewport as Viewport);
  const handleViewportChanged = (viewport : Viewport) => {
    updateState(viewport);
  };
  
  return (
    <Map
      viewport={state}
      style={{ height, width }}
      onViewportChanged={handleViewportChanged}
    >

      <TileLayer
	url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
	attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
      />

      <SemanticMarkers
        onViewportChanged={onViewportChanged}
	markers={markers}
      />
    </Map>
  );
}
