import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { isEqual } from 'lodash';
import { Rectangle } from 'react-leaflet';

// map component related imports
import MapVEuMap, {
  MapVEuMapProps,
} from '@veupathdb/components/lib/map/MapVEuMap';
import SemanticMarkers from '@veupathdb/components/lib/map/SemanticMarkers';
import GeoShapeSelect from '@veupathdb/components/lib/map/GeoShapeSelect';
import { defaultAnimationDuration } from '@veupathdb/components/lib/map/config/map';
import geohashAnimation from '@veupathdb/components/lib/map/animation_functions/geohash';
import { BoundsViewport } from '@veupathdb/components/lib/map/Types';
import {
  polygonsToGeohashPrefixes,
  geohashCellBounds,
  LatLngShape,
} from '@veupathdb/components/lib/map/utils/polygonsToGeohashPrefixes';

import { AnalysisState } from '../../hooks/analysis';
import { useMapMarkers } from '../../hooks/mapMarkers';
import { StudyEntity, StudyMetadata } from '../../types/study';
import { GeoConfig } from '../../types/geoConfig';
import { Filter, StringPrefixSetFilter } from '../../types/filter';
import { useDeepValue } from '../../hooks/immutability';
import { GeoCoordVariable } from './types';
import { GeoCoordUIState, defaultGeoCoordUIState } from './geoCoordUIState';
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

const defaultAnimation = {
  method: 'geohash',
  animationFunction: geohashAnimation,
  duration: defaultAnimationDuration,
};

// Debugging aid: when true, a checkbox lets the user shade the geohash
// cells that make up the current stringPrefixSet filter, to visually
// verify the lasso-to-prefix-cover conversion. Flip to false to hide the
// checkbox; the rendering machinery below stays for future debugging.
const ENABLE_GEOHASH_CELL_DEBUG = true;

