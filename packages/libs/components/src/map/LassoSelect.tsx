/*
 * One-shot freehand lasso for selecting markers.
 *
 * While `active`, the next mouse drag on the map draws a lasso instead of
 * panning. When the mouse is released the lasso is reported through
 * `onLassoFinished` and the tool switches itself off (`onDeactivated`).
 * Escape cancels. Unlike GeoShapeSelect (the lasso *filter* editor used in
 * the EDA subsetting UI), no shape is kept on the map afterwards.
 */
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
// side-effect import (registers L.lasso) kept separate from the type import
import 'leaflet-lasso';
import { LassoHandlerFinishedEvent } from 'leaflet-lasso';
import { LatLngPoint } from './utils/pointInPolygon';

export interface LassoSelectProps {
  active: boolean;
  /** the drawn ring (unclosed); `additive` if ctrl/cmd/shift was held */
  onLassoFinished: (polygon: LatLngPoint[], additive: boolean) => void;
  /** the tool switched itself off (finished or cancelled) */
  onDeactivated: () => void;
}

const lassoStyle: L.PolylineOptions = {
  color: '#1f6fb2',
  weight: 2,
  dashArray: '6 3',
  fillOpacity: 0.08,
};

export default function LassoSelect(props: LassoSelectProps) {
  const { active } = props;
  const map = useMap();

  // latest-value refs so leaflet handlers registered once see fresh props
  const onFinishedRef = useRef(props.onLassoFinished);
  onFinishedRef.current = props.onLassoFinished;
  const onDeactivatedRef = useRef(props.onDeactivated);
  onDeactivatedRef.current = props.onDeactivated;

  useEffect(() => {
    if (!active) return;
    const handler = L.lasso(map, { polygon: lassoStyle });

    const handleFinished = (leafletEvent: L.LeafletEvent) => {
      const event = leafletEvent as LassoHandlerFinishedEvent;
      const polygon = (event.latLngs ?? []).map(({ lat, lng }) => ({
        lat,
        lng,
      }));
      const original = event.originalEvent;
      const additive =
        original != null &&
        (original.ctrlKey || original.metaKey || original.shiftKey);
      // the mouseup that ends the lasso can be followed by a map 'click',
      // which callers commonly use to clear the selection; swallow it
      suppressNextClick(map.getContainer());
      // defer: the parent's state update may re-render the map while
      // leaflet is still dispatching this event
      setTimeout(() => {
        if (polygon.length >= 3) onFinishedRef.current(polygon, additive);
      }, 0);
    };
    const handleDisabled = () => {
      setTimeout(() => onDeactivatedRef.current(), 0);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handler.disable();
    };

    map.on('lasso.finished', handleFinished);
    map.on('lasso.disabled', handleDisabled);
    document.addEventListener('keydown', handleKeyDown);
    handler.enable();

    return () => {
      map.off('lasso.finished', handleFinished);
      map.off('lasso.disabled', handleDisabled);
      document.removeEventListener('keydown', handleKeyDown);
      if (handler.enabled()) handler.disable();
    };
  }, [active, map]);

  return null;
}

function suppressNextClick(container: HTMLElement) {
  const swallow = (event: MouseEvent) => {
    event.stopPropagation();
    container.removeEventListener('click', swallow, true);
  };
  container.addEventListener('click', swallow, true);
  // only the click belonging to this gesture
  setTimeout(() => container.removeEventListener('click', swallow, true), 400);
}
