import React, { ReactElement, useState, useCallback } from 'react';
import { withKnobs, radios , boolean, number } from '@storybook/addon-knobs';
// import { action } from '@storybook/addon-actions';
import MapVEuMap from './MapVEuMap';
import { BoundsViewport, MarkerProps } from './Types';
import './TempIconHack';

// import collectionDateData from './test-data/geoclust-date-binning-testing-all-levels.json';
let collectionDateData : any = undefined;
import('./test-data/geoclust-date-binning-testing-all-levels.json').then((json) => collectionDateData = json);


import { LeafletMouseEvent } from "leaflet";
import RealHistogramMarkerSVGnoShadow from './RealHistogramMarkerSVGnoShadow'; // TO BE CREATED

//DKDK change target component
import MapVeuLegendSampleList, { LegendProps } from './MapVeuLegendSampleList'

//DKDK anim
// import Geohash from 'latlon-geohash';
// import {DriftMarker} from "leaflet-drift-marker";
import geohashAnimation from "./animation_functions/geohash";
import md5 from 'md5';

export default {
  title: 'Chart Markers for continuous',
  component: MapVEuMap,
  decorators: [withKnobs],
};

// some colors randomly pasted from the old mapveu code
// these are NOT the final decided colors for MapVEu 2.0
const all_colors_hex = [
  //DKDK Bob's one from https://www.schemecolor.com/red-blue-gradient.php
  "#0018A9", // Bob1
  "#3B1988", // Bob2
  "#771A66", // Bob3
  "#B21B45", // Bob4
  "#ED1C23", // Bob5
  "#CEA262", // Grayish Yellow
  // "#817066", // Medium Gray

  // //DKDK Steve's one
  // "#0000FF",
  // "#9900FF",
  // "#FF00FF",
  // "#980000",
  // "#FF0000",

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

const zoomLevelToGeohashLevel = [
  'geohash_1', // 0
  'geohash_1', // 1
  'geohash_1', // 2
  'geohash_2', // 3
  'geohash_2', // 4
  'geohash_2', // 5
  'geohash_3', // 6
  'geohash_3', // 7
  'geohash_3', // 8
  'geohash_4', // 9
  'geohash_4', // 10
  'geohash_4', // 11
  'geohash_5', // 12
  'geohash_5', // 13
  'geohash_5', // 14
  'geohash_6', // 15
  'geohash_6', // 16
  'geohash_6', // 17
  'geohash_7'  // 18
];

/**
 * DKDK gathering functions here temporarily
 * Need to add export to be used in the other component
 */
//DKDK top-marker test: mouseOver and mouseOut
const handleMouseOver = (e: LeafletMouseEvent) => {
  e.target._icon.classList.add('top-marker')
}

const handleMouseOut = (e: LeafletMouseEvent) => {
  e.target._icon.classList.remove('top-marker')
}

//DKDK use legendRadioValue instead of knob_YAxisRangeMethod
// const getCollectionDateMarkerElements = ({ bounds }: BoundsViewport, setLegendData, knob_method, knob_dividerVisible, knob_type, knob_fillArea, knob_spline, knob_lineVisible, knob_colorMethod, knob_borderColor, knob_borderWidth, knob_YAxisRangeMethod) => {

const getCollectionDateMarkerElements = ({ bounds, zoomLevel }: BoundsViewport, duration : number, scrambleKeys: boolean = false, setLegendData: (legendData: Array<{label: string, value: number, color: string}>) => void, knob_method, knob_dividerVisible, knob_type, knob_fillArea, knob_spline, knob_lineVisible, knob_colorMethod, knob_borderColor, knob_borderWidth, legendRadioValue: string, setYAxisRangeValue: (yAxisRangeValue: number) => void) => {

  let legendSums : number[] = [];
  let legendLabels : string[] = [];
  let legendColors : string[] = [];
  let yAxisRange : number[] = [];  // This sets range to 'local' mode
  //DKDK make a new variable to always calculate yAxisRange (to always show Reginal scale value)
  let yAxisRangeAll : number[] = []

  const geohash_level = zoomLevelToGeohashLevel[zoomLevel];

  const buckets = collectionDateData[geohash_level].facets.geo.buckets.filter((bucket : any) => {
    const ltAvg : number = bucket.ltAvg;
    const lnAvg : number = bucket.lnAvg;
    return ltAvg > bounds.southWest[0] &&
	   ltAvg < bounds.northEast[0] &&
	   lnAvg > bounds.southWest[1] &&
	   lnAvg < bounds.northEast[1]
  });

  //DKDK change this to always show Reginal scale value
  // if (knob_YAxisRangeMethod === 'regional') {
  // if (legendRadioValue === 'Regional') {
  //   yAxisRange = [0, buckets.reduce(
  //     (currentMax, bucket) => {
  //       return Math.max(
  //         currentMax,
  //         bucket.count - bucket.term.before.count - bucket.term.after.count - bucket.term.between.count, // no data count
  //         bucket.term.buckets.reduce(
  //           (currentMax, bucket) => Math.max(currentMax, bucket.count),
  //           0
  //         )  // current bucket max value
  //       );
  //     },
  //     0
  //   )];
  // }
  yAxisRangeAll = [0, buckets.reduce(
    (currentMax, bucket) => {
      return Math.max(
        currentMax,
        bucket.count - bucket.term.before.count - bucket.term.after.count - bucket.term.between.count, // no data count
        bucket.term.buckets.reduce(
          (currentMax, bucket) => Math.max(currentMax, bucket.count),
          0
        )  // current bucket max value
      );
    },
    0
  )];
  //DKDK set yAxisRange only if Regional
  if (legendRadioValue === 'Regional') {
    yAxisRange = yAxisRangeAll
  }
  //DKDK add setyAxisRangeValue: be careful of type of setYAxisRangeValue
  setYAxisRangeValue(yAxisRangeAll[1])
  // console.log('yAxisRange = ', yAxisRange)

  const markers = buckets.map((bucket) => {
    const lat = bucket.ltAvg;
    const long = bucket.lnAvg;
    let labels = [];
    let values = [];
    let colors: string[] = [];
    let noDataValue:number = 0;
    bucket.term.buckets.forEach((bucket, index) => {
      const start = bucket.val.substring(0,4);
      const end = parseInt(start, 10)+3;
      const label = `${start}-${end}`;
      labels.push(label);
      values.push(bucket.count);
      colors.push(knob_colorMethod === 'solid' ? '#7cb5ec' : all_colors_hex[index]);

      // sum all counts for legend
      if (legendSums[index] === undefined) {
        legendSums[index] = 0;
        legendLabels[index] = label;
        legendColors[index] = knob_colorMethod === 'solid' ? '#7cb5ec' : all_colors_hex[index];
      }
      legendSums[index] += bucket.count;
    });

    //DKDK calculate the number of no data and make 6th bar
    noDataValue = bucket.count - bucket.term.before.count - bucket.term.after.count - bucket.term.between.count
    labels.push("noData");
    values.push(noDataValue);
    colors.push("silver");     //DKDK fill the last color

    legendLabels[5] = 'no data';
    if (legendSums[5] === undefined) legendSums[5] = 0;
    legendSums[5] += noDataValue;
    legendColors[5] = 'silver';

    const new_knob_colorMethod = knob_colorMethod === 'solid' ? 'bins' : knob_colorMethod;

    //DKDK check isAtomic for push pin for chart marker
    let atomicValue = (bucket.atomicCount && bucket.atomicCount === 1) ? true : false

    //DKDK anim key
    const key = scrambleKeys ? md5(bucket.val).substring(0, zoomLevel) : bucket.val;

    return (
      <RealHistogramMarkerSVGnoShadow
        method={knob_method}
        dividerVisible={knob_dividerVisible}
        type={knob_type}
        fillArea={knob_fillArea}
        spline={knob_spline}
        lineVisible={knob_lineVisible}
        colorMethod={new_knob_colorMethod}
        borderColor={knob_borderColor}
        borderWidth={knob_borderWidth}
        key={key}   //DKDK anim
        //DKDK change position format
        position={[lat, long]}
        labels={labels}
        values={values}
        //DKDK colors is set to be optional props, if null (e.g., comment out) then bars will have skyblue-like defaultColor
        colors={colors}
        //DKDK add isAtomic for chart marker
        isAtomic={atomicValue}
        //DKDK yAxisRange can be commented out - defined as optional at HistogramMarkerSVG.tsx (HistogramMarkerSVGProps)
        yAxisRange ={yAxisRange}
        // onClick={handleClick}
        onMouseOut={handleMouseOut}
        onMouseOver={handleMouseOver}
        // my_knob={boolean('My Knob', false)} // Doesn't work
        //DKDK anim
        duration={duration}
      />
    )
  });

  const legendData = legendSums.map((count, index) => {
    return {
      label: legendLabels[index],
      value: count,
      color: legendColors[index]
    }
  });
  setLegendData(legendData);

  return markers;
}


export const CollectionDate = () => {
  //DKDK set global or local
  // const yAxisRange: Array<number> | null = [0, 1104]
  // const yAxisRange: Array<number> | null = []
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);

  // Knobs
  const knob_method = radios('Method', {SVG: 'svg', Library: 'lib'}, 'svg');
  const knob_borderWidth = number('Border width', 3.5, {range: true, min: 0, max: 5, step: 0.5});
  //const knob_borderColor = color('Border color', '#00000088');  // Isn't working
  const knob_borderColor = radios('Border color', {DarkGrey: '#00000099', LightGrey: '#00000055', Blue: '#7cb5ec'}, '#00000055');
  const knob_dividerVisible = boolean('Divider visible', false);
  const knob_type = knob_method === 'lib' ? radios('Type', {Bar: 'bar', Line: 'line'}, 'bar') : undefined;
  const knob_fillArea = knob_type === 'line' ? boolean('Fill area', true) : undefined;
  const knob_spline = knob_type === 'line' ? boolean('Spline', false) : undefined;
  const knob_lineVisible = knob_fillArea ? boolean('Show line', false) : undefined;
  const knob_colorMethod = knob_type === 'line' ?
    radios('Color method', {Bins: 'discrete', Solid: 'solid', Gradient: 'gradient'}, 'discrete') :
    radios('Color method', {Bins: 'discrete', Solid: 'solid'}, 'discrete');

  //DKDK block this
  // const knob_YAxisRangeMethod = radios('Y-axis range', {Local: 'local', Regional: 'regional'}, 'local');

  const [ legendData, setLegendData ] = useState<LegendProps["data"]>([])

  //DKDK set legend radio button value
  const [legendRadioValue, setLegendRadioValue] = useState<string>('Regional')
  //DKDK Legend radio button
  const legendRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLegendRadioValue(e.target.value);
  };
  //DKDK add state for getting yAxisRange
  const [yAxisRangeValue, setYAxisRangeValue] = useState<number>(0)
  // console.log('yAxisRangeValue = ', yAxisRangeValue)

  //DKDK define legendType
  const legendType = 'numeric'

  //DKDK send x-/y-axes labels for Legend bar chart
  const variableLabel: string = '<b>Collection date</b>'  //DKDK: x-axis label
  const quantityLabel: string = '<b>Record count</b>'     //DKDK: y-axis label

  //DKDK for testing purpose, use other variable names for bar chart
  const dropdownTitleBar: string = 'Collection Date'
  const dropdownHrefBar: string[] = ['#/link-1','#/link-2','#/link-3','#/link-4','#/link-5']
  const dropdownItemTextBar: string[] =['Year', 'Month', 'Date', 'Hour', 'Minute']

  //DKDK send legend number text on top of legend list
  const legendInfoNumberText: string = 'Collections'

  //DKDK anim
  const duration = 500
  const scrambleKeys = false

  //DKDK send legendRadioValue instead of knob_YAxisRangeMethod: also send setYAxisRangeValue
  // const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
  //   setMarkerElements(getCollectionDateMarkerElements(bvp, setLegendData, knob_method, knob_dividerVisible, knob_type, knob_fillArea, knob_spline, knob_lineVisible, knob_colorMethod, knob_borderColor, knob_borderWidth, knob_YAxisRangeMethod));
  // }, [setMarkerElements, knob_method, knob_dividerVisible, knob_type, knob_fillArea, knob_spline, knob_lineVisible, knob_colorMethod, knob_borderColor, knob_borderWidth, knob_YAxisRangeMethod])
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    //DKDK anim add duration & scrambleKeys
    setMarkerElements(getCollectionDateMarkerElements(bvp, duration, scrambleKeys, setLegendData, knob_method, knob_dividerVisible, knob_type, knob_fillArea, knob_spline, knob_lineVisible, knob_colorMethod, knob_borderColor, knob_borderWidth, legendRadioValue, setYAxisRangeValue));
  }, [setMarkerElements, knob_method, knob_dividerVisible, knob_type, knob_fillArea, knob_spline, knob_lineVisible, knob_colorMethod, knob_borderColor, knob_borderWidth, legendRadioValue])


  return (
    <>
      <MapVEuMap
        viewport={{center: [ 13, 0 ], zoom: 6}}
        height="100vh" width="100vw"
        onViewportChanged={handleViewportChanged}
        markers={markerElements}
        //DKDK anim
        // animation={null}
        animation={{
          method: "geohash",
          animationFunction: geohashAnimation,
          duration
        }}
        showGrid={true}
      />
      <MapVeuLegendSampleList
        legendType={legendType}
        data={legendData}
        //DKDK send x-/y-axes lables here
        variableLabel={variableLabel}    //DKDK: x-axis label
        quantityLabel={quantityLabel}    //DKDK: y-axis label
        //DKDK legend radio button props
        onChange={legendRadioChange}
        selectedOption={legendRadioValue}
        //DKDK add dropdown props for Legend
        dropdownTitle={dropdownTitleBar}
        dropdownHref={dropdownHrefBar}
        dropdownItemText={dropdownItemTextBar}
        //DKDK send yAxisRange[1]
        yAxisRangeValue={yAxisRangeValue}
        //DKDK send legend number text
        legendInfoNumberText={legendInfoNumberText}
      />
    </>
  );
}