/**
 * A geographic filter for latitude/longitude variable pairs.
 *
 * Shows the same semantic-zooming marker map used elsewhere in EDA.
 * The user draws one or more freehand lasso shapes (editable via the
 * on-map toolbar); the shapes are converted to a multi-scale geohash
 * prefix cover and stored as a single stringPrefixSet filter on the
 * entity's finest geohash variable. The shapes themselves are persisted
 * in the analysis' variable UI settings so they can be re-edited.
 *
 * See docs/geo-coordinate-filtering.md (in this package) for the design
 * notes, and docs/superpowers/specs/2026-07-15-lasso-geo-filtering-design.md
 * (repo root) for the lasso design decisions.
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

  // the filter is a prefix set on the entity's finest geohash variable
  const finestAggregationVariableId =
    geoConfig.aggregationVariableIds[
      geoConfig.aggregationVariableIds.length - 1
    ];
  const maxGeohashLevel = geoConfig.aggregationVariableIds.length;

  const isManagedFilter = useCallback(
    (f: Filter) =>
      f.entityId === entity.id &&
      f.variableId === finestAggregationVariableId &&
      f.type === 'stringPrefixSet',
    [entity.id, finestAggregationVariableId]
  );

  // the current geo filter, if any
  const geoFilter = filters?.find((f): f is StringPrefixSetFilter =>
    isManagedFilter(f)
  );

  // all filters except the one managed by this component; used for the
  // marker request so that the markers show the subset produced by the
  // *other* filters, with the current selection drawn on top (same
  // principle as HistogramFilter's foreground distribution + highlight)
  const otherFilters = useDeepValue(
    filters?.filter((f) => !isManagedFilter(f))
  );

  // map UI state is shared between the latitude and longitude variables
  const uiStateKey = `${entity.id}/${latitudeVariableId}/${longitudeVariableId}`;
  const variableUISettings =
    analysisState.analysis?.descriptor.subset.uiSettings;

  const uiState = useMemo(
    () =>
      pipe(
        GeoCoordUIState.decode(variableUISettings?.[uiStateKey]),
        getOrElse((): GeoCoordUIState => defaultGeoCoordUIState)
      ),
    [variableUISettings, uiStateKey]
  );

  const updateUIState = useCallback(
    (newUiState: Partial<GeoCoordUIState>) => {
      analysisState.setVariableUISettings((currentState) => {
        const liveEntry = currentState[uiStateKey];
        return {
          ...currentState,
          [uiStateKey]: {
            ...uiState,
            ...(typeof liveEntry === 'object' && liveEntry != null
              ? liveEntry
              : {}),
            ...newUiState,
          },
        };
      });
    },
    [analysisState, uiStateKey, uiState]
  );

  const selectedShapes: LatLngShape[] = useMemo(
    () => uiState.selectedShapes ?? [],
    [uiState.selectedShapes]
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
        isEqual(
          uiState.mapCenterAndZoom,
          defaultGeoCoordUIState.mapCenterAndZoom
        )
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

  // true while a shapes change is between updateUIState and setFilters
  // (i.e. while the async prefix cover is being computed)
  const pendingFilterUpdateRef = useRef(false);
  // monotonically increasing sequence so a slow cover computation can
  // never clobber the filter produced by a newer edit
  const updateSeqRef = useRef(0);

  const handleShapesChanged = useCallback(
    (shapes: LatLngShape[]) => {
      const seq = ++updateSeqRef.current;
      pendingFilterUpdateRef.current = true;
      updateUIState({ selectedShapes: shapes });
      const remainingFilters =
        filters?.filter((f) => !isManagedFilter(f)) ?? [];
      if (shapes.length === 0) {
        pendingFilterUpdateRef.current = false;
        if (filters != null && remainingFilters.length !== filters.length)
          setFilters(remainingFilters);
        return;
      }
      polygonsToGeohashPrefixes(shapes, maxGeohashLevel)
        .then((prefixSet) => {
          if (seq !== updateSeqRef.current) return; // superseded
          pendingFilterUpdateRef.current = false;
          if (prefixSet.length === 0) return; // degenerate input; keep shapes visible, no filter
          setFilters([
            ...remainingFilters,
            {
              type: 'stringPrefixSet',
              entityId: entity.id,
              variableId: finestAggregationVariableId,
              prefixSet,
            },
          ]);
        })
        .catch((error) => {
          if (seq !== updateSeqRef.current) return; // superseded
          pendingFilterUpdateRef.current = false;
          console.error('Geohash cover computation failed', error);
        });
    },
    [
      filters,
      isManagedFilter,
      updateUIState,
      setFilters,
      entity.id,
      finestAggregationVariableId,
      maxGeohashLevel,
    ]
  );

  // Sync rule: the filter is the source of truth for subsetting. Clear
  // stored shapes when the filter has been removed externally (filter
  // chip ✕, filters list) or when saved shapes arrive at mount with no
  // filter (stale settings). Never clear while a local update is still
  // pending, nor when the component itself declined to create a filter
  // (degenerate cover) — those shapes stay visible for the user to edit.
  const geoFilterWasPresentRef = useRef(geoFilter != null);
  const hasMountSyncedRef = useRef(false);
  useEffect(() => {
    const wasPresent = geoFilterWasPresentRef.current;
    geoFilterWasPresentRef.current = geoFilter != null;
    const isMountSync = !hasMountSyncedRef.current;
    hasMountSyncedRef.current = true;
    if (
      geoFilter == null &&
      !pendingFilterUpdateRef.current &&
      selectedShapes.length > 0 &&
      (wasPresent || isMountSync)
    ) {
      updateUIState({ selectedShapes: [] });
    }
  }, [geoFilter, selectedShapes, updateUIState]);

  // debugging aid — see ENABLE_GEOHASH_CELL_DEBUG above
  const [showGeohashCells, setShowGeohashCells] = useState(false);

  const { latitude, longitude, zoomLevel } = uiState.mapCenterAndZoom;
  const [height, width] = [500, '100%'] as const;

  const entityDisplayName = entity.displayNamePlural ?? entity.displayName;

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
          {selectedShapes.length > 0 ? (
            <div>
              <b>Selected area:</b> {selectedShapes.length}{' '}
              {selectedShapes.length === 1 ? 'shape' : 'shapes'} drawn.{' '}
              {filteredEntityCount.toLocaleString()} of{' '}
              {totalEntityCount.toLocaleString()} {entityDisplayName} remain in
              the subset.
            </div>
          ) : (
            <div>
              <i>
                Use the lasso button (top left of the map, below the zoom
                controls) to draw one or more areas around the{' '}
                {entityDisplayName} you want to keep. Drawn areas can be
                reshaped, moved or deleted with the adjacent editing buttons.
              </i>
            </div>
          )}
        </div>
        {ENABLE_GEOHASH_CELL_DEBUG && geoFilter != null && (
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3em',
              whiteSpace: 'nowrap',
            }}
            title="Shade the geohash cells matched by the current filter"
          >
            <input
              type="checkbox"
              checked={showGeohashCells}
              onChange={(event) => setShowGeohashCells(event.target.checked)}
            />
            Shade filter's geohash cells ({geoFilter.prefixSet.length})
          </label>
        )}
        {selectedShapes.length > 0 && (
          <ResetButtonCoreUI
            size={'medium'}
            text={'Clear selection'}
            themeRole={'primary'}
            tooltip={'Remove all drawn areas and the geographic filter'}
            disabled={false}
            onPress={() => handleShapesChanged([])}
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
              defaultGeoCoordUIState.mapCenterAndZoom.latitude,
              defaultGeoCoordUIState.mapCenterAndZoom.longitude,
            ],
            zoom: defaultGeoCoordUIState.mapCenterAndZoom.zoomLevel,
          }}
        >
          <SemanticMarkers
            markers={markers ?? []}
            animation={defaultAnimation}
            flyToMarkers={
              markers != null && markers.length > 0 && willFlyTo && !pending
            }
            flyToMarkersDelay={500}
          />
          {/* boundsZoomLevel is only set once the map is fully created, so
              gating on it keeps GeoShapeSelect's mount out of the same
              commit as the map's initialization (react-leaflet v3 races) */}
          {boundsZoomLevel != null && (
            <GeoShapeSelect
              shapes={selectedShapes}
              onShapesChanged={handleShapesChanged}
            />
          )}
          {/* debugging overlay: shade the geohash cells the filter matches;
              finer (longer) prefixes are shaded slightly darker so the
              multi-scale structure of the cover is visible */}
          {showGeohashCells &&
            geoFilter != null &&
            boundsZoomLevel != null &&
            geoFilter.prefixSet.map((prefix) => {
              const bounds = geohashCellBounds(prefix);
              return (
                <Rectangle
                  key={prefix}
                  bounds={[bounds.southWest, bounds.northEast]}
                  pathOptions={{
                    color: '#e46f0e',
                    weight: 1,
                    fillOpacity: Math.min(0.12 + 0.04 * prefix.length, 0.4),
                    interactive: false,
                  }}
                />
              );
            })}
        </MapVEuMap>
      </div>
    </div>
  );
}
