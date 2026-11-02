/*
 * Freehand lasso drawing plus shape editing for MapVEuMap maps.
 *
 * Drawing: leaflet-lasso (freehand). Editing / dragging / deleting:
 * @geoman-io/leaflet-geoman-free toolbar (its draw buttons are hidden —
 * drawing happens only through the lasso).
 *
 * Controlled component: `shapes` comes from the parent, and every user
 * gesture that changes the shapes is reported through `onShapesChanged`.
 * Emissions are deferred with setTimeout so that React state updates
 * (which can unmount the map, e.g. on a first-filter route transition)
 * never tear Leaflet down while it is still dispatching an event.
 */
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-lasso';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import './styles/geo-shape-select.css';
import { LatLngShape } from './utils/polygonsToGeohashPrefixes';
import { worldShiftsIntoView } from './utils/worldCopies';

export interface GeoShapeSelectProps {
  /** the current shapes, as [lat, lng] vertex arrays (unclosed) */
  shapes: LatLngShape[];
  /** called (deferred) after the user draws, edits, drags or deletes a shape */
  onShapesChanged: (shapes: LatLngShape[]) => void;
  /** pixel tolerance for simplifying freshly drawn lassos (default 8) */
  simplifyTolerancePx?: number;
}

const shapeStyle = {
  color: '#333333',
  weight: 2,
  dashArray: '6 3',
  fillOpacity: 0.05,
  // geoman runs in opt-in mode (see below); this opts the shape in
  pmIgnore: false,
};

// read-only copies of the shapes in the other visible world copies:
// invisible to geoman (opt-in mode) and to mouse events
const mirrorStyle = {
  ...shapeStyle,
  pmIgnore: true,
  interactive: false,
};

export default function GeoShapeSelect(props: GeoShapeSelectProps) {
  const { shapes } = props;
  const map = useMap();
  const groupRef = useRef<L.FeatureGroup>();
  // read-only copies of the shapes in the other visible world copies
  const mirrorGroupRef = useRef<L.FeatureGroup>();
  // serialized form of the last shape-set we emitted, to distinguish the
  // parent echoing our own change back (no rebuild — geoman may be
  // mid-gesture) from a genuinely new value (rebuild the layers)
  const lastEmittedRef = useRef<string>();

  // latest-value refs so leaflet handlers never capture stale closures
  const onShapesChangedRef = useRef(props.onShapesChanged);
  onShapesChangedRef.current = props.onShapesChanged;
  const simplifyTolerancePxRef = useRef(props.simplifyTolerancePx ?? 8);
  simplifyTolerancePxRef.current = props.simplifyTolerancePx ?? 8;

  function refreshMirrors() {
    const group = groupRef.current;
    const mirrorGroup = mirrorGroupRef.current;
    if (group == null || mirrorGroup == null) return;
    mirrorGroup.clearLayers();
    const view = map.getBounds();
    group.eachLayer((layer) => {
      if (!(layer instanceof L.Polygon)) return;
      const extent = layer.getBounds();
      const latLngs = layer.getLatLngs() as L.LatLng[][];
      for (const shift of worldShiftsIntoView(
        extent.getWest(),
        extent.getEast(),
        view.getWest(),
        view.getEast()
      )) {
        if (shift === 0) continue; // the real, editable shape
        mirrorGroup.addLayer(
          L.polygon(
            latLngs.map((ring) =>
              ring.map((ll) => L.latLng(ll.lat, ll.lng + shift))
            ),
            mirrorStyle
          )
        );
      }
    });
  }
  const refreshMirrorsRef = useRef(refreshMirrors);
  refreshMirrorsRef.current = refreshMirrors;

  // true while a vertex or whole shape is being dragged
  const gestureActiveRef = useRef(false);

  /**
   * Silently translate each real shape by whole multiples of 360° into the
   * world copy nearest the map centre, so the editable shape is always the
   * one in front of the user (the others are read-only mirrors). Does not
   * emit: the prefix cover is the same in every world copy (longitudes are
   * wrapped by normalizeShapeLongitudes), so the filter needn't recompute.
   */
  function recenterShapes() {
    const group = groupRef.current;
    if (group == null || gestureActiveRef.current) return;
    const centerLng = map.getCenter().lng;
    group.eachLayer((layer) => {
      if (!(layer instanceof L.Polygon)) return;
      const extent = layer.getBounds();
      const shift =
        360 *
        Math.round(
          (centerLng - (extent.getWest() + extent.getEast()) / 2) / 360
        );
      if (shift === 0) return;
      // geoman's edit handles don't follow setLatLngs, so reopen them
      const wasEditing = layer.pm.enabled();
      if (wasEditing) layer.pm.disable();
      layer.setLatLngs(
        (layer.getLatLngs() as L.LatLng[][]).map((ring) =>
          ring.map((ll) => L.latLng(ll.lat, ll.lng + shift))
        )
      );
      if (wasEditing) layer.pm.enable();
    });
  }

  const recenterShapesRef = useRef(recenterShapes);
  recenterShapesRef.current = recenterShapes;

  function shapeCallbacks(): ShapeCallbacks {
    return {
      onEdited: () => emitShapesRef.current(),
      onEditing: () => refreshMirrorsRef.current(),
      onGesture: (active) => {
        gestureActiveRef.current = active;
      },
    };
  }

  function emitShapes() {
    refreshMirrors();
    setTimeout(() => {
      const group = groupRef.current;
      if (group == null) return;
      const next = collectShapes(group);
      lastEmittedRef.current = JSON.stringify(next);
      onShapesChangedRef.current(next);
    }, 0);
  }
  const emitShapesRef = useRef(emitShapes);
  emitShapesRef.current = emitShapes;

  useEffect(() => {
    // opt-in mode: only layers explicitly created with pmIgnore: false are
    // touched by geoman's global edit/drag/removal modes — this keeps the
    // data markers (SemanticMarkers) out of them
    L.PM.setOptIn(true);
    // opt-in mode is global and sticky, so a map created after the first
    // GeoShapeSelect mounted (e.g. on returning to a geo variable) is
    // created without `map.pm`; opt this map in explicitly
    if (map.pm == null) {
      map.options.pmIgnore = false;
      // geoman's reInitLayer handles L.Map at runtime but is typed for Layer
      L.PM.reInitLayer(map as unknown as L.Layer);
    }

    const mirrorGroup = L.featureGroup().addTo(map);
    mirrorGroupRef.current = mirrorGroup;
    const group = L.featureGroup().addTo(map);
    groupRef.current = group;

    const lassoControl = L.control.lasso({
      position: 'topleft',
      title: 'Draw an area (lasso) to filter the data',
    });
    lassoControl.addTo(map);

    // leaflet-lasso's control button is an <a href="javascript:void(0)">
    // whose click handler does not preventDefault, and Leaflet's
    // disableClickPropagation does not cover 'click' — so the click
    // bubbles to page-level anchor handlers (e.g. web-common's
    // externalLinkHandler, which treats the javascript: href's "null"
    // origin as external and turns the button into a target="_blank"
    // link). Prevent the anchor's default action ourselves.
    const lassoButton = lassoControl.getContainer()?.querySelector('a');
    if (lassoButton != null)
      L.DomEvent.on(lassoButton, 'click', L.DomEvent.preventDefault);

    map.pm.addControls({
      position: 'topleft',
      drawControls: false,
      editMode: true,
      dragMode: true,
      removalMode: true,
      cutPolygon: false,
      rotateMode: false,
    });

    const handleLassoFinished = (event: any) => {
      const latLngs: L.LatLng[] = event.latLngs ?? [];
      const simplified = simplifyLatLngs(
        map,
        latLngs,
        simplifyTolerancePxRef.current
      );
      if (simplified.length < 3) return;
      addShapeLayer(
        group,
        simplified.map((ll): [number, number] => [ll.lat, ll.lng]),
        shapeCallbacks()
      );
      emitShapesRef.current();
    };

    // removal mode removes the layer from the map; also drop it from our
    // group so it no longer counts as a shape
    const handleRemove = (event: any) => {
      if (group.hasLayer(event.layer)) {
        group.removeLayer(event.layer);
        emitShapesRef.current();
      }
    };

    const handleViewChanged = () => {
      recenterShapesRef.current();
      refreshMirrorsRef.current();
    };

    map.on('lasso.finished', handleLassoFinished);
    map.on('pm:remove', handleRemove);
    map.on('moveend zoomend resize', handleViewChanged);

    return () => {
      map.off('lasso.finished', handleLassoFinished);
      map.off('pm:remove', handleRemove);
      map.off('moveend zoomend resize', handleViewChanged);
      map.pm.removeControls();
      lassoControl.remove();
      group.remove();
      mirrorGroup.remove();
      groupRef.current = undefined;
      mirrorGroupRef.current = undefined;
    };
  }, [map]);

  // sync layers from the shapes prop (initial mount, analysis reload,
  // external clearing) — skipped when the prop is the echo of our own emit
  useEffect(() => {
    const group = groupRef.current;
    if (group == null) return;
    const serialized = JSON.stringify(shapes);
    if (serialized === lastEmittedRef.current) return;
    group.clearLayers();
    for (const shape of shapes) addShapeLayer(group, shape, shapeCallbacks());
    refreshMirrorsRef.current();
    lastEmittedRef.current = serialized;
  }, [shapes]);

  return null;
}

