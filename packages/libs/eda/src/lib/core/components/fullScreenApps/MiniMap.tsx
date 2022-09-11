import { useState } from 'react';
import { useGeoConfig } from '../../hooks/geoConfig';
import { useMapMarkers } from '../../hooks/mapMarkers';
import { useStudyEntities, useStudyMetadata } from '../../hooks/workspace';
import { TriggerComponentTypes } from '../../types/fullScreenApp';
import MapVEuMap from '@veupathdb/components/lib/map/MapVEuMap';
import { defaultAnimation } from '../visualizations/implementations/MapVisualization';
import { BoundsViewport, Viewport } from '@veupathdb/components/lib/map/Types';

export function MiniMap(props: TriggerComponentTypes) {
  const { analysis } = props;

  const studyMetadata = useStudyMetadata();
  const studyEntities = useStudyEntities();

  const geoConfig = useGeoConfig(studyEntities)[0];
  if (geoConfig == null)
    throw new Error('Something is wrong with the geo config');

  const [boundsZoomLevel, setBoundsZoomLevel] = useState<BoundsViewport>();

  const { markers = [], pending } = useMapMarkers({
    requireOverlay: false,
    boundsZoomLevel,
    geoConfig: geoConfig,
    studyId: studyMetadata.id,
    filters: analysis?.descriptor.subset.descriptor,
    xAxisVariable: undefined, // appState.overlayVariable,
    computationType: 'pass',
    markerType: 'pie',
  });

  const [viewport, onViewportChanged] = useState<Viewport>({
    center: [0, 0],
    zoom: 1,
  });

  return (
    <MapVEuMap
      height={110}
      width={220}
      viewport={viewport}
      onViewportChanged={onViewportChanged}
      onBoundsChanged={setBoundsZoomLevel}
      markers={markers}
      animation={defaultAnimation}
      zoomLevelToGeohashLevel={geoConfig.zoomLevelToAggregationLevel}
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
