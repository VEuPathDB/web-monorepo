import {
  IsEnabledInPickerProps,
  VisualizationProps,
  VisualizationType,
} from '../VisualizationTypes';
import map from './selectorIcons/map.svg';
import * as t from 'io-ts';

// map component related imports
import MapVEuMap, {
  MapVEuMapProps,
} from '@veupathdb/components/lib/map/MapVEuMap';
import { defaultAnimationDuration } from '@veupathdb/components/lib/map/config/map.json';
import geohashAnimation from '@veupathdb/components/lib/map/animation_functions/geohash';
import { BoundsViewport } from '@veupathdb/components/lib/map/Types';
import DonutMarker from '@veupathdb/components/lib/map/DonutMarker';
import { BoundsDriftMarkerProps } from '@veupathdb/components/lib/map/BoundsDriftMarker';

// general ui imports
import { FormControl, Select, MenuItem, InputLabel } from '@material-ui/core';

// viz-related imports
import { PlotLayout } from '../../layouts/PlotLayout';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { useMemo, useCallback, useState, ReactElement } from 'react';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import DataClient, { MapMarkersRequestParams } from '../../../api/DataClient';
import { useVizConfig } from '../../../hooks/visualizations';
import { usePromise } from '../../../hooks/promise';
import { filtersFromBoundingBox } from '../../../utils/visualization';
import { useUpdateThumbnailEffect } from '../../../hooks/thumbnails';
import { OutputEntityTitle } from '../OutputEntityTitle';
import { sumBy } from 'lodash';
import PluginError from '../PluginError';

