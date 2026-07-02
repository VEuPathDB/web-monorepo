import { useCallback, useEffect, useMemo, useState } from 'react';
import * as t from 'io-ts';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { isEqual } from 'lodash';
import { Rectangle } from 'react-leaflet';

// map component related imports
import MapVEuMap, {
  MapVEuMapProps,
  baseLayers,
} from '@veupathdb/components/lib/map/MapVEuMap';
import SemanticMarkers from '@veupathdb/components/lib/map/SemanticMarkers';
import { defaultAnimationDuration } from '@veupathdb/components/lib/map/config/map';
import geohashAnimation from '@veupathdb/components/lib/map/animation_functions/geohash';
import { Bounds, BoundsViewport } from '@veupathdb/components/lib/map/Types';

import { AnalysisState } from '../../hooks/analysis';
import { useMapMarkers } from '../../hooks/mapMarkers';
import { StudyEntity, StudyMetadata } from '../../types/study';
import { GeoConfig } from '../../types/geoConfig';
import {
  Filter,
  LongitudeRangeFilter,
  NumberRangeFilter,
} from '../../types/filter';
import { useDeepValue } from '../../hooks/immutability';
import { GeoCoordVariable } from './types';
import { ResetButtonCoreUI } from '../ResetButton';

type Props = {
  studyMetadata: StudyMetadata;
  /** the selected variable: either the latitude or the longitude variable */
  variable: GeoCoordVariable;
  entity: StudyEntity;
  /** the geo configuration for `entity` */
  geoConfig: GeoConfig;
  analysisState: AnalysisState;
  totalEntityCount: number;
  filteredEntityCount: number;
};

// UI state (map center/zoom and base layer) is stored in the analysis'
// variable UI settings under a key shared by the latitude and longitude
// variables, so that the map looks the same whichever of the two is selected.
export type GeoCoordUIState = t.TypeOf<typeof GeoCoordUIState>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const GeoCoordUIState = t.intersection([
  t.type({
    mapCenterAndZoom: t.type({
      latitude: t.number,
      longitude: t.number,
      zoomLevel: t.number,
    }),
  }),
  t.partial({
    baseLayer: t.keyof(baseLayers),
  }),
]);

const defaultUIState: GeoCoordUIState = {
  mapCenterAndZoom: {
    latitude: 0,
    longitude: 0,
    zoomLevel: 1,
  },
};

const defaultAnimation = {
  method: 'geohash',
  animationFunction: geohashAnimation,
  duration: defaultAnimationDuration,
};

/**
 * A geographic filter for latitude/longitude variable pairs.
 *
 * Shows the same semantic-zooming marker map used elsewhere in EDA.
 * When the user holds ctrl/cmd and drags a rectangle on the map, two
 * filters are created in one go: a numberRange filter on the latitude
 * variable and a longitudeRange filter on the longitude variable
 * (the latter correctly handles rectangles spanning the antimeridian).
 *
 * See docs/geo-coordinate-filtering.md (in this package) for the design
 * notes and the roadmap towards lasso/arbitrary-shape (geohash-based)
 * filtering.
 */
