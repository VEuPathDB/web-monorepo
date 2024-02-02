import React, { ReactElement, useState, useCallback } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
// import { action } from '@storybook/addon-actions';
import { BoundsViewport } from '../map/Types';
import { BoundsDriftMarkerProps } from '../map/BoundsDriftMarker';
import { defaultAnimationDuration } from '../map/config/map';
import { leafletZoomLevelToGeohashLevel } from '../map/utils/leaflet-geohash';
import {
  getSpeciesDonuts,
  getCollectionDateChartMarkers,
} from './api/getMarkersFromFixtureData';

import { LeafletMouseEvent } from 'leaflet';
import { Viewport } from '../map/MapVEuMap';

// sidebar & legend
import MapVEuMap, { MapVEuMapProps } from '../map/MapVEuMap';
import MapVEuMapSidebar from '../map/MapVEuMapSidebar';
// import legend
import { LegendProps } from '../map/MapVEuLegendSampleList';

import geohashAnimation from '../map/animation_functions/geohash';

import SemanticMarkers from '../map/SemanticMarkers';

export default {
  title: 'Map/Marker Selection',
  component: MapVEuMapSidebar,
} as Meta;

const defaultAnimation = {
  method: 'geohash',
  animationFunction: geohashAnimation,
  duration: defaultAnimationDuration,
};

export const DonutMarkers: Story<MapVEuMapProps> = (args) => {
  const [markerElements, setMarkerElements] = useState<
    ReactElement<BoundsDriftMarkerProps>[]
  >([]);
  const [legendData, setLegendData] = useState<LegendProps['data']>([]);
  const [viewport, setViewport] = useState<Viewport>({
    center: [13, 16],
    zoom: 4,
  });

  // make an array of objects state to list highlighted markers
  const [selectedMarkers, setSelectedMarkers] = useState<string[]>([]);

  console.log('selectedMarkers =', selectedMarkers);

  const handleMarkerClick = (e: LeafletMouseEvent) => {};

  const handleViewportChanged = useCallback(
    async (bvp: BoundsViewport) => {
      const markers = await getSpeciesDonuts(
        bvp,
        defaultAnimationDuration,
        setLegendData,
        handleMarkerClick
      );
      setMarkerElements(markers);
    },
    [setMarkerElements]
  );

  return (
    <>
      <MapVEuMap
        {...args}
        viewport={viewport}
        onViewportChanged={setViewport}
        onBoundsChanged={handleViewportChanged}
        zoomLevelToGeohashLevel={leafletZoomLevelToGeohashLevel}
      >
        <SemanticMarkers
          markers={markerElements}
          animation={defaultAnimation}
          selectedMarkers={selectedMarkers}
          setSelectedMarkers={setSelectedMarkers}
        />
      </MapVEuMap>
    </>
  );
};

DonutMarkers.args = {
  height: '100vh',
  width: '100vw',
  showGrid: true,
};

export const ChartMarkers: Story<MapVEuMapProps> = (args) => {
  const [markerElements, setMarkerElements] = useState<
    ReactElement<BoundsDriftMarkerProps>[]
  >([]);
  const [legendData, setLegendData] = useState<LegendProps['data']>([]);
  const [legendRadioValue, setLegendRadioValue] =
    useState<string>('Individual');
  const [viewport, setViewport] = useState<Viewport>({
    center: [13, 0],
    zoom: 6,
  });

  const [dependentAxisRange, setDependentAxisRange] = useState<number[]>([
    0, 0,
  ]);

  const duration = defaultAnimationDuration;

  // make an array of objects state to list highlighted markers
  const [selectedMarkers, setSelectedMarkers] = useState<string[]>([]);

  console.log('selectedMarkers =', selectedMarkers);

  const handleMarkerClick = (e: LeafletMouseEvent) => {};

  // send legendRadioValue instead of knob_YAxisRangeMethod: also send setYAxisRangeValue
  const handleViewportChanged = useCallback(
    async (bvp: BoundsViewport) => {
      // anim add duration & scrambleKeys
      const markers = await getCollectionDateChartMarkers(
        bvp,
        duration,
        setLegendData,
        handleMarkerClick,
        legendRadioValue,
        setDependentAxisRange
      );
      setMarkerElements(markers);
    },
    [setMarkerElements, legendRadioValue]
  );

  return (
    <>
      <MapVEuMap
        {...args}
        viewport={viewport}
        onViewportChanged={setViewport}
        onBoundsChanged={handleViewportChanged}
        showGrid={true}
        zoomLevelToGeohashLevel={leafletZoomLevelToGeohashLevel}
      >
        <SemanticMarkers
          markers={markerElements}
          animation={defaultAnimation}
          selectedMarkers={selectedMarkers}
          setSelectedMarkers={setSelectedMarkers}
        />
      </MapVEuMap>
    </>
  );
};

ChartMarkers.args = {
  height: '100vh',
  width: '100vw',
  showGrid: true,
};
