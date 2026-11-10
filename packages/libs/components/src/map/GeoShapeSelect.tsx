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
// side-effect import (registers L.control.lasso) kept separate from the
// type import below, which the compiler elides
import 'leaflet-lasso';
import { LassoHandlerFinishedEvent } from 'leaflet-lasso';
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
  // hook for the cursor rules in geo-shape-select.css
  className: 'geo-shape-select-shape',
};

// read-only copies of the shapes in the other visible world copies:
// invisible to geoman (opt-in mode) and to mouse events
const mirrorStyle = {
  ...shapeStyle,
  pmIgnore: true,
  interactive: false,
  className: 'geo-shape-select-mirror',
};

const NO_SHAPES_TITLE = 'Draw a lasso shape first';

// geoman's default tooltips talk about "layers"; users think in shapes
const buttonTitles = {
  editButton: 'Edit shapes',
  dragButton: 'Drag shapes',
  deleteButton: 'Remove shapes',
};

// geoman reuses the "Finish" label as the tooltip of each mode's finish
// action; say what finishing actually does
const finishTitles = {
  editMode: 'Exit shape editing mode',
  dragMode: 'Exit shape dragging mode',
  removalMode: 'Exit shape removal mode',
} as const;

const EDIT_HELP_TITLE = [
  'Editing tips:',
  '• Drag a large point to move it',
  '• Right-click a large point to delete it',
  '• Drag a small point (between two large ones) to add a new point',
].join('\n');

/**
 * The DOM element geoman puts a toolbar button's tooltip on. geoman's typings
 * expose its buttons only as L.Control, but at runtime each has a
 * `buttonsDomNode` (the button's container element).
 */
function getButtonContainer(map: L.Map, name: string): HTMLElement | null {
  const button: unknown = map.pm.Toolbar.getButtons()[name];
  if (
    typeof button === 'object' &&
    button != null &&
    'buttonsDomNode' in button &&
    button.buttonsDomNode instanceof HTMLElement
  )
    return button.buttonsDomNode;
  return null;
}

/** What the main effect exposes to the shapes-prop sync effect. */
interface ShapesController {
  /** replace all layers with `shapes` (no emission) */
  setShapes: (shapes: LatLngShape[]) => void;
}

export default function GeoShapeSelect(props: GeoShapeSelectProps) {
  const { shapes } = props;
  const map = useMap();
  // set by the main effect for the lifetime of each map
  const controllerRef = useRef<ShapesController>();
  // serialized form of the last shape-set we emitted, to distinguish the
  // parent echoing our own change back (no rebuild — geoman may be
  // mid-gesture) from a genuinely new value (rebuild the layers)
  const lastEmittedRef = useRef<string>();

  // latest-value refs: the main effect registers its leaflet handlers once
  // per map, so it must read these props at call time, not capture them
  const onShapesChangedRef = useRef(props.onShapesChanged);
  onShapesChangedRef.current = props.onShapesChanged;
  const simplifyTolerancePxRef = useRef(props.simplifyTolerancePx ?? 8);
  simplifyTolerancePxRef.current = props.simplifyTolerancePx ?? 8;

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

    // read-only copies of the shapes in the other visible world copies
    const mirrorGroup = L.featureGroup().addTo(map);
    const group = L.featureGroup().addTo(map);
    // geoman's own tooltip text for each button, remembered while we override it
    const originalTitles: Record<string, string> = {};
    // true while a vertex or whole shape is being dragged
    let gestureActive = false;
    let pendingEmit: ReturnType<typeof setTimeout> | undefined;

    const refresh = () => refreshMirrors(map, group, mirrorGroup);
    const sync = () => syncToolbar(map, group, originalTitles);

    const emitShapes = () => {
      refresh();
      sync();
      // one pending emission is enough: it collects the shapes when it runs
      clearTimeout(pendingEmit);
      pendingEmit = setTimeout(() => {
        pendingEmit = undefined;
        const next = collectShapes(group);
        lastEmittedRef.current = JSON.stringify(next);
        onShapesChangedRef.current(next);
      }, 0);
    };

    const callbacks: ShapeCallbacks = {
      onEdited: emitShapes,
      onEditing: refresh,
      onGesture: (active) => {
        gestureActive = active;
      },
    };

    controllerRef.current = {
      setShapes: (nextShapes) => {
        group.clearLayers();
        for (const shape of nextShapes) addShapeLayer(group, shape, callbacks);
        refresh();
        sync();
      },
    };

    const lassoControl = L.control.lasso({
      position: 'topleft',
      title: 'Draw one or more lasso shapes to filter the data',
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

    // global (geoman keeps one active language); must precede addControls
    // so the buttons are created with our wording
    map.pm.setLang('en', { buttonTitles }, 'en');
    map.pm.addControls({
      position: 'topleft',
      drawControls: false,
      editMode: true,
      dragMode: true,
      removalMode: true,
      cutPolygon: false,
      rotateMode: false,
    });
    // a "?" beside Finish in the edit-mode flyout, explaining vertex gestures
    map.pm.Toolbar.changeActionsOfControl('editMode', [
      'finishMode',
      { name: 'help', text: '?', title: EDIT_HELP_TITLE, onClick: () => {} },
    ]);
    // set the finish tooltips last: changeActionsOfControl rebuilds buttons
    for (const [name, title] of Object.entries(finishTitles))
      getButtonContainer(map, name)
        ?.querySelector('.action-finishMode')
        ?.setAttribute('title', title);
    sync();

    // Leaflet types plugin events only as the base LeafletEvent; leaflet-lasso
    // fires 'lasso.finished' with its own payload, so narrow to that type
    const handleLassoFinished = (leafletEvent: L.LeafletEvent) => {
      const event = leafletEvent as LassoHandlerFinishedEvent;
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
        callbacks
      );
      emitShapes();
    };

    // removal mode removes the layer from the map; also drop it from our
    // group so it no longer counts as a shape
    const handleRemove: L.PM.RemoveEventHandler = (event) => {
      if (group.hasLayer(event.layer)) {
        group.removeLayer(event.layer);
        emitShapes();
      }
    };

    const handleViewChanged = () => {
      if (!gestureActive) recenterShapes(map, group);
      refresh();
    };

    map.on('lasso.finished', handleLassoFinished);
    // lets the stylesheet show a "click to remove" cursor over shapes
    const handleRemovalModeToggled: L.PM.GlobalRemovalModeToggledEventHandler =
      (event) => {
        map
          .getContainer()
          .classList.toggle('geo-shape-select-removal-mode', event.enabled);
      };

    map.on('pm:remove', handleRemove);
    map.on('pm:globalremovalmodetoggled', handleRemovalModeToggled);
    map.on('moveend zoomend resize', handleViewChanged);

    return () => {
      map.off('lasso.finished', handleLassoFinished);
      map.off('pm:remove', handleRemove);
      map.off('pm:globalremovalmodetoggled', handleRemovalModeToggled);
      map.getContainer().classList.remove('geo-shape-select-removal-mode');
      map.off('moveend zoomend resize', handleViewChanged);
      map.pm.removeControls();
      lassoControl.remove();
      group.remove();
      mirrorGroup.remove();
      clearTimeout(pendingEmit);
      controllerRef.current = undefined;
      // the next map's group starts empty, so the sync effect must rebuild
      // it even if the shapes prop is unchanged
      lastEmittedRef.current = undefined;
    };
  }, [map]);

  // sync layers from the shapes prop (initial mount, analysis reload,
  // external clearing, a new map) — skipped when the prop is the echo of
  // our own emit. Declared after the main effect so it runs after it.
  useEffect(() => {
    const controller = controllerRef.current;
    if (controller == null) return;
    const serialized = JSON.stringify(shapes);
    if (serialized === lastEmittedRef.current) return;
    controller.setShapes(shapes);
    lastEmittedRef.current = serialized;
  }, [map, shapes]);

  return null;
}

