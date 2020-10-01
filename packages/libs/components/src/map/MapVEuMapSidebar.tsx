//DKDK this file is only used for sidebar demo
import React, { useState } from "react";
//DKDK needs to be check later
// import { MapVEuMapProps } from "./TypesSidebar";
import { MapVEuMapProps } from "./Types";
import { Viewport, Map, TileLayer, LayersControl, ZoomControl, ScaleControl } from "react-leaflet";
import SemanticMarkers from "./SemanticMarkers";
import 'leaflet/dist/leaflet.css';
import { LeafletMouseEvent } from "leaflet";

//DKDK for layers
const { BaseLayer, Overlay } = LayersControl

//DKDK a generic function to remove a class: here it is used for removing highlight-marker
function removeClassName(targetClass: string) {
  //DKDK much convenient to use jquery here but try not to use it
  let targetElement = document.getElementsByClassName(targetClass)[0]
  if(targetElement !== undefined) {
      targetElement.classList.remove(targetClass)
  }
}

//DKDK a generic function to remove a class: here it is used for removing highlight-marker
function removeClassNameActive(targetClass: string) {
  //DKDK much convenient to use jquery here but try not to use it
  let targetElement = document.getElementsByClassName(targetClass)[0]
  // console.log(targetElement)
  if(targetElement !== undefined) {
      targetElement.classList.remove('active')
  }
}

/**
 * Renders a Leaflet map with semantic zooming markers
 *
 *
 * @param props
 */
// export default function MapVEuMapSidebar({ viewport, height, width, onViewportChanged, markers, nudge }: MapVEuMapProps) {
export default function MapVEuMapSidebarSibling({ viewport, height, width, onViewportChanged, markers, nudge, sidebarOnClose }: MapVEuMapProps) {
  // this is the React Map component's onViewPortChanged handler
  // we may not need to use it.
  // onViewportchanged in SemanticMarkers is more relevant
  // because it can access the map's bounding box (aka bounds)
  // which is useful for fetching data to show on the map.
  // The Viewport info (center and zoom) handled here would be useful for saving a
  // 'bookmarkable' state of the map.
  const [ state, setState ] = useState<Viewport>(viewport as Viewport);

  //DKDK trying to add map click events: e.g., removing marker highlight, closing sidebar, etc.
  const mapClick = (e: LeafletMouseEvent) => {
    //DKDK remove marker highlight
    removeClassName('highlight-marker')
    //DKDK use this for closing sidebar: setSidebarCollapsed(true). Use if condition to avoid type error
    if (sidebarOnClose) sidebarOnClose(true)
    //DKDK deactivate selected sidebar tab
    removeClassNameActive('sidebartabs active')
  }

  const handleViewportChanged = (viewport : Viewport) => {
    setState(viewport);
  };

  return (
    //DKDK add fragment
    <>
      <Map
        // className="sidebar-map"
        viewport={state}
        style={{ height, width }}
        onViewportChanged={handleViewportChanged}
        zoomControl={false} //DKDK this is for disabling default zoomControl at top left
        onClick={mapClick}  //DKDK add this to handle map click
      >
        <ZoomControl position="topright" />

        <ScaleControl position="bottomright" />

        <LayersControl position="topright">
          <BaseLayer checked name="street">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
            />
          </BaseLayer>
          <BaseLayer name="terrain">
            <TileLayer
              url="https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}"
              attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              subdomains='abcd'
              // minZoom='0'
              // maxZoom='18'
              // ext='png'
            />
          </BaseLayer>
          <BaseLayer name="satellite">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            />
          </BaseLayer>
          <BaseLayer name="light">
            <TileLayer
              url="http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              // maxZoom='18'
            />
          </BaseLayer>
          <BaseLayer name="dark">
            <TileLayer
              url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
              subdomains='abcd'
              // maxZoom='19'
            />
          </BaseLayer>
          <BaseLayer name="OSM">
            <TileLayer
              url="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
              // minZoom='2'
              // maxZoom='18'
              // noWrap='0'
            />
          </BaseLayer>
        </LayersControl>

        <SemanticMarkers
          onViewportChanged={onViewportChanged}
          markers={markers}
          nudge={nudge}
        />

      </Map>
    </>
  );
}
