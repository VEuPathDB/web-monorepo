import type { Filter, StringPrefixSetFilter } from '../../../core/types/filter';
import type { GeoConfig } from '../../../core/types/geoConfig';
import type { GeoCoordUIState } from '../../../core/components/filter/geoCoordUIState';
import { geohashBounds, intersectPrefixSets } from '../utils/geohashSelection';
import { finestGeohashVariableId } from '../utils/geoEntities';

/**
 * "Filter to selection": turn the map selection into a subset filter.
 *
 * The filter is exactly the one the regular EDA workspace's lasso filter
 * (GeoCoordFilter) manages — a single `stringPrefixSet` filter on the
 * location entity's finest geohash variable — so it can be inspected and
 * edited in either workspace. If such a filter already exists, the new one
 * is its intersection with the selection (the selection was made on data
 * that the existing filter had already narrowed, and a coarse marker
 * could otherwise widen it again).
 */
export function filtersWithSelection(
  filters: Filter[],
  geoConfig: GeoConfig,
  selectionPrefixes: string[]
): { filters: Filter[]; prefixSet: string[] } | undefined {
  const entityId = geoConfig.entity.id;
  const variableId = finestGeohashVariableId(geoConfig);
  const isGeoFilter = (filter: Filter): filter is StringPrefixSetFilter =>
    filter.type === 'stringPrefixSet' &&
    filter.entityId === entityId &&
    filter.variableId === variableId;
  const existing = filters.find(isGeoFilter);
  const prefixSet = existing
    ? intersectPrefixSets(existing.prefixSet, selectionPrefixes)
    : selectionPrefixes;
  if (prefixSet.length === 0) return undefined;
  return {
    prefixSet,
    filters: [
      ...filters.filter((filter) => !isGeoFilter(filter)),
      { type: 'stringPrefixSet', entityId, variableId, prefixSet },
    ],
  };
}

/** GeoCoordFilter's UI-state key for a location entity */
export function geoCoordUIStateKey(geoConfig: GeoConfig) {
  return `${geoConfig.entity.id}/${geoConfig.latitudeVariableId}/${geoConfig.longitudeVariableId}`;
}

/** above this many cells the shapes would be unwieldy to edit */
export const MAX_EDITABLE_SHAPES = 200;

/**
 * GeoCoordFilter keeps the editable lasso shapes next to the filter. Give
 * it one rectangle per selected geohash cell, inset by 1% so that a later
 * edit does not pull in the neighbouring cells it touches, and open its
 * map where the user was looking.
 */
export function geoCoordUIStateForSelection(
  existing: Partial<GeoCoordUIState> | undefined,
  prefixSet: string[],
  viewport: { center: [number, number]; zoom: number }
): GeoCoordUIState {
  const selectedShapes =
    prefixSet.length <= MAX_EDITABLE_SHAPES
      ? prefixSet.map((prefix): [number, number][] => {
          const { south, west, north, east } = geohashBounds(prefix);
          const dLat = (north - south) * 0.01;
          const dLng = (east - west) * 0.01;
          return [
            [south + dLat, west + dLng],
            [north - dLat, west + dLng],
            [north - dLat, east - dLng],
            [south + dLat, east - dLng],
          ];
        })
      : [];
  return {
    ...existing,
    mapCenterAndZoom: {
      latitude: viewport.center[0],
      longitude: viewport.center[1],
      zoomLevel: viewport.zoom,
    },
    selectedShapes,
  };
}