function refreshMirrors(
  map: L.Map,
  group: L.FeatureGroup,
  mirrorGroup: L.FeatureGroup
) {
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

/**
 * Silently translate each real shape by whole multiples of 360° into the
 * world copy nearest the map centre, so the editable shape is always the
 * one in front of the user (the others are read-only mirrors). Does not
 * emit: the prefix cover is the same in every world copy (longitudes are
 * wrapped by normalizeShapeLongitudes), so the filter needn't recompute.
 * Callers must not call this mid-gesture.
 */
function recenterShapes(map: L.Map, group: L.FeatureGroup) {
  const centerLng = map.getCenter().lng;
  group.eachLayer((layer) => {
    if (!(layer instanceof L.Polygon)) return;
    const extent = layer.getBounds();
    const shift =
      360 *
      Math.round((centerLng - (extent.getWest() + extent.getEast()) / 2) / 360);
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

/**
 * Edit / drag / remove only make sense when there is a shape to act on,
 * so disable those toolbar buttons (and leave any active mode) while the
 * group is empty. `originalTitles` remembers geoman's own tooltips while
 * they are overridden.
 */
function syncToolbar(
  map: L.Map,
  group: L.FeatureGroup,
  originalTitles: Record<string, string>
) {
  if (map.pm?.Toolbar == null) return;
  const isEmpty = group.getLayers().length === 0;
  if (isEmpty) {
    // only disable modes that are on: geoman's disableGlobal*Mode() calls
    // map.off('layeradd', <handler>) with a handler that only exists once
    // the mode has been enabled, so on a never-enabled mode Leaflet logs
    // "wrong listener type: undefined"
    if (map.pm.globalEditModeEnabled()) map.pm.disableGlobalEditMode();
    if (map.pm.globalDragModeEnabled()) map.pm.disableGlobalDragMode();
    if (map.pm.globalRemovalModeEnabled()) map.pm.disableGlobalRemovalMode();
  }
  for (const name of ['editMode', 'dragMode', 'removalMode'] as const) {
    map.pm.Toolbar.setButtonDisabled(name, isEmpty);
    // geoman keeps its tooltip on the button's container element; swap in
    // guidance while disabled and restore geoman's own text afterwards
    const container = getButtonContainer(map, name);
    if (container == null) continue;
    if (isEmpty) {
      const current = container.getAttribute('title');
      if (current !== NO_SHAPES_TITLE && current != null)
        originalTitles[name] = current;
      container.setAttribute('title', NO_SHAPES_TITLE);
    } else if (originalTitles[name] != null) {
      container.setAttribute('title', originalTitles[name]);
    }
  }
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
  // whole-shape drag end, edit-mode close) — not continuously mid-drag.
  // One call per event: geoman's typings only cover single event names.
  layer.on('pm:markerdragend', onEdited);
  layer.on('pm:vertexadded', onEdited);
  layer.on('pm:vertexremoved', onEdited);
  layer.on('pm:dragend', onEdited);
  layer.on('pm:update', onEdited);
  // keep the read-only copies in step while a vertex or shape is dragged
  layer.on('pm:markerdrag', onEditing);
  layer.on('pm:drag', onEditing);
  const gestureStarted = () => onGesture(true);
  const gestureEnded = () => onGesture(false);
  layer.on('pm:markerdragstart', gestureStarted);
  layer.on('pm:dragstart', gestureStarted);
  layer.on('pm:markerdragend', gestureEnded);
  layer.on('pm:dragend', gestureEnded);
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
