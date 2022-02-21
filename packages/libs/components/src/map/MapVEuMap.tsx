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
import { Viewport, Map, TileLayer, LayersControl } from 'react-leaflet';
import { SimpleMapScreenshoter } from 'leaflet-simple-map-screenshoter';
import SemanticMarkers from './SemanticMarkers';
import 'leaflet/dist/leaflet.css';
import '../../dist/css/map_styles.css';
import CustomGridLayer from './CustomGridLayer';
import MouseTools, { MouseMode } from './MouseTools';
import { PlotRef } from '../types/plots';
import { ToImgopts } from 'plotly.js';
import { LatLngBounds } from 'leaflet';

const { BaseLayer } = LayersControl;

export const baseLayers = {
  Street: {
    url:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
  },
  // change config
  Terrain: {
    url:
      'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}',
    attribution:
      'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 18,
    ext: 'png',
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
  },
  // change layer as previous one does not work
  Light: {
    url:
      'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}',
    attribution:
      'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png',
  },
  Dark: {
    url:
      'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    // maxZoom='19'
  },
  OSM: {
    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
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
}

function MapVEuMap(props: MapVEuMapProps, ref: Ref<PlotRef>) {
  const {
    viewport,
    height,
    width,
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
  } = props;

  // this is the React Map component's onViewPortChanged handler
  // we may not need to use it.
  // onViewportchanged in SemanticMarkers is more relevant
  // because it can access the map's bounding box (aka bounds)
  // which is useful for fetching data to show on the map.
  // The Viewport info (center and zoom) handled here would be useful for saving a
  // 'bookmarkable' state of the map.
  const [mouseMode, setMouseMode] = useState<MouseMode>('default');
  // Whether the user is currently dragging the map
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const mapRef = useRef<Map>(null);
  const screenshotter = useMemo(
    () =>
      new SimpleMapScreenshoter({
        hidden: true,
        hideElementsWithSelectors: [],
      }),
    []
  );

  useEffect(() => {
    if (mapRef.current?.leafletElement)
      screenshotter.addTo(mapRef.current.leafletElement);
  }, [screenshotter, mapRef]);

  useImperativeHandle<PlotRef, PlotRef>(
    ref,
    () => ({
      // Set the ref's toImage function that will be called in web-eda
      toImage: async (imageOpts: ToImgopts) => {
        try {
          // Wait to allow map to finish rendering
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Check that map leaflet element still exists
          if (mapRef.current) {
            // Call the 3rd party function that actually creates the image
            const screenshot = await screenshotter.takeScreen('image', {
              domtoimageOptions: {
                width: imageOpts.width,
                height: imageOpts.height,
              },
            });
            // The screenshotter library's types are wrong. TS thinks this next line
            // will never happen, but takeScreen('image') should in fact return a string
            if (typeof screenshot === 'string') return screenshot;
            console.error(
              'Map screenshot not string type. Value:\n' + screenshot
            );
          }
        } catch (error) {
          console.error('Could not create image for plot: ', error);
        }
        return '';
      },
    }),
    [screenshotter]
  );

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
      style={{ height, width }}
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
        <MouseTools mouseMode={mouseMode} setMouseMode={setMouseMode} />
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
    </Map>
  );
}

export default forwardRef(MapVEuMap);
