import { VisualizationProps, VisualizationType } from '../VisualizationTypes';
import map from './selectorIcons/map.svg';
import * as t from 'io-ts';
import { VariableDescriptor } from '../../../types/variable';

// map component related imports
import MapVEuMap, {
  MapVEuMapProps,
} from '@veupathdb/components/lib/map/MapVEuMap';
import { defaultAnimationDuration } from '@veupathdb/components/lib/map/config/map.json';
import geohashAnimation from '@veupathdb/components/lib/map/animation_functions/geohash';

// viz-related imports
import { PlotLayout } from '../../layouts/PlotLayout';
import { useDataClient, useStudyMetadata } from '../../../hooks/workspace';
import { useMemo } from 'react';
import { preorder } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import DataClient from '../../../api/DataClient';
import { getOrElse } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/function';
import { useVizConfig } from '../../../hooks/visualizations';

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
  return {};
}

const defaultAnimation = {
  method: 'geohash',
  animationFunction: geohashAnimation,
  duration: defaultAnimationDuration,
};

type MapConfig = t.TypeOf<typeof MapConfig>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
const MapConfig = t.partial({
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

  const plotNode = (
    <MapVEuMap
      viewport={{ center: [13, 16], zoom: 4 }}
      onViewportChanged={() => null}
      markers={[]}
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