export function GeoCoordFilter(props: Props) {
  const {
    entity,
    analysisState,
    geoConfig,
    studyMetadata,
    totalEntityCount,
    filteredEntityCount,
  } = props;
  const { setFilters } = analysisState;
  const filters = analysisState.analysis?.descriptor.subset.descriptor;

  const { latitudeVariableId, longitudeVariableId } = geoConfig;

  const latitudeVariable = entity.variables.find(
    (variable) => variable.id === latitudeVariableId
  );
  const longitudeVariable = entity.variables.find(
    (variable) => variable.id === longitudeVariableId
  );

  // current geo filters, if any
  const latFilter = filters?.find(
    (f): f is NumberRangeFilter =>
      f.entityId === entity.id &&
      f.variableId === latitudeVariableId &&
      f.type === 'numberRange'
  );
  const lngFilter = filters?.find(
    (f): f is LongitudeRangeFilter =>
      f.entityId === entity.id &&
      f.variableId === longitudeVariableId &&
      f.type === 'longitudeRange'
  );

  // all filters except the pair managed by this component;
  // used for the marker request so that the markers show the subset
  // produced by the *other* filters, with the current geo-selection
  // displayed as a rectangle on top (same principle as HistogramFilter's
  // foreground distribution + selected range highlight)
  const otherFilters = useDeepValue(
    filters?.filter(
      (f) =>
        f.entityId !== entity.id ||
        (f.variableId !== latitudeVariableId &&
          f.variableId !== longitudeVariableId)
    )
  );

  // map UI state is shared between the latitude and longitude variables
  const uiStateKey = `${entity.id}/${latitudeVariableId}/${longitudeVariableId}`;
  const variableUISettings =
    analysisState.analysis?.descriptor.subset.uiSettings;

  const uiState = useMemo(
    () =>
      pipe(
        GeoCoordUIState.decode(variableUISettings?.[uiStateKey]),
        getOrElse((): GeoCoordUIState => defaultUIState)
      ),
    [variableUISettings, uiStateKey]
  );

  const updateUIState = useCallback(
    (newUiState: Partial<GeoCoordUIState>) => {
      analysisState.setVariableUISettings((currentState) => ({
        ...currentState,
        [uiStateKey]: {
          ...uiState,
          ...newUiState,
        },
      }));
    },
    [analysisState, uiStateKey, uiState]
  );

  const [boundsZoomLevel, setBoundsZoomLevel] = useState<BoundsViewport>();

  const { markers, pending, basicMarkerError } = useMapMarkers({
    requireOverlay: false,
    boundsZoomLevel,
    geoConfig,
    studyId: studyMetadata.id,
    filters: otherFilters,
    computationType: 'pass',
    xAxisVariable: undefined,
    markerType: 'pie',
  });

  // fly to the data when the map has never been interacted with
  // (same approach as MapVisualization)
  const [willFlyTo, setWillFlyTo] = useState(false);
  useEffect(() => {
    if (pending) {
      setWillFlyTo(
        isEqual(uiState.mapCenterAndZoom, defaultUIState.mapCenterAndZoom)
      );
    }
  }, [pending, uiState.mapCenterAndZoom]);

  const handleViewportChanged: MapVEuMapProps['onViewportChanged'] =
    useCallback(
      ({ center, zoom }) => {
        if (center != null && center.length === 2 && zoom != null) {
          updateUIState({
            mapCenterAndZoom: {
              latitude: center[0],
              longitude: center[1],
              zoomLevel: zoom,
            },
          });
        }
      },
      [updateUIState]
    );

  const updateFilters = useCallback(
    (bounds: Bounds | undefined) => {
      const remainingFilters =
        filters?.filter(
          (f) =>
            f.entityId !== entity.id ||
            (f.variableId !== latitudeVariableId &&
              f.variableId !== longitudeVariableId)
        ) ?? [];
      if (bounds == null) {
        if (remainingFilters.length !== filters?.length)
          setFilters(remainingFilters);
      } else {
        const { left, right } = normalizeLongitudeRange(
          bounds.southWest.lng,
          bounds.northEast.lng
        );
        const newFilters: Filter[] = [
          {
            type: 'numberRange',
            entityId: entity.id,
            variableId: latitudeVariableId,
            min: bounds.southWest.lat,
            max: bounds.northEast.lat,
          },
          {
            type: 'longitudeRange',
            entityId: entity.id,
            variableId: longitudeVariableId,
            left,
            right,
          },
        ];
        setFilters(remainingFilters.concat(newFilters));
      }
    },
    [entity.id, filters, latitudeVariableId, longitudeVariableId, setFilters]
  );

  const handleAreaSelected = useCallback(
    (bounds: Bounds | undefined) => {
      // Defer the filter update out of the Leaflet event dispatch: setting
      // filters can trigger a route transition (e.g. a brand-new analysis is
      // created and redirected to on its first filter), and tearing the map
      // down while Leaflet is still dispatching the 'areaselected' event
      // corrupts its teardown.
      if (bounds != null) setTimeout(() => updateFilters(bounds), 0);
    },
    [updateFilters]
  );

  // the bounds of the current selection, for display as a rectangle;
  // when the longitude range spans the antimeridian, extend the east edge
  // past 180 so that Leaflet renders one rectangle crossing the dateline
  const selectedBounds = useMemo(() => {
    if (latFilter == null || lngFilter == null) return undefined;
    return {
      southWest: { lat: latFilter.min, lng: lngFilter.left },
      northEast: {
        lat: latFilter.max,
        lng:
          lngFilter.right < lngFilter.left
            ? lngFilter.right + 360
            : lngFilter.right,
      },
    };
  }, [latFilter, lngFilter]);

  const { latitude, longitude, zoomLevel } = uiState.mapCenterAndZoom;
  const [height, width] = [500, '100%'] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1em',
          maxWidth: 800,
        }}
      >
        <div style={{ flex: 1 }}>
          {selectedBounds != null && latFilter != null && lngFilter != null ? (
            <div>
              <b>Selected area:</b> latitude from {formatCoord(latFilter.min)}{' '}
              to {formatCoord(latFilter.max)}, longitude from{' '}
              {formatCoord(lngFilter.left)} to {formatCoord(lngFilter.right)}
              {lngFilter.right < lngFilter.left
                ? ' (crossing the antimeridian)'
                : ''}
              . {filteredEntityCount.toLocaleString()} of{' '}
              {totalEntityCount.toLocaleString()}{' '}
              {entity.displayNamePlural ?? entity.displayName} remain in the
              subset.
            </div>
          ) : (
            <div>
              <i>
                Hold <b>Ctrl</b> (or <b>⌘</b> on Mac) and drag a rectangle on
                the map to filter{' '}
                {entity.displayNamePlural ?? entity.displayName} by{' '}
                {latitudeVariable?.displayName ?? 'latitude'} and{' '}
                {longitudeVariable?.displayName ?? 'longitude'} together.
              </i>
            </div>
          )}
        </div>
        {selectedBounds != null && (
          <ResetButtonCoreUI
            size={'medium'}
            text={'Clear selection'}
            themeRole={'primary'}
            tooltip={'Remove the latitude and longitude filters'}
            disabled={false}
            onPress={() => updateFilters(undefined)}
          />
        )}
      </div>
      {basicMarkerError != null && (
        <div style={{ color: 'red' }}>{String(basicMarkerError)}</div>
      )}
      <div style={{ maxWidth: 800 }}>
        <MapVEuMap
          viewport={{ center: [latitude, longitude], zoom: zoomLevel }}
          onViewportChanged={handleViewportChanged}
          onBoundsChanged={setBoundsZoomLevel}
          height={height}
          width={width}
          showGrid={geoConfig.zoomLevelToAggregationLevel != null}
          zoomLevelToGeohashLevel={geoConfig.zoomLevelToAggregationLevel}
          baseLayer={uiState.baseLayer}
          onBaseLayerChanged={(newBaseLayer) =>
            updateUIState({ baseLayer: newBaseLayer })
          }
          showSpinner={pending}
          showScale={zoomLevel != null && zoomLevel > 4}
          defaultViewport={{
            center: [
              defaultUIState.mapCenterAndZoom.latitude,
              defaultUIState.mapCenterAndZoom.longitude,
            ],
            zoom: defaultUIState.mapCenterAndZoom.zoomLevel,
          }}
        >
          <SemanticMarkers
            markers={markers ?? []}
            animation={defaultAnimation}
            flyToMarkers={
              markers != null && markers.length > 0 && willFlyTo && !pending
            }
            flyToMarkersDelay={500}
            onAreaSelected={handleAreaSelected}
          />
          {/* boundsZoomLevel is only set once the map is fully created, so
              gating on it keeps the Rectangle's mount out of the same commit
              as the map's initialization (react-leaflet v3 races) */}
          {selectedBounds != null && boundsZoomLevel != null && (
            <Rectangle
              bounds={[
                [selectedBounds.southWest.lat, selectedBounds.southWest.lng],
                [selectedBounds.northEast.lat, selectedBounds.northEast.lng],
              ]}
              pathOptions={{
                color: '#333333',
                weight: 2,
                dashArray: '6 3',
                fillOpacity: 0.05,
                interactive: false,
              }}
            />
          )}
        </MapVEuMap>
      </div>
    </div>
  );
}

/**
 * Bring a longitude selection into the -180..180 range used by the
 * subsetting service's longitudeRange filter. `left > right` is
 * meaningful (it denotes a range crossing the antimeridian), so a
 * selection wider than a whole world is clamped to the whole world.
 */
function normalizeLongitudeRange(
  west: number,
  east: number
): { left: number; right: number } {
  if (east - west >= 360) return { left: -180, right: 180 };
  return { left: constrainLongitude(west), right: constrainLongitude(east) };
}

function constrainLongitude(lng: number): number {
  while (lng > 180) lng -= 360;
  while (lng < -180) lng += 360;
  return lng;
}

function formatCoord(value: number): string {
  // 4 decimal places is ~11m resolution; plenty for a map-drawn filter
  return String(Number(value.toFixed(4)));
}
