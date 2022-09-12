import React, {
  useState,
  useEffect,
  CSSProperties,
  ReactElement,
  cloneElement,
  useRef,
  Ref,
  useMemo,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import {
  BoundsViewport,
  AnimationFunction,
  Bounds as MapVEuBounds,
} from './Types';
import { BoundsDriftMarkerProps } from './BoundsDriftMarker';
import {
  Viewport,
  Map,
  TileLayer,
  LayersControl,
  ScaleControl,
} from 'react-leaflet';
import SemanticMarkers from './SemanticMarkers';
import 'leaflet/dist/leaflet.css';
import '../../dist/css/map_styles.css';
import CustomGridLayer from './CustomGridLayer';
import MouseTools, { MouseMode } from './MouseTools';
import { PlotRef } from '../types/plots';
import { ToImgopts } from 'plotly.js';
import Spinner from '../components/Spinner';
import NoDataOverlay from '../components/NoDataOverlay';
import { LatLngBounds } from 'leaflet';

import domToImage from 'dom-to-image';

const { BaseLayer } = LayersControl;

export const baseLayers = {
  Street: {
    url:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
    maxZoom: 17,
  },
  // change config
  Terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    maxZoom: 17,
  },
  Satellite: {
    url:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    // testing worldmap issue - with bounds props, message like 'map data not yet availalbe' is not shown
    bounds: [
      [-90, -180],
      [90, 180],
    ],
    noWrap: true,
    maxZoom: 17,
  },
  // Not sure these are needed, and the "Light" layer requires an API key
  // Light: {
  //   url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
  //   attribution:
  //     '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
  //   maxZoom: 20,
  // },
  // Dark: {
  //   url:
  //     'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png',
  //   attribution:
  //     '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
  //   subdomains: 'abcd',
  //   // maxZoom='19'
  // },
  OSM: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    // minZoom='2'
    // maxZoom='18'
    // noWrap='0'
  },
};

export type BaseLayerChoice = keyof typeof baseLayers;

/**
 * Renders a Leaflet map with semantic zooming markers
 *
 *
 * @param props
 */

export interface MapVEuMapProps {
  /** Center lat/long and zoom level */
  viewport: Viewport;
  /** update handler */
  onViewportChanged: (viewport: Viewport) => void;

  /** Height and width of plot element */
  height: CSSProperties['height'];
  width: CSSProperties['width'];

  /** CSS styles for the map container other than height and width,
   * which have their own dedicated props */
  style?: Omit<React.CSSProperties, 'height' | 'width'>;

  /** callback for when viewport has changed, giving access to the bounding box */
  onBoundsChanged: (bvp: BoundsViewport) => void;

  markers: ReactElement<BoundsDriftMarkerProps>[];
  recenterMarkers?: boolean;
  // closing sidebar at MapVEuMap: passing setSidebarCollapsed()
  sidebarOnClose?: (value: React.SetStateAction<boolean>) => void;
  animation: {
    method: string;
    duration: number;
    animationFunction: AnimationFunction;
  } | null;
  /** Should a geohash-based grid be shown?
   * Optional. See also zoomLevelToGeohashLevel
   **/
  showGrid?: boolean;
  /** A function to map from Leaflet zoom level to Geohash level
   *
   * Optional, but required for grid functionality if showGrid is true
   **/
  zoomLevelToGeohashLevel?: (leafletZoomLevel: number) => number;
  /**
   * Should the mouse-mode (regular/magnifying glass) icons be shown and active?
   **/
  showMouseToolbar?: boolean;
  /** mouseMode control */
  mouseMode: MouseMode;
  /** a function for changing mouseMode */
  onMouseModeChange: (value: MouseMode) => void;
  /**
   * The name of the tile layer to use. If omitted, defaults to Street.
   */
  baseLayer?: BaseLayerChoice;
  /** Callback for when the base layer has changed */
  onBaseLayerChanged?: (newBaseLayer: BaseLayerChoice) => void;
  /** Whether to zoom and pan map to center on markers */
  flyToMarkers?: boolean;
  /** How long (in ms) after rendering to wait before flying to markers */
  flyToMarkersDelay?: number;
  /** Whether to show a loading spinner */
  showSpinner?: boolean;
  /** Whether to show the "No data" overlay */
  showNoDataOverlay?: boolean;
  /** Whether to show the Scale in the map */
  showScale?: boolean;
  /** is map scroll and zoom allowed? */
  scrollingEnabled?: boolean;
}