function collectShapes(group: L.FeatureGroup): LatLngShape[] {
  const result: LatLngShape[] = [];
  group.eachLayer((layer) => {
    if (layer instanceof L.Polygon) {
      const ring = (layer.getLatLngs() as L.LatLng[][])[0] ?? [];
      result.push(ring.map((ll): [number, number] => [ll.lat, ll.lng]));
    }
  });
  return result;
}

interface ShapeCallbacks {
  /** a gesture finished: commit the new shapes */
  onEdited: () => void;
  /** a drag is in progress: keep the read-only copies in step */
  onEditing: () => void;
  /** a vertex/shape drag started (true) or ended (false) */
  onGesture: (active: boolean) => void;
}

function addShapeLayer(
  group: L.FeatureGroup,
  shape: LatLngShape,
  { onEdited, onEditing, onGesture }: ShapeCallbacks
) {
  const layer = L.polygon(
    shape.map(([lat, lng]) => L.latLng(lat, lng)),
    shapeStyle
  );
  // commit at gesture boundaries (vertex drag end, vertex add/remove,
  // whole-shape drag end, edit-mode close) — not continuously mid-drag
  layer.on(
    'pm:markerdragend pm:vertexadded pm:vertexremoved pm:dragend pm:update' as any,
    onEdited
  );
  // keep the read-only copies in step while a vertex or shape is dragged
  layer.on('pm:markerdrag pm:drag' as any, onEditing);
  layer.on('pm:markerdragstart pm:dragstart' as any, () => onGesture(true));
  layer.on('pm:markerdragend pm:dragend' as any, () => onGesture(false));
  group.addLayer(layer);
}

function simplifyLatLngs(
  map: L.Map,
  latLngs: L.LatLng[],
  tolerancePx: number
): L.LatLng[] {
  const points = latLngs.map((ll) => map.latLngToLayerPoint(ll));
  return L.LineUtil.simplify(points, tolerancePx).map((p) =>
    map.layerPointToLatLng(p)
  );
}
