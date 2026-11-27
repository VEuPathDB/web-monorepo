/*
 * Map children (must be rendered inside <MapVEuMap>) for right-click
 * coordinate popups and programmatic zooming.
 */
import { useEffect } from 'react';
import { Popup, useMap, useMapEvents } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import { Bounds } from '@veupathdb/components/lib/map/Types';
import { Coordinates, TextButton, mapUi } from '../layout/ui';
import { MarkerSummary } from '../mapTypes/types';
import { isPointLike, wrapLongitude } from '../utils/coordinates';

export type ContextPopupTarget =
  | { kind: 'point'; position: { lat: number; lng: number } }
  | { kind: 'marker'; marker: MarkerSummary; isSelected: boolean };

/** reports right-clicks on the map background */
export function MapContextMenuEvents({
  onContextMenu,
}: {
  onContextMenu: (position: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    contextmenu(event) {
      onContextMenu({
        lat: event.latlng.lat,
        lng: wrapLongitude(event.latlng.lng),
      });
    },
  });
  return null;
}

interface PopupProps {
  target: ContextPopupTarget;
  onClose: () => void;
  onSelectMarker: (marker: MarkerSummary, additive: boolean) => void;
  onZoomTo: (bounds: Bounds) => void;
}

/**
 * Coordinates of a right-clicked marker (its records' average position) or
 * map point, with copy and Google Maps links, plus marker shortcuts.
 */
export function MapContextPopup({
  target,
  onClose,
  onSelectMarker,
  onZoomTo,
}: PopupProps) {
  const position =
    target.kind === 'point' ? target.position : target.marker.position;
  return (
    <Popup
      position={[position.lat, position.lng]}
      onClose={onClose}
      closeButton
      autoPan
      className="map-context-popup"
    >
      <div css={{ fontSize: 13, minWidth: 220 }}>
        {target.kind === 'marker' ? (
          <MarkerPopupContent
            marker={target.marker}
            isSelected={target.isSelected}
            onSelectMarker={onSelectMarker}
            onZoomTo={onZoomTo}
            onClose={onClose}
          />
        ) : (
          <>
            <div css={{ fontWeight: 600, marginBottom: 4 }}>This point</div>
            <Coordinates position={position} />
          </>
        )}
      </div>
    </Popup>
  );
}

function MarkerPopupContent({
  marker,
  isSelected,
  onSelectMarker,
  onZoomTo,
  onClose,
}: {
  marker: MarkerSummary;
  isSelected: boolean;
  onSelectMarker: PopupProps['onSelectMarker'];
  onZoomTo: PopupProps['onZoomTo'];
  onClose: () => void;
}) {
  const exact = isPointLike(marker.bounds);
  return (
    <>
      <div css={{ fontWeight: 600, marginBottom: 2 }}>
        {exact ? 'Location' : 'Marker'}
      </div>
      <div css={{ fontSize: 11, color: mapUi.muted, marginBottom: 6 }}>
        {exact
          ? 'All records here share these coordinates.'
          : 'Average position of the records in this marker.'}
      </div>
      <Coordinates position={marker.position} approximate={!exact} />
      <div css={{ display: 'flex', gap: 6, marginTop: 8 }}>
        {!isSelected && (
          <TextButton
            primary
            onClick={() => {
              onSelectMarker(marker, false);
              onClose();
            }}
          >
            Show records
          </TextButton>
        )}
        {!exact && (
          <TextButton
            onClick={() => {
              onZoomTo(marker.bounds);
              onClose();
            }}
          >
            Zoom in
          </TextButton>
        )}
      </div>
    </>
  );
}

/** fits the map to `bounds` whenever a new request object arrives */
export function MapFitBounds({ request }: { request?: { bounds: Bounds } }) {
  const map = useMap();
  useEffect(() => {
    if (request == null) return;
    const { southWest, northEast } = request.bounds;
    map.fitBounds(
      new LatLngBounds(
        [southWest.lat, southWest.lng],
        [northEast.lat, northEast.lng]
      ),
      { padding: [40, 40], maxZoom: 16 }
    );
  }, [map, request]);
  return null;
}

/**
 * Leaflet only notices window resizes; tell it when its container changes
 * size because a side panel opened or closed, or a bar changed height.
 *
 * Leaflet's default is to keep the map's *centre* fixed, which makes every
 * marker jump sideways when a panel opens. Instead keep what is on screen
 * exactly where it is: resize without panning (which pins the map to the
 * container's top-left corner), then pan by however far that corner moved.
 */
export function MapResizeObserver() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    if (typeof ResizeObserver === 'undefined') return;
    let previous = container.getBoundingClientRect();
    const observer = new ResizeObserver(() => {
      const current = container.getBoundingClientRect();
      const dx = current.left - previous.left;
      const dy = current.top - previous.top;
      previous = current;
      map.invalidateSize({ pan: false });
      if (dx !== 0 || dy !== 0) map.panBy([dx, dy], { animate: false });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);
  return null;
}
