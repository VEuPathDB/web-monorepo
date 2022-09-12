import { useState, useMemo } from 'react';
import { useGeoConfig } from '../../hooks/geoConfig';
import { useMapMarkers } from '../../hooks/mapMarkers';
import { useStudyEntities, useStudyMetadata } from '../../hooks/workspace';
import { TriggerComponentTypes } from '../../types/fullScreenApp';
import MapVEuMap from '@veupathdb/components/lib/map/MapVEuMap';
import { defaultAnimation } from '../visualizations/implementations/MapVisualization';
import { BoundsViewport, Viewport } from '@veupathdb/components/lib/map/Types';
import { tinyLeafletZoomLevelToGeohashLevel } from '@veupathdb/components/lib/map/utils/leaflet-geohash';
import { GeoConfig } from '../../types/geoConfig';
import { isEqual } from 'lodash';

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

  const { markers = [], pending } = useMapMarkers({
    requireOverlay: false,
    boundsZoomLevel,
    geoConfig: miniGeoConfig,
    studyId: studyMetadata.id,
    filters: analysis?.descriptor.subset.descriptor,
    xAxisVariable: undefined, // appState.overlayVariable,
    computationType: 'pass',
    markerType: 'pie',
    miniMarkers: true,
  });

  const initialViewport: Viewport = {
    center: [0, 0],
    zoom: 0,
  };

  const [viewport, onViewportChanged] = useState<Viewport>(initialViewport);

  return (
    <MapVEuMap
      height={110}
      width={220}
      minZoom={0}
      viewport={viewport}
      flyToMarkers={isEqual(viewport, initialViewport)}
      onViewportChanged={onViewportChanged}
      onBoundsChanged={setBoundsZoomLevel}
      markers={markers}
      animation={defaultAnimation}
      zoomLevelToGeohashLevel={miniGeoConfig.zoomLevelToAggregationLevel}
      showSpinner={pending}
      showMouseToolbar={false}
      showGrid={false}
      showScale={false}
      showAttribution={false}
      showLayerSelector={false}
      showZoomControl={false}
    />
  );
}
