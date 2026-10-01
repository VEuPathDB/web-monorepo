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

export default function GeoShapeSelect(props: GeoShapeSelectProps) {
  const { shapes } = props;
  const map = useMap();
  const groupRef = useRef<L.FeatureGroup>();
  // serialized form of the last shape-set we emitted, to distinguish the
  // parent echoing our own change back (no rebuild — geoman may be
  // mid-gesture) from a genuinely new value (rebuild the layers)
  const lastEmittedRef = useRef<string>();

  // latest-value refs so leaflet handlers never capture stale closures
  const onShapesChangedRef = useRef(props.onShapesChanged);
  onShapesChangedRef.current = props.onShapesChanged;
  const simplifyTolerancePxRef = useRef(props.simplifyTolerancePx ?? 8);
  simplifyTolerancePxRef.current = props.simplifyTolerancePx ?? 8;

  function emitShapes() {
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
        () => emitShapesRef.current()
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

    map.on('lasso.finished', handleLassoFinished);
    map.on('pm:remove', handleRemove);

    return () => {
      map.off('lasso.finished', handleLassoFinished);
      map.off('pm:remove', handleRemove);
      map.pm.removeControls();
      lassoControl.remove();
      group.remove();
      groupRef.current = undefined;
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
    for (const shape of shapes)
      addShapeLayer(group, shape, () => emitShapesRef.current());
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

function addShapeLayer(
  group: L.FeatureGroup,
  shape: LatLngShape,
  onEdited: () => void
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
