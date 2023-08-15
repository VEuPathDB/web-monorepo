import React, { ReactElement, useState, useCallback } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import MapVEuMap, { MapVEuMapProps } from '../map/MapVEuMap';
import { BoundsViewport } from '../map/Types';
import Geohash from 'latlon-geohash';
import '../map/TempIconHack';
import BoundsDriftMarker, {
  BoundsDriftMarkerProps,
} from '../map/BoundsDriftMarker';
import geohashAnimation from '../map/animation_functions/geohash';
import { defaultAnimationDuration } from '../map/config/map';
import { leafletZoomLevelToGeohashLevel } from '../map/utils/leaflet-geohash';
import { Viewport } from '../map/MapVEuMap';
import SemanticMarkers from '../map/SemanticMarkers';

export default {
  title: 'Map/Zoom animation',
  //  component: MapVEuMap,
} as Meta;

const defaultAnimation = {
  method: 'geohash',
  animationFunction: geohashAnimation,
  duration: defaultAnimationDuration,
};

//
// when we implement the donut and histogram markers as DriftMarkers
// maybe we can access the duration from context inside those components
// in the meantime we will have to pass the duration into the getMarkerElements function
//
const getMarkerElements = (
  { bounds, zoomLevel }: BoundsViewport,
  numMarkers: number,
  duration: number
) => {
  console.log(
    "I've been triggered with longitude bounds=[" +
      bounds.southWest.lng +
      ' TO ' +
      bounds.northEast.lng +
      '] and zoom=' +
      zoomLevel
  );

  let aggsByGeohash = new Map();

  // https://gist.github.com/mathiasbynens/5670917
  // Here’s a 100% deterministic alternative to `Math.random`. Google’s V8 and
  // Octane benchmark suites use this to ensure predictable results.

  let myRandom = (function () {
    var seed = 0x2f6e2b1;
    return function () {
      // Robert Jenkins’ 32 bit integer hash function
      seed = (seed + 0x7ed55d16 + (seed << 12)) & 0xffffffff;
      seed = (seed ^ 0xc761c23c ^ (seed >>> 19)) & 0xffffffff;
      seed = (seed + 0x165667b1 + (seed << 5)) & 0xffffffff;
      seed = ((seed + 0xd3a2646c) ^ (seed << 9)) & 0xffffffff;
      seed = (seed + 0xfd7046c5 + (seed << 3)) & 0xffffffff;
      seed = (seed ^ 0xb55a4f09 ^ (seed >>> 16)) & 0xffffffff;
      return (seed & 0xfffffff) / 0x10000000;
    };
  })();

  let lats: number[] = [];
  let longs: number[] = [];

  const geohashLevel = leafletZoomLevelToGeohashLevel(zoomLevel);
  console.log(`geohashlevel ${geohashLevel}`);
  Array(numMarkers)
    .fill(undefined)
    .map(() => {
      // pick a deterministic point anywhere on the globe (hence a large value for numMarkers)
      let lat = -90 + myRandom() * 180;
      let long = -180 + myRandom() * 360;

      // move some points closer to a randomly picked previous point
      if (lats.length > 0 && myRandom() < 0.75) {
        const idx = Math.floor(myRandom() * lats.length);
        lat = lat + (lats[idx] - lat) * 0.999;
        long = long + (longs[idx] - long) * 0.999;
      }

      const south = bounds.southWest.lat;
      const north = bounds.northEast.lat;

      const west = bounds.southWest.lng;
      const east = bounds.northEast.lng;
      const lambda = 1e-8; // accommodate tiny rounding errors

      // is it within the viewport bounds?
      if (
        lat > south &&
        lat < north &&
        (west < east - lambda
          ? long > west && long < east
          : west > east + lambda
          ? !(long > east && long < west)
          : true)
      ) {
        const geohash: string = Geohash.encode(lat, long, geohashLevel);

        let agg = aggsByGeohash.get(geohash);
        if (agg == null) {
          agg = {
            lat: 0,
            long: 0,
            latMin: undefined,
            latMax: undefined,
            longMin: undefined,
            longMax: undefined,
            count: 0,
            geohash,
          };
          aggsByGeohash.set(geohash, agg);
        }
        agg.lat = agg.lat + lat;
        agg.long = agg.long + long;
        if (agg.latMin == null || lat < agg.latMin) agg.latMin = lat;
        if (agg.longMin == null || long < agg.longMin) agg.longMin = long;
        if (agg.latMax == null || lat > agg.latMax) agg.latMax = lat;
        if (agg.longMax == null || long > agg.longMax) agg.longMax = long;

        agg.count++;
      }
      lats.push(lat);
      longs.push(long);
      return undefined;
    });

  return Array.from(aggsByGeohash.values()).map((agg) => {
    const meanLat = agg.lat / agg.count;
    const meanLong = agg.long / agg.count;
    const key = agg.geohash;
    return (
      <BoundsDriftMarker
        duration={duration}
        id={key}
        key={key}
        position={{ lat: meanLat, lng: meanLong }}
        bounds={{
          southWest: { lat: agg.latMin, lng: agg.longMin },
          northEast: { lat: agg.latMax, lng: agg.longMax },
        }}
      />
    );
  });
};

