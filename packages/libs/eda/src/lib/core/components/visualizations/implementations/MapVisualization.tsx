import { VisualizationProps, VisualizationType } from '../VisualizationTypes';
import map from './selectorIcons/map.svg';
import * as t from 'io-ts';

// map component related imports
import MapVEuMap from '@veupathdb/components/lib/map/MapVEuMap';
import { defaultAnimationDuration } from '@veupathdb/components/lib/map/config/map.json';
import geohashAnimation from '@veupathdb/components/lib/map/animation_functions/geohash';
import { BoundsViewport } from '@veupathdb/components/lib/map/Types';
import DonutMarker from '@veupathdb/components/lib/map/DonutMarker';
import { BoundsDriftMarkerProps } from '@veupathdb/components/lib/map/BoundsDriftMarker';

// viz-related imports
import { PlotLayout } from '../../layouts/PlotLayout';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { useMemo, useCallback, useState, ReactElement } from 'react';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import DataClient, { MapMarkersRequestParams } from '../../../api/DataClient';
import { useVizConfig } from '../../../hooks/visualizations';
import { usePromise } from '../../../hooks/promise';
import {
  filtersFromBoundingBox,
  leafletZoomLevelToGeohashVariableId,
} from '../../../utils/visualization';

export const mapVisualization: VisualizationType = {
  selectorComponent: SelectorComponent,
  fullscreenComponent: MapViz,
  createDefaultConfig: createDefaultConfig,
};

function SelectorComponent() {
  return (
    <img
      alt="Geographic map"
      style={{ height: '100%', width: '100%' }}
      src={map}
    />
  );
}

function createDefaultConfig(): MapConfig {
  return {
    mapCenterAndZoom: {
      latitude: 0,
      longitude: 0,
      zoomLevel: 1, // TO DO: check MapVEuMap minZoom hardcoded to 2
    },
  };
}

const defaultAnimation = {
  method: 'geohash',
  animationFunction: geohashAnimation,
  duration: defaultAnimationDuration,
};

type MapConfig = t.TypeOf<typeof MapConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const MapConfig = t.type({
  mapCenterAndZoom: t.type({
    latitude: t.number,
    longitude: t.number,
    zoomLevel: t.number,
  }),
});

function MapViz(props: VisualizationProps) {
  const {
    computation,
    visualization,
    updateConfiguration,
    updateThumbnail,
    filters,
    dataElementConstraints,
    dataElementDependencyOrder,
    starredVariables,
    toggleStarredVariable,
    totalCounts,
    filteredCounts,
  } = props;
  const studyMetadata = useStudyMetadata();
  const { id: studyId } = studyMetadata;
  const entities = useMemo(
    () =>
      Array.from(preorder(studyMetadata.rootEntity, (e) => e.children || [])),
    [studyMetadata]
  );
  const dataClient: DataClient = useDataClient();

  const [vizConfig, updateVizConfig] = useVizConfig(
    visualization.descriptor.configuration,
    MapConfig,
    createDefaultConfig,
    updateConfiguration
  );

  const handleViewportChanged = useCallback(
    ({ center, zoom }) => {
      if (center != null && center.length === 2 && zoom != null) {
        updateVizConfig({
          mapCenterAndZoom: {
            latitude: center[0],
            longitude: center[1],
            zoomLevel: zoom,
          },
        });
      }
    },
    [updateVizConfig]
  );

  const tempOutputEntityId = entities[0].id;

  const [boundsZoomLevel, setBoundsZoomLevel] = useState<BoundsViewport>();

  const latitudeVariableDetails = useMemo(
    () => ({
      entityId: tempOutputEntityId,
      variableId: 'OBI_0001620',
    }),
    [tempOutputEntityId]
  );
  const longitudeVariableDetails = useMemo(
    () => ({
      entityId: tempOutputEntityId,
      variableId: 'OBI_0001621',
    }),
    [tempOutputEntityId]
  );

  const markers = usePromise<
    Array<ReactElement<BoundsDriftMarkerProps>> | undefined
  >(
    useCallback(async () => {
      if (boundsZoomLevel == null) return [];

      const { bounds, zoomLevel } = boundsZoomLevel;

      const boundsFilters = filtersFromBoundingBox(
        bounds,
        latitudeVariableDetails,
        longitudeVariableDetails
      );
      // TO DO: add bounding box-based filters!

      const requestParams: MapMarkersRequestParams = {
        studyId,
        filters: filters ? [...filters, ...boundsFilters] : boundsFilters,
        config: {
          outputEntityId: tempOutputEntityId,
          geoAggregateVariable: {
            entityId: tempOutputEntityId,
            variableId: leafletZoomLevelToGeohashVariableId(zoomLevel),
          },
          latitudeVariable: latitudeVariableDetails,
          longitudeVariable: longitudeVariableDetails,
        },
      };
      const response = await dataClient.getMapMarkers(
        computation.descriptor.type,
        requestParams
      );

      // TO DO: find out if MarkerProps.id is obsolete
      return response.mapElements.map(
        ({
          avgLat,
          avgLon,
          minLat,
          minLon,
          maxLat,
          maxLon,
          entityCount,
          geoAggregateValue,
        }) => {
          const isAtomic = false; // TO DO: work with Danielle to get this info from back end
          const data = [
            {
              label: 'unknown',
              value: entityCount,
              color: 'white',
            },
          ];
          return (
            <DonutMarker
              id={geoAggregateValue}
              key={geoAggregateValue}
              position={{ lat: avgLat, lng: avgLon }}
              bounds={{
                southWest: { lat: minLat, lng: minLon },
                northEast: { lat: maxLat, lng: maxLon },
              }}
              data={data}
              isAtomic={isAtomic}
              duration={defaultAnimationDuration}
            />
          );
        }
      );
    }, [
      studyId,
      filters,
      dataClient,
      tempOutputEntityId,
      latitudeVariableDetails,
      longitudeVariableDetails,
      boundsZoomLevel,
      computation.descriptor.type,
      defaultAnimationDuration,
    ])
  );

  const { latitude, longitude, zoomLevel } = vizConfig.mapCenterAndZoom;
  const plotNode = (
    <MapVEuMap
      viewport={{ center: [latitude, longitude], zoom: zoomLevel }}
      onViewportChanged={handleViewportChanged}
      onBoundsChanged={setBoundsZoomLevel}
      markers={markers.value ?? []}
      animation={defaultAnimation}
      height={450}
      width={750}
      showGrid={true}
    />
  );

  return (
    <div>
      <PlotLayout
        isFaceted={false}
        legendNode={null}
        plotNode={plotNode}
        tableGroupNode={null}
      />
    </div>
  );
}
