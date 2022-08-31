import MapVEuMap from '@veupathdb/components/lib/map/MapVEuMap';
import { MouseMode } from '@veupathdb/components/lib/map/MouseTools';
import { Viewport } from '@veupathdb/components/lib/map/Types';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { useCallback } from 'react';
import { useMemo } from 'react';
import { useState } from 'react';
import {
  FullScreenAppPlugin,
  FullScreenComponentProps,
} from '../../types/fullScreenApp';
import { StudyMetadata } from '../../types/study';
import { entityToGeoConfig } from '../../utils/geoVariables';
import { leafletZoomLevelToGeohashLevel } from '../../utils/visualization';

function FullScreenMap(props: FullScreenComponentProps) {
  const [viewport, setViewport] = useState<Viewport>({
    center: [0, 0],
    zoom: 4,
  });
  const markers = useMemo(() => [], []);
  const [mouseMode, setMouseMode] = useState<MouseMode>('default');
  const onBoundsChanged = useCallback(() => {}, []);
  return (
    <MapVEuMap
      height="100%"
      width="100%"
      viewport={viewport}
      onBoundsChanged={onBoundsChanged}
      onViewportChanged={setViewport}
      markers={markers}
      animation={null}
      mouseMode={mouseMode}
      onMouseModeChange={setMouseMode}
    />
  );
}

function MapButton() {
  return <div>Open the map!</div>;
}

function isCompatibleWithStudy(study: StudyMetadata) {
  const geoConfigs = Array.from(
    preorder(study.rootEntity, (e) => e.children ?? [])
  )
    .map((entity) => entityToGeoConfig(entity, leafletZoomLevelToGeohashLevel))
    .filter((geoConfig) => geoConfig != null);
  return geoConfigs.length > 0;
}

export const fullScreenMapPlugin: FullScreenAppPlugin = {
  fullScreenComponent: FullScreenMap,
  triggerComponent: MapButton,
  isCompatibleWithStudy,
};