function MapVEuMap(props: MapVEuMapProps, ref: Ref<PlotRef>) {
  const {
    viewport,
    height,
    width,
    style,
    onViewportChanged,
    onBoundsChanged,
    markers,
    animation,
    recenterMarkers = true,
    showGrid,
    zoomLevelToGeohashLevel,
    showMouseToolbar,
    baseLayer,
    onBaseLayerChanged,
    flyToMarkers,
    flyToMarkersDelay,
    showSpinner,
    showNoDataOverlay,
    showScale = true,
    scrollingEnabled = true,
    mouseMode,
    onMouseModeChange,
  } = props;

  // Whether the user is currently dragging the map
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const mapRef = useRef<Map>(null);

  useImperativeHandle<PlotRef, PlotRef>(ref, () => ({
    // Set the ref's toImage function that will be called in web-eda
    toImage: async (imageOpts: ToImgopts) => {
      if (!mapRef.current?.container) throw new Error('Map not ready');
      return await domToImage.toPng(mapRef.current.container, imageOpts);
    },
  }));

  const markersBounds: MapVEuBounds | null = useMemo(() => {
    if (markers) {
      let [minLat, maxLat, minLng, maxLng] = [90, -90, 180, -180];

      for (const marker of markers) {
        const bounds = marker.props.bounds;
        const ne = bounds.northEast;
        const sw = bounds.southWest;

        if (ne.lat > maxLat) maxLat = ne.lat;
        if (ne.lat < minLat) minLat = ne.lat;

        if (ne.lng > maxLng) maxLng = ne.lng;
        if (ne.lng < minLng) minLng = ne.lng;

        if (sw.lat > maxLat) maxLat = sw.lat;
        if (sw.lat < minLat) minLat = sw.lat;

        if (sw.lng > maxLng) maxLng = sw.lng;
        if (sw.lng < minLng) minLng = sw.lng;
      }

      return {
        southWest: { lat: minLat, lng: minLng },
        northEast: { lat: maxLat, lng: maxLng },
      };
    } else {
      return null;
    }
  }, [markers]);

  const performFlyToMarkers = useCallback(() => {
    if (markersBounds) {
      const ne = markersBounds.northEast;
      const sw = markersBounds.southWest;

      const bufferFactor = 0.1;
      const latBuffer = (ne.lat - sw.lat) * bufferFactor;
      const lngBuffer = (ne.lng - sw.lng) * bufferFactor;

      const boundingBox = new LatLngBounds([
        [sw.lat - latBuffer, sw.lng - lngBuffer],
        [ne.lat + latBuffer, ne.lng + lngBuffer],
      ]);

      mapRef.current?.leafletElement?.fitBounds(boundingBox);
    }
  }, [markersBounds, mapRef]);

  useEffect(() => {
    const asyncEffect = async () => {
      if (flyToMarkersDelay)
        await new Promise((resolve) => setTimeout(resolve, flyToMarkersDelay));
      performFlyToMarkers();
    };

    if (flyToMarkers && markers.length > 0) asyncEffect();
  }, [markers, flyToMarkers, flyToMarkersDelay, performFlyToMarkers]);

  const finalMarkers = useMemo(() => {
    if (mouseMode === 'magnification' && !isDragging)
      return markers.map((marker) => cloneElement(marker, { showPopup: true }));
    return markers;
  }, [markers, isDragging, mouseMode]);

  return (
    <Map
      viewport={viewport}
      style={{ height, width, ...style }}
      onViewportChanged={onViewportChanged}
      className={mouseMode === 'magnification' ? 'cursor-zoom-in' : ''}
      minZoom={1}
      worldCopyJump={false}
      ondragstart={() => setIsDragging(true)}
      ondragend={() => setIsDragging(false)}
      onbaselayerchange={(event) =>
        onBaseLayerChanged && onBaseLayerChanged(event.name as BaseLayerChoice)
      }
      ref={mapRef}
      // add scrool wheel control
      scrollWheelZoom={scrollingEnabled}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />

      <SemanticMarkers
        onBoundsChanged={onBoundsChanged}
        markers={finalMarkers}
        animation={animation}
        recenterMarkers={recenterMarkers}
      />

      {showMouseToolbar && (
        <MouseTools
          mouseMode={mouseMode}
          onMouseModeChange={onMouseModeChange}
        />
      )}

      {showGrid && zoomLevelToGeohashLevel ? (
        <CustomGridLayer zoomLevelToGeohashLevel={zoomLevelToGeohashLevel} />
      ) : null}

      <LayersControl position="topright">
        {Object.entries(baseLayers).map(([name, layerProps], i) => (
          <BaseLayer
            name={name}
            key={name}
            checked={baseLayer ? name === baseLayer : i === 0}
          >
            <TileLayer {...layerProps} />
          </BaseLayer>
        ))}
      </LayersControl>

      {showSpinner && <Spinner />}
      {showNoDataOverlay && <NoDataOverlay opacity={0.9} />}
      {/* add Scale in the map: currently set to show from zoom = 5 */}
      {showScale && <ScaleControl position="bottomright" />}
    </Map>
  );
}

export default forwardRef(MapVEuMap);