export const mapVisualization: VisualizationType = {
  selectorComponent: SelectorComponent,
  fullscreenComponent: MapViz,
  createDefaultConfig: createDefaultConfig,
  isEnabledInPicker: isEnabledInPicker,
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

function isEnabledInPicker({ geoConfigs }: IsEnabledInPickerProps): boolean {
  return geoConfigs != null && geoConfigs.length > 0;
}

const defaultAnimation = {
  method: 'geohash',
  animationFunction: geohashAnimation,
  duration: defaultAnimationDuration,
};

type MapConfig = t.TypeOf<typeof MapConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const MapConfig = t.intersection([
  t.type({
    mapCenterAndZoom: t.type({
      latitude: t.number,
      longitude: t.number,
      zoomLevel: t.number,
    }),
  }),
  t.partial({
    geoEntityId: t.string,
    outputEntityId: t.string,
  }),
]);

type MarkerDataWithStatistics = {
  markers: Array<ReactElement<BoundsDriftMarkerProps>>;
  totalEntityCount: number;
};

function MapViz(props: VisualizationProps) {
  const {
    computation,
    visualization,
    updateConfiguration,
    updateThumbnail,
    filters,
    totalCounts,
    filteredCounts,
    geoConfigs,
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

  const handleViewportChanged: MapVEuMapProps['onViewportChanged'] = useCallback(
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

  const [boundsZoomLevel, setBoundsZoomLevel] = useState<BoundsViewport>();

  const geoConfig = useMemo(() => {
    if (vizConfig.geoEntityId == null) return undefined;
    return geoConfigs.find(
      (config) => config.entity.id === vizConfig.geoEntityId
    );
  }, [vizConfig.geoEntityId]);

  const [geoEntity, outputEntity] = useMemo(() => {
    const geoEntity =
      vizConfig.geoEntityId !== null
        ? entities.find((entity) => entity.id === vizConfig.geoEntityId)
        : undefined;
    const outputEntity =
      vizConfig.outputEntityId !== null
        ? entities.find((entity) => entity.id === vizConfig.outputEntityId)
        : undefined;
    return [geoEntity, outputEntity ?? geoEntity];
  }, [entities, vizConfig.outputEntityId, vizConfig.geoEntityId]);

  const data = usePromise<MarkerDataWithStatistics | undefined>(
    useCallback(async () => {
      // check all required vizConfigs are provided
      if (
        boundsZoomLevel == null ||
        vizConfig.geoEntityId == null ||
        geoConfig == null
      )
        return undefined;

      const { bounds, zoomLevel } = boundsZoomLevel;
      const geoEntityId = vizConfig.geoEntityId;
      const outputEntityId = vizConfig.outputEntityId ?? geoEntityId;

      // now prepare the rest of the request params
      const latitudeVariable = {
        entityId: geoEntityId,
        variableId: geoConfig.latitudeVariableId,
      };
      const longitudeVariable = {
        entityId: geoEntityId,
        variableId: geoConfig.longitudeVariableId,
      };
      const boundsFilters = filtersFromBoundingBox(
        // this will need to be memoized outside this usePromise for re-use in pie/histogram requests
        bounds,
        latitudeVariable,
        longitudeVariable
      );

      const requestParams: MapMarkersRequestParams = {
        studyId,
        filters: filters ? [...filters, ...boundsFilters] : boundsFilters,
        config: {
          outputEntityId: outputEntityId,
          geoAggregateVariable: {
            entityId: geoEntityId,
            variableId:
              geoConfig.aggregationVariableIds[
                geoConfig.zoomLevelToAggregationLevel(zoomLevel) - 1
              ],
          },
          latitudeVariable: latitudeVariable,
          longitudeVariable: longitudeVariable,
        },
      };

      // now get the data
      const response = await dataClient.getMapMarkers(
        computation.descriptor.type,
        requestParams
      );

      // TO DO: find out if MarkerProps.id is obsolete
      const markerElements = response.mapElements.map(
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

      return {
        markers: markerElements,
        totalEntityCount: sumBy(
          response.mapElements,
          (elem) => elem.entityCount
        ),
      };
    }, [
      studyId,
      filters,
      dataClient,
      vizConfig,
      boundsZoomLevel,
      computation.descriptor.type,
    ])
  );

  const [height, width] = [600, 1000];
  const { latitude, longitude, zoomLevel } = vizConfig.mapCenterAndZoom;

  // Create the ref that we send to the map in web-components
  const plotRef = useUpdateThumbnailEffect(
    updateThumbnail,
    { height, width },
    // The dependencies for needing to generate a new thumbnail
    [data.value, latitude, longitude, zoomLevel]
  );

  const plotNode = (
    <MapVEuMap
      viewport={{ center: [latitude, longitude], zoom: zoomLevel }}
      onViewportChanged={handleViewportChanged}
      onBoundsChanged={setBoundsZoomLevel}
      markers={data.value?.markers ?? []}
      animation={defaultAnimation}
      height={height}
      width={width}
      showGrid={geoConfig?.zoomLevelToAggregationLevel != null}
      zoomLevelToGeohashLevel={geoConfig?.zoomLevelToAggregationLevel}
      ref={plotRef}
    />
  );

  const handleGeoEntityChange = useCallback(
    (event: React.ChangeEvent<{ value: unknown }>) => {
      if (event != null)
        updateVizConfig({ geoEntityId: event.target.value as string });
    },
    [updateVizConfig]
  );

  const handleOutputEntityChange = useCallback(
    (event: React.ChangeEvent<{ value: unknown }>) => {
      if (event != null)
        updateVizConfig({ outputEntityId: event.target.value as string });
    },
    [updateVizConfig]
  );

  const availableOutputEntities = useMemo(() => {
    if (geoConfig == null) {
      return entities;
    } else {
      return Array.from(
        preorder(geoConfig.entity, (entity) => entity.children || [])
      );
    }
  }, [entities, geoConfig]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div>
        <FormControl style={{ minWidth: '450px' }}>
          <InputLabel>Choose an entity to map the locations of</InputLabel>
          <Select
            value={vizConfig.geoEntityId}
            onChange={handleGeoEntityChange}
          >
            {geoConfigs.map((geoConfig) => (
              <MenuItem key={geoConfig.entity.id} value={geoConfig.entity.id}>
                {geoConfig.entity.displayNamePlural ??
                  geoConfig.entity.displayName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl style={{ minWidth: '450px' }}>
          <InputLabel>
            Choose an entity to show the counts of
            {geoEntity &&
              ' (default: ' +
                (geoEntity.displayNamePlural ?? geoEntity.displayName) +
                ')'}
          </InputLabel>
          <Select
            value={vizConfig.outputEntityId}
            onChange={handleOutputEntityChange}
          >
            {availableOutputEntities.map((entity) => (
              <MenuItem key={entity.id} value={entity.id}>
                {entity.displayNamePlural ?? entity.displayName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <div>
          <p>
            (Note: if you want to show counts for anything other than Household,
            it's best to first subset aggressively and zoom in to a few hundred
            households.)
          </p>
        </div>
      </div>
      <PluginError
        error={data.error}
        outputSize={data.value?.totalEntityCount}
      />
      <OutputEntityTitle
        entity={outputEntity}
        outputSize={data.value?.totalEntityCount}
      />
      <PlotLayout
        isFaceted={false}
        legendNode={null}
        plotNode={plotNode}
        tableGroupNode={null}
      />
    </div>
  );
}
