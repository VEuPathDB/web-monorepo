import React, { ReactElement, useState, useCallback } from 'react';
// import { action } from '@storybook/addon-actions';
import MapVEuMap from './MapVEuMap';
import { BoundsViewport, MarkerProps } from './Types';
import { Marker, Tooltip } from 'react-leaflet';
import './TempIconHack';

import sampleSizeData from './test-data/geoclust-numeric-binning-testing.json';
import collectionDateData from './test-data/geoclust-date-binning-testing.json';
import irData from './test-data/geoclust-irrescaled-binning-testing.json';

import { latLng, LeafletMouseEvent } from "leaflet";
import SVGDonutMarker from './SVGDonutMarker'; // TO BE CREATED

export default {
  title: 'SVG Donut Marker',
  component: MapVEuMap,
};

// some colors randomly pasted from the old mapveu code
// these are NOT the final decided colors for MapVEu 2.0
const all_colors_hex = [
  "#0200C5", // Bob1
  "#6300C5", // Bob2
  "#C400C5", // Bob3
  "#C50045", // Bob4
  "#C50000", // Bob5
  "#CEA262", // Grayish Yellow
  // "#817066", // Medium Gray

  // The following don't work well for people with defective color vision
  "#007D34", // Vivid Green
  "#F6768E", // Strong Purplish Pink
  "#00538A", // Strong Blue
  "#FF7A5C", // Strong Yellowish Pink
  "#53377A", // Strong Violet
  "#FF8E00", // Vivid Orange Yellow
  "#B32851", // Strong Purplish Red
  "#F4C800", // Vivid Greenish Yellow
  "#7F180D", // Strong Reddish Brown
  "#93AA00", // Vivid Yellowish Green
  "#593315", // Deep Yellowish Brown
  "#F13A13", // Vivid Reddish Orange
  "#232C16" // Dark Olive Green
];

//DKDK a generic function to remove a class: here it is used for removing highlight-marker
function removeClassName(targetClass: string) {
  //DKDK much convenient to use jquery here but try not to use it
  let targetElement = document.getElementsByClassName(targetClass)[0]
  if(targetElement !== undefined) {
      targetElement.classList.remove(targetClass)
  }
}

const handleClick = (e: LeafletMouseEvent) => {
  /**
   * DKDK this only works when selecting other marker: not working when clicking map
   * it may be achieved by setting all desirable events (e.g., map click, preserving highlight, etc.)
   * just stop here and leave detailed events to be handled later
   */
  // DKDK use a resuable function to remove a class
  removeClassName('highlight-marker')
  //DKDK native manner, but not React style? Either way this is arguably the simplest solution
  e.target._icon.classList.add('highlight-marker')
  //DKDK here, perhaps we can add additional click event, like opening sidebar when clicking
  // console.log(e)
}

/**
 * DKDK gathering functions here temporarily
 * Need to add export to be used in the other component
 */
  //DKDK top-marker test: mouseOver and mouseOut
  const handleMouseOver = (e: LeafletMouseEvent) => {
    e.target._icon.classList.add('top-marker')
    // console.log('onMouseOver', e)
  }

  const handleMouseOut = (e: LeafletMouseEvent) => {
    e.target._icon.classList.remove('top-marker')
    // console.log('onMouseOut', e)
  }

  /**
   This is a trivial marker data generator.  It returns 10 random points within the given bounds.
   The real thing should something with zoomLevel.
*/
const getSampleSizeMarkerElements = () => {
  return sampleSizeData.facets.geo.buckets.map((bucket, index) => {
    const lat = bucket.ltAvg;
    const long = bucket.lnAvg;
    let labels = [];
    let values = [];
    let colors: string[] = [];
    let noDataValue:number = 0;
    bucket.term.buckets.forEach((bucket, index) => {
      const start = bucket.val;
      labels.push(start+"-"+(start+50));
      values.push(bucket.count);
      colors.push(all_colors_hex[index]);     //DKDK set color palette
    });
    labels.push("200+");
    values.push(bucket.term.after.count);
    colors.push(all_colors_hex[labels.length]);     //DKDK fill the last color
    // colors.push(all_colors_hex[labels.length-1]);     //DKDK without fill the last color

    //DKDK calculate the number of no data and add it for coloring
    noDataValue = bucket.count - bucket.term.before.count - bucket.term.after.count - bucket.term.between.count
    labels.push("noData");
    values.push(noDataValue);
    colors.push("silver");     //DKDK fill the last color

    //DKDK check isAtomic
    let atomicValue = (bucket.atomicCount && bucket.atomicCount === 1) ? true : false

    return (
      <SVGDonutMarker
        key={bucket.val}
        //DKDK change position format
        position={[lat, long]}
        labels={labels}
        values={values}
        //DKDK colors is set to be optional props, if null (e.g., comment out) then bars will have skyblue-like defaultColor
        colors={colors}
        isAtomic={atomicValue}
        onClick={handleClick}
        onMouseOut={handleMouseOut}
        onMouseOver={handleMouseOver}
      />
      )
  });
}


export const SampleSize = () => {
  //DKDK set global or local
  // const yAxisRange: Array<number> | null = [0, 1104]
  // const yAxisRange: Array<number> | null = []
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getSampleSizeMarkerElements());
  }, [setMarkerElements])

  return (
    <MapVEuMap
    viewport={{center: [ 13.449566, -2.304301 ], zoom: 7}}
    height="100vh" width="100vw"
    onViewportChanged={handleViewportChanged}
    markers={markerElements}
    />
  );
}

