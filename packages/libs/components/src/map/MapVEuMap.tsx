import React, {useState, CSSProperties, ReactElement} from "react";
import { BoundsViewport, MarkerProps, AnimationFunction } from "./Types";
const { BaseLayer } = LayersControl
import {Viewport, Map, TileLayer, LayersControl} from "react-leaflet";
import SemanticMarkers from "./SemanticMarkers";
import 'leaflet/dist/leaflet.css';
import '../styles/map_styles.css'
import CustomGridLayer from "./CustomGridLayer";

/**
 * Renders a Leaflet map with semantic zooming markers
 * 
 * 
 * @param props 
 */

interface MapVEuMapProps {
  /** Center lat/long and zoom level */
  viewport: Viewport,

  /** Height and width of plot element */
  height: CSSProperties['height'],
  width: CSSProperties['width'],
  onViewportChanged: (bvp: BoundsViewport) => void,
  markers: ReactElement<MarkerProps>[],
  nudge?: 'geohash' | 'none',
  //DKDK add this for closing sidebar at MapVEuMap: passing setSidebarCollapsed()
  sidebarOnClose?: (value: React.SetStateAction<boolean>) => void
  animation: {
    method: string,
    duration: number,
    animationFunction: AnimationFunction
  } | null,
  showGrid: boolean
}



export default function MapVEuMap({viewport, height, width, onViewportChanged, markers, animation, nudge, showGrid}: MapVEuMapProps) {
  // this is the React Map component's onViewPortChanged handler
  // we may not need to use it.
  // onViewportchanged in SemanticMarkers is more relevant
  // because it can access the map's bounding box (aka bounds)
  // which is useful for fetching data to show on the map.
  // The Viewport info (center and zoom) handled here would be useful for saving a
  // 'bookmarkable' state of the map.
  const [state, updateState] = useState<Viewport>(viewport as Viewport);
  const handleViewportChanged = (viewport: Viewport) => {
    updateState(viewport);
  };

  return (
    <Map
        viewport={state}
        style={{height, width}}
        onViewportChanged={handleViewportChanged}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
      />

      <SemanticMarkers
        onViewportChanged={onViewportChanged}
        markers={markers}
        animation={animation}
        nudge={nudge}
      />

      { showGrid ? <CustomGridLayer /> : null }

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
    </Map>
  );
}

