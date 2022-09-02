import * as t from 'io-ts';
import { useCallback, useMemo } from 'react';

import MapVEuMap from '@veupathdb/components/lib/map/MapVEuMap';
import { MouseMode } from '@veupathdb/components/lib/map/MouseTools';
import { Viewport } from '@veupathdb/components/lib/map/Types';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';

import { useVizConfig } from '../../hooks/visualizations';
import {
  FullScreenAppPlugin,
  FullScreenComponentProps,
} from '../../types/fullScreenApp';
import { StudyMetadata } from '../../types/study';
import { entityToGeoConfig } from '../../utils/geoVariables';
import { leafletZoomLevelToGeohashLevel } from '../../utils/visualization';

const MapState = t.type({
  viewport: t.type({
    center: t.tuple([t.number, t.number]),
    zoom: t.number,
  }),
  mouseMode: t.keyof({
    default: null,
    magnification: null,
  }),
});

const defaultMapState: t.TypeOf<typeof MapState> = {
  viewport: {
    center: [0, 0],
    zoom: 4,
  },
  mouseMode: 'default',
};

function FullScreenMap(props: FullScreenComponentProps) {
  const [appState, setAppState] = useVizConfig(
    props.appState,
    MapState,
    () => defaultMapState,
    props.persistAppState
  );
  const { viewport, mouseMode } = appState;

  // TODO Load from backend
  const markers = useMemo(() => [], []);

  // XXX What is this used for?
  const onBoundsChanged = useCallback(() => {}, []);

  const onViewportChanged = useCallback(
    (viewport: Viewport) => {
      setAppState({ viewport });
    },
    [setAppState]
  );

  const onMouseModeChange = useCallback(
    (mouseMode: MouseMode) => {
      setAppState({ mouseMode });
    },
    [setAppState]
  );

  return (
    <MapVEuMap
      height="100%"
      width="100%"
      viewport={viewport}
      onBoundsChanged={onBoundsChanged}
      onViewportChanged={onViewportChanged}
      markers={markers}
      animation={null}
      mouseMode={mouseMode}
      onMouseModeChange={onMouseModeChange}
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