export const SampleSizeNudged = () => {
  //DKDK set global or local
  // const yAxisRange: Array<number> | null = [0, 1104]
  // const yAxisRange: Array<number> | null = []
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getSampleSizeMarkerElements());
  }, [setMarkerElements])

  return (
    <MapVEuMap
    viewport={{center: [ 13.449566, -2.304301 ], zoom: 7}}
    height="100vh" width="100vw"
    onViewportChanged={handleViewportChanged}
    markers={markerElements}
    nudge="geohash"
    />
  );
}

const getCollectionDateMarkerElements = () => {
  return collectionDateData.facets.geo.buckets.map((bucket, index) => {
    const lat = bucket.ltAvg;
    const long = bucket.lnAvg;
    let labels = [];
    let values = [];
    let colors: string[] = [];
    let noDataValue:number = 0;
    bucket.term.buckets.forEach((bucket, index) => {
      const start = bucket.val.substring(0,4);
      labels.push(start);
      values.push(bucket.count);
      colors.push(all_colors_hex[index]);     //DKDK set color palette
    });

    //DKDK calculate the number of no data and make 6th bar
    noDataValue = bucket.count - bucket.term.before.count - bucket.term.after.count - bucket.term.between.count
    labels.push("noData");
    values.push(noDataValue);
    colors.push("silver");     //DKDK fill the last color

    //DKDK check isAtomic
    let atomicValue = (bucket.atomicCount && bucket.atomicCount === 1) ? true : false

  return (
    <SVGDonutMarker
      key={bucket.val}
      //DKDK change position format
      position={[lat, long]}
      labels={labels}
      values={values}
      //DKDK colors is set to be optional props, if null (e.g., comment out) then bars will have skyblue-like defaultColor
      colors={colors}
      isAtomic={atomicValue}
      onClick={handleClick}
      onMouseOut={handleMouseOut}
      onMouseOver={handleMouseOver}
    />
    )
  });
}

export const CollectionDate = () => {
  //DKDK set global or local
  // const yAxisRange: Array<number> | null = [0, 1104]
  // const yAxisRange: Array<number> | null = []
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getCollectionDateMarkerElements());
  }, [setMarkerElements])

  return (
    <MapVEuMap
    viewport={{center: [ 13.449566, -2.304301 ], zoom: 7}}
    height="100vh" width="100vw"
    onViewportChanged={handleViewportChanged}
    markers={markerElements}
    />
  );
}

export const CollectionDateNudged = () => {
  //DKDK set global or local
  // const yAxisRange: Array<number> | null = [0, 1104]
  // const yAxisRange: Array<number> | null = []
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getCollectionDateMarkerElements());
  }, [setMarkerElements])

  return (
    <MapVEuMap
    viewport={{center: [ 13.449566, -2.304301 ], zoom: 7}}
    height="100vh" width="100vw"
    onViewportChanged={handleViewportChanged}
    markers={markerElements}
    nudge="geohash"
    />
  );
}


const getIRDataMarkerElements = () => {
  return irData.facets.geo.buckets.map((bucket, index) => {
    const lat = bucket.ltAvg;
    const long = bucket.lnAvg;
    let labels = [];
    let values = [];
    let colors: string[] = [];
    let noDataValue:number = 0;
    bucket.term.buckets.forEach((bucket, index) => {
      const start = bucket.val;
      labels.push(start+"-"+(start+0.2));
      values.push(bucket.count);
      colors.push(all_colors_hex[index]);     //DKDK set color palette
    });

    //DKDK calculate the number of no data and make 6th bar
    noDataValue = bucket.count - bucket.term.before.count - bucket.term.after.count - bucket.term.between.count
    labels.push("noData");
    values.push(noDataValue);
    colors.push("white");     //DKDK fill the last color

    //DKDK check isAtomic
    let atomicValue = (bucket.atomicCount && bucket.atomicCount === 1) ? true : false

    return (
      <SVGDonutMarker
        key={bucket.val}
        //DKDK change position format
        position={[lat, long]}
        labels={labels}
        values={values}
        //DKDK colors is set to be optional props, if null (e.g., comment out) then bars will have skyblue-like defaultColor
        colors={colors}
        isAtomic={atomicValue}
        onClick={handleClick}
        onMouseOut={handleMouseOut}
        onMouseOver={handleMouseOver}
      />
      )
  });
}

export const IRData = () => {
  //DKDK set global or local
  // const yAxisRange: Array<number> | null = [0, 1104]
  // const yAxisRange: Array<number> | null = []
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getIRDataMarkerElements());
  }, [setMarkerElements])

  return (
    <MapVEuMap
    viewport={{center: [ 13.449566, -2.304301 ], zoom: 7}}
    height="100vh" width="100vw"
    onViewportChanged={handleViewportChanged}
    markers={markerElements}
    />
  );
}

export const IRDataNudged = () => {
  //DKDK set global or local
  // const yAxisRange: Array<number> | null = [0, 1104]
  // const yAxisRange: Array<number> | null = []
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getIRDataMarkerElements());
  }, [setMarkerElements])

  return (
    <MapVEuMap
    viewport={{center: [ 13.449566, -2.304301 ], zoom: 7}}
    height="100vh" width="100vw"
    onViewportChanged={handleViewportChanged}
    markers={markerElements}
    nudge="geohash"
    />
  );
}
