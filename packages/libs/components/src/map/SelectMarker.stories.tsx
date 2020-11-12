import React, {ReactElement, useCallback, useState} from "react";
import {BoundsViewport, MarkerProps} from "./Types";
import MapVEuMap from "./MapVEuMap";
import geohashAnimation from "./animation_functions/geohash";
import Geohash from "latlon-geohash";
import md5 from "md5";
import {DriftMarker} from "leaflet-drift-marker";
import {LatLngBounds, Tooltip} from "react-leaflet";
import speciesData from './test-data/geoclust-species-testing.json';
import MapVEuMapSidebar from "./MapVEuMapSidebar";

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

const getMarkerElements = ({ bounds, zoomLevel }: BoundsViewport, numMarkers : number, duration : number, handleMarkerClicked: (markerBounds: LatLngBounds) => void, scrambleKeys: boolean = false) => {
  console.log("I've been triggered with bounds=["+bounds.southWest+" TO "+bounds.northEast+"] and zoom="+zoomLevel);
  const geohashLevel = zoomLevelToGeohashLevel[zoomLevel];

  return speciesData.facets.geo.buckets.map((bucket) => {
    if (bucket.val.length == geohashLevel) {
      return <DriftMarker
          duration={duration}
          key={bucket.val}
          position={[bucket.ltAvg, bucket.lnAvg]}
          // @ts-ignore
          onClick={() => handleMarkerClicked([[bucket.ltMin, bucket.lnMax], [bucket.ltMax, bucket.lnMin]])}
      >
        <Tooltip>
          <span>{`key: ${bucket.val}`}</span><br/>
          <span>{`#aggregated: ${bucket.count}`}</span><br/>
          <span>{`lat: ${bucket.ltAvg}`}</span><br/>
          <span>{`lon: ${bucket.lnAvg}`}</span>
        </Tooltip>
      </DriftMarker>
    }
  })
};

export const SelectMarker = () => {
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const [ selectedMarkerBounds, setSelectedMarkerBounds ] = useState<any>(null)
  const duration = 300;

  const handleViewportChanged = useCallback((bvp: BoundsViewport, handleMarkerClicked: (markerBounds: LatLngBounds) => void) => {
    setMarkerElements(getMarkerElements(bvp, 100000, duration, handleMarkerClicked));
  }, [setMarkerElements]);

  const handleMarkerClicked= useCallback((markerBounds) => {
    setSelectedMarkerBounds(markerBounds)
  }, [setMarkerElements]);

  return (
      <MapVEuMap
          viewport={{center: [ 20, -3 ], zoom: 7}}
          height="96vh" width="98vw"
          // @ts-ignore
          onViewportChanged={handleViewportChanged}
          markers={markerElements}
          handleMarkerClicked={handleMarkerClicked}
          selectedMarkerBounds={selectedMarkerBounds}
          animation={{
            method: "geohash",
            duration: 300,
            animationFunction: geohashAnimation
          }}
          showGrid={true}
      />
  );
};