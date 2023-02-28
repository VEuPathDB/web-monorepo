import { useState, useMemo, useEffect } from 'react';
import { useGeoConfig } from '../../hooks/geoConfig';
import { useMapMarkers } from '../../hooks/mapMarkers';
import { useStudyEntities, useStudyMetadata } from '../../hooks/workspace';
import { TriggerComponentTypes } from '../../types/fullScreenApp';
import MapVEuMap, { Viewport } from '@veupathdb/components/lib/map/MapVEuMap';
import { defaultAnimation } from '../visualizations/implementations/MapVisualization';
import { BoundsViewport } from '@veupathdb/components/lib/map/Types';
import { tinyLeafletZoomLevelToGeohashLevel } from '@veupathdb/components/lib/map/utils/leaflet-geohash';
import { GeoConfig } from '../../types/geoConfig';
import { isEqual } from 'lodash';
import { Filter } from '../../types/filter';
import { Tooltip } from '@material-ui/core';

const emptyArray: Filter[] = [];
const initialViewport: Viewport = {
  center: [0, 0],
  zoom: 0,
};

export function MiniMap(props: TriggerComponentTypes) {
  const { analysis } = props;

  const studyMetadata = useStudyMetadata();
  const studyEntities = useStudyEntities();

  const geoConfig = useGeoConfig(studyEntities)[0];
  if (geoConfig == null)
    throw new Error('Something is wrong with the geo config');

  const miniGeoConfig: GeoConfig = useMemo(
    () => ({
      ...geoConfig,
      zoomLevelToAggregationLevel: tinyLeafletZoomLevelToGeohashLevel,
    }),
    [geoConfig, tinyLeafletZoomLevelToGeohashLevel]
  );

  const [boundsZoomLevel, setBoundsZoomLevel] = useState<BoundsViewport>();
  const [viewport, setViewport] = useState<Viewport>(initialViewport);
  const isDefaultView = isEqual(viewport, initialViewport);
  // For the initial unzoomed fetch of markers, don't use any filters.
  // This ensures that the flyTo zoom covers the area of the full, unfiltered dataset.
  const filters = isDefaultView
    ? emptyArray
    : analysis?.descriptor.subset.descriptor.length
    ? analysis?.descriptor.subset.descriptor
    : emptyArray;

  const { markers = [], pending } = useMapMarkers({
    requireOverlay: false,
    boundsZoomLevel,
    geoConfig: miniGeoConfig,
    studyId: studyMetadata.id,
    filters,
    xAxisVariable: undefined, // appState.overlayVariable,
    computationType: 'pass',
    markerType: 'pie',
    miniMarkers: true,
    invisibleMarkers: isDefaultView,
  });

  const entityDisplayName =
    geoConfig.entity.displayNamePlural ?? geoConfig.entity.displayName;

  // box-shadow approximated by eye to what EntityDiagram uses via SVG
  // TO DO: figure out how to make them exactly the same
  return (
    <Tooltip
      title={
        <div>
          Location of {entityDisplayName}
          {filters && filters.length ? ' in current subset' : ''}.<br />
          Click the map to enlarge...
        </div>
      }
    >
      <div className="MiniMapContainer">
        <MapVEuMap
          height={110}
          width={220}
          minZoom={0}
          viewport={viewport}
          flyToMarkers={isDefaultView}
          flyToMarkersDelay={1000}
          interactive={false}
          onViewportChanged={setViewport}
          onBoundsChanged={setBoundsZoomLevel}
          markers={markers}
          animation={defaultAnimation}
          zoomLevelToGeohashLevel={miniGeoConfig.zoomLevelToAggregationLevel}
          showSpinner={!isDefaultView && pending}
          showMouseToolbar={false}
          showGrid={false}
          showScale={false}
          showAttribution={false}
          showLayerSelector={false}
          showZoomControl={false}
        />
      </div>
    </Tooltip>
  );
}
