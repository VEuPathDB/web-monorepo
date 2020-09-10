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
import RealHistogramMarkerSVG from './RealHistogramMarkerSVG'; // TO BE CREATED

export default {
  title: 'Numeric and Date SVG',
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
const getSampleSizeMarkerElements = (yAxisRange: Array<number> | null) => {
  let iii=1   //DKDK
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
    colors.push(all_colors_hex[labels.length-1]);     //DKDK fill the last color

    //DKDK calculate the number of no data and make 6th bar
    noDataValue = bucket.count - bucket.term.before.count - bucket.term.after.count - bucket.term.between.count
    labels.push("noData");
    values.push(noDataValue);
    colors.push("white");     //DKDK fill the last color

    // console.log('noDataValue', noDataValue)
    // //DKDK temp
    // if (iii == 1) {
    //   console.log('labels', labels)
    //   console.log('values', values)
    //   console.log('colors', colors)
    // }
    iii +=1

    return (
      <RealHistogramMarkerSVG
        key={bucket.val}
        //DKDK change position format
        position={[lat, long]}
        labels={labels}
        values={values}
        //DKDK colors is set to be optional props, if null (e.g., comment out) then bars will have skyblue-like defaultColor
        colors={colors}
        //DKDK disable isAtomic for histogram
        // isAtomic={atomicValue}
        //DKDK yAxisRange can be commented out - defined as optional at HistogramMarkerSVG.tsx (HistogramMarkerSVGProps)
        yAxisRange ={yAxisRange}
        // onClick={handleClick}
        onMouseOut={handleMouseOut}
        onMouseOver={handleMouseOver}
      />
      )
  });
}


export const SampleSizeLocal = () => {
  //DKDK set global or local
  // const yAxisRange: Array<number> | null = [0, 1104]
  const yAxisRange: Array<number> | null = []
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getSampleSizeMarkerElements(yAxisRange));
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

export const SampleSizeGlobal = () => {
  //DKDK set global or local
  const yAxisRange: Array<number> | null = [0, 1104]
  // const yAxisRange = null
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getSampleSizeMarkerElements(yAxisRange));
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


const getCollectionDateMarkerElements = (yAxisRange: Array<number> | null) => {
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
    colors.push("grey");     //DKDK fill the last color

  return (
    <RealHistogramMarkerSVG
      key={bucket.val}
      //DKDK change position format
      position={[lat, long]}
      labels={labels}
      values={values}
      //DKDK colors is set to be optional props, if null (e.g., comment out) then bars will have skyblue-like defaultColor
      colors={colors}
      //DKDK disable isAtomic for histogram
      // isAtomic={atomicValue}
      //DKDK yAxisRange can be commented out - defined as optional at HistogramMarkerSVG.tsx (HistogramMarkerSVGProps)
      yAxisRange ={yAxisRange}
      // onClick={handleClick}
      onMouseOut={handleMouseOut}
      onMouseOver={handleMouseOver}
    />
    )
  });
}


export const CollectionDateLocal = () => {
  //DKDK set global or local
  // const yAxisRange: Array<number> | null = [0, 1104]
  const yAxisRange: Array<number> | null = []
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getCollectionDateMarkerElements(yAxisRange));
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

export const CollectionDateLocalNudged = () => {
  //DKDK set global or local
  // const yAxisRange: Array<number> | null = [0, 1104]
  const yAxisRange: Array<number> | null = []
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getCollectionDateMarkerElements(yAxisRange));
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


export const CollectionDateGlobal = () => {
  //DKDK set global or local
  const yAxisRange: Array<number> | null = [0, 5972]
  // const yAxisRange = null
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getCollectionDateMarkerElements(yAxisRange));
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

const getIRDataMarkerElements = (yAxisRange: Array<number> | null) => {
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

    return (
      <RealHistogramMarkerSVG
        key={bucket.val}
        //DKDK change position format
        position={[lat, long]}
        labels={labels}
        values={values}
        //DKDK colors is set to be optional props, if null (e.g., comment out) then bars will have skyblue-like defaultColor
        colors={colors}
        //DKDK disable isAtomic for histogram
        // isAtomic={atomicValue}
        //DKDK yAxisRange can be commented out - defined as optional at HistogramMarkerSVG.tsx (HistogramMarkerSVGProps)
        yAxisRange ={yAxisRange}
        // onClick={handleClick}
        onMouseOut={handleMouseOut}
        onMouseOver={handleMouseOver}
      />
      )
  });
}


export const IRDataLocal = () => {
  //DKDK set global or local
  // const yAxisRange: Array<number> | null = [0, 1104]
  const yAxisRange: Array<number> | null = []
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getIRDataMarkerElements(yAxisRange));
  }, [setMarkerElements])

  return (
    <MapVEuMap
    viewport={{center: [ 13.449566, -9.304301 ], zoom: 6}}
    height="100vh" width="100vw"
    onViewportChanged={handleViewportChanged}
    markers={markerElements}
    />
  );
}

export const IRDataGlobal = () => {
  //DKDK set global or local
  const yAxisRange: Array<number> | null = [0, 1749]
  // const yAxisRange = null
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getIRDataMarkerElements(yAxisRange));
  }, [setMarkerElements])

  return (
    <MapVEuMap
    viewport={{center: [ 13.449566, -9.304301 ], zoom: 6}}
    height="100vh" width="100vw"
    onViewportChanged={handleViewportChanged}
    markers={markerElements}
    />
  );
}


