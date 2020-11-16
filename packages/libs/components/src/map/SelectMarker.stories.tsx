import React, {ReactElement, useCallback, useState} from "react";
import {BoundsViewport, MarkerProps} from "./Types";
import MapVEuMap from "./MapVEuMap";
import geohashAnimation from "./animation_functions/geohash";
import testData from './test-data/geoclust-date-binning-testing-all-levels.json';
import CustomDriftMarker from "./CustomDriftMarker";

export default {
  title: 'Select Marker',
  // component: SelectMarker,
};

const zoomLevelToGeohashLevel = [
  1, // 0
  1, // 1
  1, // 2
  1, // 3
  2, // 4
  2, // 5
  2, // 6
  3, // 7
  3, // 8
  3, // 9
  4, // 10
  4, // 11
  4, // 12
  5, // 13
  5, // 14
  5, // 15
  6, // 16
  6, // 17
  7  // 18
];

const getMarkerElements = ({ bounds, zoomLevel }: BoundsViewport, numMarkers : number, duration : number, scrambleKeys: boolean = false ) => {
  console.log("I've been triggered with bounds=["+bounds.southWest+" TO "+bounds.northEast+"] and zoom="+zoomLevel);

  const geohashLevel = zoomLevelToGeohashLevel[zoomLevel];
  const currentLevelData = testData[`geohash_${geohashLevel}`]

  return currentLevelData.facets.geo.buckets.map((bucket) => {
    if (bucket.val.length == geohashLevel) {
      return (
        <CustomDriftMarker
          duration={duration}
          bucket={bucket}
          key={bucket.val}
        />
        )
    }
  })
};

export const SelectMarker = () => {
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const duration = 300;

  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getMarkerElements(bvp, 100000, duration));
  }, [setMarkerElements]);

  return (
      <MapVEuMap
          viewport={{center: [ 20, -3 ], zoom: 7}}
          height="96vh" width="98vw"
          onViewportChanged={handleViewportChanged}
          markers={markerElements}
          animation={{
            method: "geohash",
            duration: 300,
            animationFunction: geohashAnimation
          }}
          showGrid={true}
      />
  );
};