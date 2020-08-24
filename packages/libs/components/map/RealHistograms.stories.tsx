import React, { ReactElement, useState, useCallback } from 'react';
// import { action } from '@storybook/addon-actions';
import MapVEuMap from './MapVEuMap';
import { BoundsViewport, MarkerProps } from './Types';
import { Marker, Tooltip } from 'react-leaflet';
import './TempIconHack';

import sampleSizeData from './test-data/geoclust-numeric-binning-testing.json';

export default {
  title: 'Numeric and Date',
  component: MapVEuMap,
};


/*
   This is a trivial marker data generator.  It returns 10 random points within the given bounds.
   The real thing should something with zoomLevel.
*/
const getSampleSizeMarkerElements = () => {
  return sampleSizeData.facets.geo.buckets.map((bucket, index) => {
    const lat = bucket.ltAvg;
    const long = bucket.lnAvg;
    let labels = [];
    let values = [];
    bucket.term.buckets.forEach((bucket) => {
      const start = bucket.val;
      labels.push(start+"-"+(start+50));
      values.push(bucket.count);
    });
    labels.push("200+");
    values.push(bucket.term.after.count);

    // labels and values now available for XyzMarker element
    return <Marker
      key={`marker_${index}`}
      position={[lat, long]}      
    >
      <Tooltip>
        {labels.join(" ")} <br/>
	{values.join(" ")}
      </Tooltip>
    </Marker>
  });
}


export const SampleSize = () => {
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getSampleSizeMarkerElements());
  }, [setMarkerElements])

  return (
    <MapVEuMap
    viewport={{center: [ 13.449566, -9.304301 ], zoom: 6}}
    height="600px" width="800px"
    onViewportChanged={handleViewportChanged}
    markers={markerElements}
    />
  );
}

