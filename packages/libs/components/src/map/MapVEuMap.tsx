import React, {
  useEffect,
  CSSProperties,
  Ref,
  useMemo,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useRef,
} from 'react';
import { BoundsViewport, Bounds } from './Types';
import {
  MapContainer,
  TileLayer,
  LayersControl,
  ScaleControl,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './styles/map-styles.css';
import CustomGridLayer from './CustomGridLayer';
import { PlotRef } from '../types/plots';
import { ToImgopts } from 'plotly.js';
import Spinner from '../components/Spinner';
import NoDataOverlay from '../components/NoDataOverlay';
import { Map, DomEvent, LatLngBounds } from 'leaflet';
import domToImage from 'dom-to-image';
import { makeSharedPromise } from '../utils/promise-utils';
import { Undo } from '@veupathdb/coreui';
import { mouseEventHasModifierKey } from './BoundsDriftMarker';

// define Viewport type
export type Viewport = {
  center: [number, number];
  zoom: number;
};

export const baseLayers = {
  Street: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
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
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    noWrap: false,
    // testing worldmap issue - with bounds props, message like 'map data not yet availalbe' is not shown
    // // block this as bounds is not compatible?
    // bounds: [
    //   [-90, -180],
    //   [90, 180],
    // ],
    // noWrap: true,
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
    // noWrap='0
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

  onBoundsChanged: (boundsViewport: BoundsViewport) => void;

  /** Height and width of plot element */
  height: CSSProperties['height'];
  width: CSSProperties['width'];

  /** CSS styles for the map container other than height and width,
   * which have their own dedicated props */
  style?: Omit<React.CSSProperties, 'height' | 'width'>;

  // closing sidebar at MapVEuMap: passing setSidebarCollapsed()
  sidebarOnClose?: (value: React.SetStateAction<boolean>) => void;
  /** Should a geohash-based grid be shown?
   * Optional. See also zoomLevelToGeohashLevel
   **/
  showGrid?: boolean;
  /** A function to map from Leaflet zoom level to Geohash level
   *
   * Optional, but required for grid functionality if showGrid is true
   **/
  zoomLevelToGeohashLevel?: (leafletZoomLevel: number) => number;
  /** What's the minimum leaflet zoom level allowed? Default = 1 */
  minZoom?: number;
  /**
   * The name of the tile layer to use. If omitted, defaults to Street.
   */
  baseLayer?: BaseLayerChoice;
  /** Callback for when the base layer has changed */
  onBaseLayerChanged?: (newBaseLayer: BaseLayerChoice) => void;
  /** Show layers control, default true */
  showLayerSelector?: boolean;
  /** Show attribution, default true */
  showAttribution?: boolean;
  /** Show zoom control, default true */
  showZoomControl?: boolean;

  /** Whether to show a loading spinner */
  showSpinner?: boolean;
  /** Whether to show the "No data" overlay */
  showNoDataOverlay?: boolean;
  /** Whether to show the Scale in the map */
  showScale?: boolean;
  /** Whether to allow any interactive control of map location (default: true) */
  interactive?: boolean;
  /** is map scroll and zoom allowed? default true; will be overridden by `interactive: false` */
  scrollingEnabled?: boolean;
  /** pass default viewport */
  defaultViewport?: Viewport;
  children?: React.ReactNode;
  onMapClick?: () => void;
  onMapDrag?: () => void;
  onMapZoom?: () => void;
}

function MapVEuMap(props: MapVEuMapProps, ref: Ref<PlotRef>) {
  const {
    viewport,
    height,
    width,
    style,
    onViewportChanged,
    onBoundsChanged,
    showGrid,
    zoomLevelToGeohashLevel,
    baseLayer,
    onBaseLayerChanged,
    showSpinner,
    showNoDataOverlay,
    showScale = true,
    showLayerSelector = true,
    showAttribution = true,
    scrollingEnabled = true,
    interactive = true,
    defaultViewport,
    onMapClick,
    onMapDrag,
    onMapZoom,
  } = props;

  // use a ref to avoid unneeded renders
  const mapRef = useRef<Map>();

  // This is used to ensure toImage is called after the plot has been created
  const sharedPlotCreation = useMemo(
    () => makeSharedPromise(() => Promise.resolve()),
    []
  );

  const onCreated = useCallback(
    (map: Map) => {
      mapRef.current = map;
      sharedPlotCreation.run();
      onBoundsChanged({
        bounds: constrainLongitudeToMainWorld(boundsToGeoBBox(map.getBounds())),
        zoomLevel: map.getZoom(),
      });
    },
    [onBoundsChanged, sharedPlotCreation]
  );

  useEffect(() => {
    const gitterBtn: HTMLAnchorElement | null = document.querySelector(
      '.gitter-open-chat-button'
    );
    if (gitterBtn) {
      gitterBtn.style.display = 'none';
    }
    return () => {
      if (gitterBtn) {
        gitterBtn.style.display = 'inline';
      }
    };
  }, []);

  useImperativeHandle<PlotRef, PlotRef>(
    ref,
    () => ({
      // Set the ref's toImage function that will be called in web-eda
      toImage: async (imageOpts: ToImgopts) => {
        // Wait to allow map to finish rendering
        await new Promise((res) => setTimeout(res, 1000));
        await sharedPlotCreation.promise;

        if (!mapRef.current) throw new Error('Map not ready');
        return domToImage.toPng(mapRef.current.getContainer(), imageOpts);
      },
    }),
    [sharedPlotCreation.promise]
  );

  const disabledInteractiveProps = {
    dragging: false,
    keyboard: false,
    doubleClickZoom: false,
    tap: false,
    touchZoom: false,
    boxZoom: false,
  };

  const zoomSnap = 0.25;

  return (
    <MapContainer
      center={viewport.center}
      zoom={viewport.zoom}
      minZoom={1}
      zoomSnap={zoomSnap}
      wheelPxPerZoomLevel={100}
      // We add our own custom zoom control below
      zoomControl={false}
      style={{ height, width, ...style }}
      worldCopyJump={false}
      whenCreated={onCreated}
      attributionControl={showAttribution}
      {...(interactive ? {} : disabledInteractiveProps)}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />

      {props.children}

      {showGrid && zoomLevelToGeohashLevel ? (
        <CustomGridLayer zoomLevelToGeohashLevel={zoomLevelToGeohashLevel} />
      ) : null}

      {showLayerSelector && (
        <LayersControl position="topright">
          {Object.entries(baseLayers).map(([name, layerProps], i) => (
            <LayersControl.BaseLayer
              name={name}
              key={name}
              checked={baseLayer ? name === baseLayer : i === 0}
            >
              <TileLayer {...layerProps} />
            </LayersControl.BaseLayer>
          ))}
        </LayersControl>
      )}

      {showSpinner && <Spinner />}
      {showNoDataOverlay && <NoDataOverlay opacity={0.9} />}
      {/* add Scale in the map */}
      {showScale && <ScaleControl position="bottomright" />}

      {/* component for map events */}
      <MapVEuMapEvents
        onViewportChanged={onViewportChanged}
        onBaseLayerChanged={onBaseLayerChanged}
        onBoundsChanged={onBoundsChanged}
        onMapClick={onMapClick}
        onMapDrag={onMapDrag}
        onMapZoom={onMapZoom}
      />
      {/* set ScrollWheelZoom */}
      <MapScrollWheelZoom scrollingEnabled={scrollingEnabled} />
      {/* use custom zoom control */}
      <CustomZoomControl
        defaultViewport={defaultViewport}
        zoomDelta={zoomSnap}
      />
    </MapContainer>
  );
}

export default forwardRef(MapVEuMap);

interface MapVEuMapEventsProps {
  onViewportChanged: (viewport: Viewport) => void;
  onBoundsChanged: (bondsViewport: BoundsViewport) => void;
  onBaseLayerChanged?: (newBaseLayer: BaseLayerChoice) => void;
  onMapClick?: () => void;
  onMapDrag?: () => void;
  onMapZoom?: () => void;
}

// function to handle map events such as onViewportChanged and baselayerchange
function MapVEuMapEvents(props: MapVEuMapEventsProps) {
  const {
    onViewportChanged,
    onBaseLayerChanged,
    onBoundsChanged,
    onMapClick,
    onMapDrag,
    onMapZoom,
  } = props;
  const mapEvents = useMapEvents({
    zoomend: () => {
      onViewportChanged({
        center: [mapEvents.getCenter().lat, mapEvents.getCenter().lng],
        zoom: mapEvents.getZoom(),
      });

      const boundsViewport: BoundsViewport = {
        bounds: constrainLongitudeToMainWorld(
          boundsToGeoBBox(mapEvents.getBounds())
        ),
        zoomLevel: mapEvents.getZoom(),
      };
      onBoundsChanged(boundsViewport);

      if (onMapZoom != null) onMapZoom();
    },
    moveend: () => {
      onViewportChanged({
        center: [mapEvents.getCenter().lat, mapEvents.getCenter().lng],
        zoom: mapEvents.getZoom(),
      });

      const boundsViewport: BoundsViewport = {
        bounds: constrainLongitudeToMainWorld(
          boundsToGeoBBox(mapEvents.getBounds())
        ),
        zoomLevel: mapEvents.getZoom(),
      };
      onBoundsChanged(boundsViewport);

      if (onMapDrag != null) onMapDrag();
    },
    baselayerchange: (e: { name: string }) => {
      onBaseLayerChanged && onBaseLayerChanged(e.name as BaseLayerChoice);
    },
    // map click event: remove selected markers and close side panel
    click: (e) => {
      if (onMapClick != null && !mouseEventHasModifierKey(e.originalEvent))
        onMapClick();
    },
  });

  return null;
}

interface MapScrollWheelZoomProps {
  scrollingEnabled: boolean;
}

function MapScrollWheelZoom(props: MapScrollWheelZoomProps) {
  const map = useMap();

  if (props.scrollingEnabled) {
    map.scrollWheelZoom.enable();
  } else {
    map.scrollWheelZoom.disable();
  }

  return null;
}

// custom zoom control
interface CustomZoomControlProps {
  defaultViewport?: Viewport;
  zoomDelta?: number;
}

function CustomZoomControl(props: CustomZoomControlProps) {
  const map = useMap();
  const boundedZoomDelta =
    props.zoomDelta !== undefined ? Math.max(props.zoomDelta, 0.25) : 1;

  const disableMinZoomButton =
    map.getZoom() <= map.getMinZoom() ? 'leaflet-disabled' : '';
  const disableMaxZoomButton =
    map.getZoom() >= map.getMaxZoom() ? 'leaflet-disabled' : '';

  // zoom in
  const zoomIn = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!disableMaxZoomButton) map.setZoom(map.getZoom() + boundedZoomDelta);
  };

  // zoom out
  const zoomOut = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!disableMinZoomButton) map.setZoom(map.getZoom() - boundedZoomDelta);
  };

  // zoom to data: using flyTo function implicitly
  const zoomToData = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (props.defaultViewport)
      map.setView(props.defaultViewport.center, props.defaultViewport.zoom);
  };

  return (
    <div
      className="leaflet-control-container"
      ref={(ref) => {
        if (!ref) return;
        DomEvent.disableClickPropagation(ref).disableScrollPropagation(ref);
      }}
    >
      <div
        className="leaflet-top leaflet-right"
        style={{ top: '55px', right: '0px', zIndex: 'auto' }}
      >
        <div className="leaflet-control-zoom leaflet-bar leaflet-control">
          <a
            className={'leaflet-control-zoom-in' + disableMaxZoomButton}
            href="/#"
            title="Zoom in"
            role="button"
            aria-label="Zoom in"
            onClick={zoomIn}
          >
            <span aria-hidden="true">+</span>
          </a>
          <a
            className={'leaflet-control-zoom-out' + disableMinZoomButton}
            href="/#"
            title="Zoom out"
            role="button"
            aria-label="Zoom out"
            onClick={zoomOut}
          >
            <span aria-hidden="true">-</span>
          </a>
          <a
            className="leaflet-control-zoom-out"
            href="/#"
            title="zoom to data"
            role="button"
            aria-label="zoom to data"
            onClick={zoomToData}
          >
            <div style={{ paddingTop: '4px' }}>
              <Undo />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * react-leaflet v3 with React 18 has commit-phase race conditions when a map
 * unmounts in the same React update as child layers mount or unmount:
 *
 * 1. `Map.remove()` can throw mid-teardown — vector layers (e.g. Rectangle)
 *    and their SVG renderer are both plain entries of `map._layers`, and if
 *    the renderer is removed first, the vector layer's `onRemove` crashes on
 *    `this._renderer._removePath`. The throw aborts the rest of the teardown
 *    and escalates into React's commit phase, where the nearest error
 *    boundary tears down and recreates the whole tree — leaving Leaflet
 *    half-destroyed (the classic "Map container is already initialized"
 *    cascade).
 * 2. A layer's mount effect can fire against a map that has already been
 *    removed (its React context still references the dead map), crashing in
 *    `map.addLayer`.
 *
 * 3. Conversely, if anything throws *during* map construction — after
 *    Leaflet has stamped the container element with `_leaflet_id` but before
 *    react-leaflet's `setMap` commits — react-leaflet's map state stays null
 *    and its init effect re-runs on the next render, attempting
 *    `new Map(sameDiv)` and now throwing "Map container is already
 *    initialized" on every render, masking the original error.
 *
 * Until we can upgrade to react-leaflet v4, make every map tolerant from the
 * moment it is constructed (react-leaflet can create and remove a map within
 * a single React update, so per-instance patching would come too late):
 * `remove()` becomes idempotent and never throws, `addLayer`/`removeLayer`
 * become no-ops once the map has been removed, and a failed construction
 * un-stamps the container so that a re-attempt can succeed instead of
 * cascading.
 */
function installLeafletTeardownGuards() {
  const proto = Map.prototype as any;
  if (proto.__veupathdbTeardownGuards) return;
  proto.__veupathdbTeardownGuards = true;

  const originalInitialize = proto.initialize;
  const originalInitContainer = proto._initContainer;
  const originalCallInitHooks = proto.callInitHooks;
  const originalRemove = proto.remove;
  const originalAddLayer = proto.addLayer;
  const originalRemoveLayer = proto.removeLayer;

  // un-stamp the container when construction fails partway, so that the
  // next attempt does not die on "Map container is already initialized"
  const resetContainerOnFailure = (original: (...args: unknown[]) => unknown) =>
    function (this: any, ...args: unknown[]) {
      try {
        return original.apply(this, args);
      } catch (error) {
        if (this._container != null && this._container._leaflet_id != null) {
          delete this._container._leaflet_id;
          delete this._containerId;
          console.warn(
            'Leaflet map construction failed; container reset for retry:',
            error
          );
        }
        throw error;
      }
    };

  // covers throws inside Map.initialize (container/layout/setView)
  proto.initialize = resetContainerOnFailure(originalInitialize);
  // covers throws from plugin init hooks, which the class constructor runs
  // *after* initialize
  proto.callInitHooks = resetContainerOnFailure(originalCallInitHooks);

  // if a stale stamp is encountered anyway (e.g. an orphaned map that was
  // never removed), clean it up and proceed instead of failing forever —
  // in this codebase every map is owned by react-leaflet, which never
  // mounts two live maps on one element, so a stamp seen at init time is
  // always an orphan
  proto._initContainer = function (id: string | HTMLElement) {
    try {
      return originalInitContainer.call(this, id);
    } catch (error) {
      const container = this._container;
      if (container != null && container._leaflet_id != null) {
        console.warn(
          'Reinitializing a Leaflet map on a container that was not torn down cleanly:',
          error
        );
        delete container._leaflet_id;
        delete this._containerId;
        return originalInitContainer.call(this, id);
      }
      throw error;
    }
  };

  proto.remove = function () {
    if (this.__veupathdbRemoved) return this;
    this.__veupathdbRemoved = true;
    try {
      return originalRemove.call(this);
    } catch (error) {
      console.warn('Ignoring an error during Leaflet map teardown:', error);
      return this;
    }
  };

  proto.addLayer = function (layer: unknown) {
    if (this.__veupathdbRemoved) return this;
    return originalAddLayer.call(this, layer);
  };

  proto.removeLayer = function (layer: unknown) {
    if (this.__veupathdbRemoved) return this;
    try {
      return originalRemoveLayer.call(this, layer);
    } catch (error) {
      console.warn('Ignoring an error during Leaflet layer removal:', error);
      return this;
    }
  };
}

installLeafletTeardownGuards();

function boundsToGeoBBox(bounds: LatLngBounds): Bounds {
  var south = bounds.getSouth();
  if (south < -90) {
    south = -90;
  }
  var north = bounds.getNorth();
  if (north > 90) {
    north = 90;
  }
  var east = bounds.getEast();
  var west = bounds.getWest();

  if (east - west > 360) {
    const center = (east + west) / 2;
    west = center - 180;
    east = center + 180;
  }

  return {
    southWest: { lat: south, lng: west },
    northEast: { lat: north, lng: east },
  };
}

// put longitude bounds within normal -180 to 180 range
function constrainLongitudeToMainWorld({
  southWest: { lat: south, lng: west },
  northEast: { lat: north, lng: east },
}: Bounds): Bounds {
  let newEast = east;
  let newWest = west;
  while (newEast > 180) {
    newEast -= 360;
  }
  while (newEast < -180) {
    newEast += 360;
  }
  while (newWest < -180) {
    newWest += 360;
  }
  while (newWest > 180) {
    newWest -= 360;
  }

  // fully zoomed out, the longitude bounds are often the same
  // but we need to make sure that west is slightly greater than east
  // so that they "wrap around" the whole globe
  // (if west was slightly less than east, it would represent a very tiny sliver)
  if (Math.abs(newEast - newWest) < 1e-8) newWest = newEast + 1e-8;

  return {
    southWest: { lat: south, lng: newWest },
    northEast: { lat: north, lng: newEast },
  };
}
