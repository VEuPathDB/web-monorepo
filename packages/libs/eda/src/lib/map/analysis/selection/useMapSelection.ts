import { useCallback, useMemo, useState } from 'react';
import { isEqual } from 'lodash';
import { MarkerSelectionGesture } from '@veupathdb/components/lib/map/BoundsDriftMarker';
import { GeoConfig } from '../../../core/types/geoConfig';
import { AppState, MapSelection } from '../appState';
import { MapSelectionProps, MarkerSummary } from '../mapTypes/types';
import {
  addPrefixes,
  classifyMarkers,
  normalizePrefixes,
  removePrefixes,
} from '../utils/geohashSelection';

interface Options {
  appState: AppState;
  geoConfig: GeoConfig;
  setSelection: (selection: MapSelection | undefined) => void;
  /** called whenever a gesture leaves something selected */
  onSelected?: () => void;
  onMarkerContextMenu: (marker: MarkerSummary) => void;
}

/**
 * Turns marker clicks, ctrl/cmd-drag boxes and lassos into changes of the
 * geohash-prefix selection stored in the analysis.
 */
export function useMapSelection({
  appState,
  geoConfig,
  setSelection,
  onSelected,
  onMarkerContextMenu,
}: Options) {
  const geoEntityId = geoConfig.entity.id;
  const { selection } = appState;
  // a selection made with another location entity does not apply
  const prefixes = useMemo(
    () =>
      selection != null && selection.geoEntityId === geoEntityId
        ? selection.prefixes
        : [],
    [selection, geoEntityId]
  );

  const [lassoActive, setLassoActive] = useState(false);
  const [renderedMarkers, setRenderedMarkers] = useState<MarkerSummary[]>([]);

  const updatePrefixes = useCallback(
    (next: string[]) => {
      setSelection(
        next.length > 0 ? { geoEntityId, prefixes: next } : undefined
      );
      if (next.length > 0) onSelected?.();
    },
    [geoEntityId, setSelection, onSelected]
  );

  const onSelectionGesture = useCallback(
    (markerIds: string[], gesture: MarkerSelectionGesture) => {
      switch (gesture) {
        case 'add':
          return updatePrefixes(addPrefixes(prefixes, markerIds));
        case 'remove':
          return updatePrefixes(removePrefixes(prefixes, markerIds));
        case 'replace':
          return updatePrefixes(normalizePrefixes(markerIds));
      }
    },
    [prefixes, updatePrefixes]
  );

  const clearSelection = useCallback(() => {
    setSelection(undefined);
  }, [setSelection]);

  // the marker layer re-renders often; only store genuinely new markers
  const onMarkersRendered = useCallback((markers: MarkerSummary[]) => {
    setRenderedMarkers((previous) =>
      isEqual(previous, markers) ? previous : markers
    );
  }, []);

  const selectionProps: MapSelectionProps = useMemo(
    () => ({
      prefixes,
      onSelectionGesture,
      onMarkerContextMenu,
      lassoActive,
      onLassoDeactivated: () => setLassoActive(false),
      onMarkersRendered,
    }),
    [
      prefixes,
      onSelectionGesture,
      onMarkerContextMenu,
      lassoActive,
      onMarkersRendered,
    ]
  );

  // the drawn markers that are (fully) selected
  const selectedMarkers = useMemo(() => {
    const { selected } = classifyMarkers(
      renderedMarkers.map(({ id }) => id),
      prefixes
    );
    return renderedMarkers.filter(({ id }) => selected.includes(id));
  }, [renderedMarkers, prefixes]);

  return {
    prefixes,
    hasSelection: prefixes.length > 0,
    selectionProps,
    selectedMarkers,
    renderedMarkers,
    lassoActive,
    setLassoActive,
    onSelectionGesture,
    clearSelection,
  };
}
