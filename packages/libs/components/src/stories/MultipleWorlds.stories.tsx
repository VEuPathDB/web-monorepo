import React, { ReactElement, useCallback, useState } from 'react';
import { Story } from '@storybook/react';
import { BoundsViewport } from '../map/Types';
import { BoundsDriftMarkerProps } from '../map/BoundsDriftMarker';
import MapVEuMap, { MapVEuMapProps } from '../map/MapVEuMap';
import geohashAnimation from '../map/animation_functions/geohash';
import testDataStraddling from './fixture-data/geoclust-date-dateline-straddling-all-levels.json';
import BoundsDriftMarker from '../map/BoundsDriftMarker';
import { defaultAnimationDuration } from '../map/config/map';
import { leafletZoomLevelToGeohashLevel } from '../map/utils/leaflet-geohash';
import { Viewport } from '../map/MapVEuMap';
import '../map/TempIconHack';

export default {
  title: 'Map/Dateline Example',
  component: MapVEuMap,
};

const getMarkerElements = (
  { bounds, zoomLevel }: BoundsViewport,
  duration: number,
  data = testDataStraddling
) => {
  const {
    southWest: { lat: south, lng: west },
    northEast: { lat: north, lng: east },
  } = bounds;
  console.log(
    `I've been triggered with long bounds=[${west} TO ${east}] and zoom=${zoomLevel}`
  );

  const geohashLevel = leafletZoomLevelToGeohashLevel(zoomLevel);
  // filter data taking care of both east<west and east>west possibilities
  const buckets = (data as { [key: string]: any })[
    `geohash_${geohashLevel}`
  ].facets.geo.buckets.filter((bucket: any) => {
    const ltAvg: number = bucket.ltAvg;
    const lnAvg: number = bucket.lnAvg;
    const lambda = 1e-8; // accommodate tiny rounding errors
    if (west < east - lambda) {
      return ltAvg > south && ltAvg < north && lnAvg > west && lnAvg < east;
    }
    if (west > east + lambda) {
      return ltAvg > south && ltAvg < north && !(lnAvg > east && lnAvg < west);
    } else {
      return true;
    }
  });

  return buckets.map((bucket: any) => {
    if (bucket.val.length == geohashLevel) {
      return (
        <BoundsDriftMarker
          duration={duration}
          bounds={{
            southWest: { lat: bucket.ltMin, lng: bucket.lnMin },
            northEast: { lat: bucket.ltMax, lng: bucket.lnMax },
          }}
          position={{ lat: bucket.ltAvg, lng: bucket.lnAvg }}
          id={bucket.val}
          key={bucket.val}
        />
      );
    }
  });
};

const useDatelineArgs = () => {
  const [markerElements, setMarkerElements] = useState<
    ReactElement<BoundsDriftMarkerProps>[]
  >([]);
  const [viewport, setViewport] = useState<Viewport>({
    center: [0, 0],
    zoom: 2,
  });
  const duration = defaultAnimationDuration;

  const handleViewportChanged = useCallback(
    (bvp: BoundsViewport) => {
      setMarkerElements(getMarkerElements(bvp, duration, testDataStraddling));
    },
    [duration]
  );

  return {
    viewport: viewport,
    height: '100vh',
    width: '100vw',
    onViewportChanged: setViewport,
    onBoundsChanged: handleViewportChanged,
    markers: markerElements,
    animation: {
      method: 'geohash',
      duration: defaultAnimationDuration,
      animationFunction: geohashAnimation,
    },
    showGrid: true,
    zoomLevelToGeohashLevel: leafletZoomLevelToGeohashLevel,
  };
};

const Template = (args: MapVEuMapProps) => (
  <MapVEuMap {...useDatelineArgs()} {...args} />
);
export const DatelineData: Story<MapVEuMapProps> = Template.bind({});