export const Default: Story<MapVEuMapProps> = (args) => {
  const [markerElements, setMarkerElements] = useState<
    ReactElement<BoundsDriftMarkerProps>[]
  >([]);
  const duration = defaultAnimationDuration;
  const handleViewportChanged = useCallback(
    (bvp: BoundsViewport) => {
      setMarkerElements(getMarkerElements(bvp, 100000, duration));
    },
    [setMarkerElements]
  );

  // add setViewport and onViewportChanged to test showScale
  const [viewport, setViewport] = useState<Viewport>({
    center: [20, -3],
    zoom: 5,
  });
  const onViewportChanged: MapVEuMapProps['onViewportChanged'] = useCallback(
    ({ center, zoom }) => {
      if (center != null && center.length === 2 && zoom != null) {
        setViewport({ center: center, zoom: zoom });
      }
    },
    [setMarkerElements]
  );

  return (
    <MapVEuMap
      {...args}
      viewport={viewport}
      // add onViewportChanged to test showScale
      onViewportChanged={onViewportChanged}
      // test showScale: currently set to show from zoom = 5
      showScale={viewport.zoom != null && viewport.zoom > 4 ? true : false}
    >
      <SemanticMarkers
        onBoundsChanged={handleViewportChanged}
        markers={markerElements}
        animation={defaultAnimation}
      />
    </MapVEuMap>
  );
};
Default.args = {
  showGrid: true,
  zoomLevelToGeohashLevel: leafletZoomLevelToGeohashLevel,
  height: '100vh',
  width: '100vw',
};

interface DurationExtraProps {
  animationDuration: number;
}

export const DifferentSpeeds: Story<MapVEuMapProps & DurationExtraProps> = (
  args
) => {
  const [markerElements, setMarkerElements] = useState<
    ReactElement<BoundsDriftMarkerProps>[]
  >([]);
  const handleViewportChanged = useCallback(
    (bvp: BoundsViewport) => {
      setMarkerElements(getMarkerElements(bvp, 100000, args.animationDuration));
    },
    [setMarkerElements, args.animationDuration]
  );
  const [viewport, setViewport] = useState<Viewport>({
    center: [20, -3],
    zoom: 5,
  });

  return (
    <MapVEuMap {...args} viewport={viewport} onViewportChanged={setViewport}>
      <SemanticMarkers
        onBoundsChanged={handleViewportChanged}
        markers={markerElements}
        animation={{
          method: 'geohash',
          animationFunction: geohashAnimation,
          duration: args.animationDuration,
        }}
      />
    </MapVEuMap>
  );
};
DifferentSpeeds.args = {
  animationDuration: 2000,
  showGrid: true,
  zoomLevelToGeohashLevel: leafletZoomLevelToGeohashLevel,
  height: '100vh',
  width: '100vw',
};

export const NoAnimation: Story<MapVEuMapProps> = (args) => {
  const [markerElements, setMarkerElements] = useState<
    ReactElement<BoundsDriftMarkerProps>[]
  >([]);
  const handleViewportChanged = useCallback(
    (bvp: BoundsViewport) => {
      setMarkerElements(getMarkerElements(bvp, 100000, 1));
    },
    [setMarkerElements]
  );
  const [viewport, setViewport] = useState<Viewport>({
    center: [20, -3],
    zoom: 5,
  });

  return (
    <MapVEuMap {...args} viewport={viewport} onViewportChanged={setViewport}>
      <SemanticMarkers
        onBoundsChanged={handleViewportChanged}
        markers={markerElements}
        animation={null}
      />
    </MapVEuMap>
  );
};
NoAnimation.args = {
  showGrid: true,
  zoomLevelToGeohashLevel: leafletZoomLevelToGeohashLevel,
  height: '100vh',
  width: '100vw',
};
