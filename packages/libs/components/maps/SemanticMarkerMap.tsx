import React, { useState } from "react";
import { SemanticMarkerMapProps, MarkerProps } from "./Types";
import { Viewport, Map, TileLayer } from "react-leaflet";
import SemanticMarkers from "./SemanticMarkers";
import 'leaflet/dist/leaflet.css';


/**
 * Renders a Leaflet map with semantic zooming markers
 * 
 * 
 * @param props 
 */
export default function SemanticMarkerMap(props: SemanticMarkerMapProps<MarkerProps>) {  // ? extends BasicMarker?
  const { viewport, height, width, data, onMapUpdate } = props;

  // what does the <Map> achieve here?
  const [ state, updateState ] = useState<Viewport>(viewport as Viewport);
  
  const handleViewPortChanged = (viewport : Viewport) => {
    updateState(viewport);
  };

  
  return (
    <Map
      viewport={state}
      style={{ height, width }}
      onViewportChanged={handleViewPortChanged}
    >

      <TileLayer
	url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
	attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
      />

      <SemanticMarkers
      data={data.markers}
      onMapUpdate={onMapUpdate}
      />
    </Map>
  );
}
