import React, { ReactElement, useState, useCallback } from 'react';
// import { action } from '@storybook/addon-actions';
import MapVEuMap from './MapVEuMap';
import { BoundsViewport, MarkerProps } from './Types';
import { Marker, Tooltip } from 'react-leaflet';
import './TempIconHack';

import speciesData from './test-data/geoclust-species-testing.json';

import { latLng, LeafletMouseEvent } from "leaflet";
import SVGDonutMarker from './SVGDonutMarker'; // TO BE CREATED

export default {
  title: 'SVG Donut Marker',
  component: MapVEuMap,
};

// some colors randomly pasted from the old mapveu code
// these are NOT the final decided colors for MapVEu 2.0
const all_colors_hex = [
  "#FFB300", // Vivid Yellow
  "#803E75", // Strong Purple
  "#FF6800", // Vivid Orange
  "#A6BDD7", // Very Light Blue
  "#C10020", // Vivid Red
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
const getSpeciesMarkerElements = () => {
  return speciesData.facets.geo.buckets.map((bucket, index) => {
    const lat = bucket.ltAvg;
    const long = bucket.lnAvg;
    let labels = [];
    let values = [];
    let colors: string[] = [];
    let noDataValue:number = 0;
    bucket.term.buckets.forEach((bucket, index) => {
      labels.push(bucket.val);
      values.push(bucket.count);
      colors.push(all_colors_hex[index]);     //DKDK set color palette
    });

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


export const Species = () => {
  //DKDK set global or local
  // const yAxisRange: Array<number> | null = [0, 1104]
  // const yAxisRange: Array<number> | null = []
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getSpeciesMarkerElements());
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

export const SpeciesNudged = () => {
  //DKDK set global or local
  // const yAxisRange: Array<number> | null = [0, 1104]
  // const yAxisRange: Array<number> | null = []
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getSpeciesMarkerElements());
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

