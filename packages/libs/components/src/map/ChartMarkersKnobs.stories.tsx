import React, { ReactElement, useState, useCallback } from 'react';
import { withKnobs, radios , boolean, number, color } from '@storybook/addon-knobs';
// import { action } from '@storybook/addon-actions';
import MapVEuMap from './MapVEuMap';
import { BoundsViewport, MarkerProps } from './Types';
import { Marker, Tooltip } from 'react-leaflet';
import './TempIconHack';

import sampleSizeData from './test-data/geoclust-numeric-binning-testing.json';
import collectionDateData from './test-data/geoclust-date-binning-testing.json';
import irData from './test-data/geoclust-irrescaled-binning-testing.json';

import { latLng, LeafletMouseEvent } from "leaflet";
import RealHistogramMarkerSVGnoShadow from './RealHistogramMarkerSVGnoShadow'; // TO BE CREATED

import MapVeuLegendSample, { LegendProps } from './MapVeuLegendSample'

export default {
  title: 'Chart Markers with Knobs',
  component: MapVEuMap,
  decorators: [withKnobs],
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

//DKDK send x-/y-axes labels for Legend bar chart
const variableLabel: string = '<b>Collection date</b>'  //DKDK: x-axis label
const quantityLabel: string = '<b>Record count</b>'     //DKDK: y-axis label

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

const getCollectionDateMarkerElements = ({ bounds }: BoundsViewport, setLegendData, yAxisRange: Array<number> | null, knob_method, knob_dividerVisible, knob_type, knob_fillArea, knob_spline, knob_lineVisible, knob_colorMethod, knob_borderColor, knob_borderWidth) => {

  let legendSums : number[] = [];
  let legendLabels : string[] = [];
  let legendColors : string[] = [];

  const markers = collectionDateData.facets.geo.buckets.filter(({ltAvg, lnAvg}) => {
    return ltAvg > bounds.southWest[0] &&
	   ltAvg < bounds.northEast[0] &&
	   lnAvg > bounds.southWest[1] &&
	   lnAvg < bounds.northEast[1]
  }).map((bucket) => {
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
        // my_knob={boolean('My Knob', false)} // Doesn't work
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
  const yAxisRange: Array<number> | null = []
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);

  // Knobs
  const knob_method = radios('Method', {SVG: 'svg', Library: 'lib'}, 'svg');
  const knob_borderWidth = number('Border width', 3.5, {range: true, min: 0, max: 5, step: 0.5});
  //const knob_borderColor = color('Border color', '#00000088');  // Isn't working
  const knob_borderColor = radios('Border color', {DarkGrey: '#00000099', LightGrey: '#00000055', Blue: '#7cb5ec'}, '#00000099');
  const knob_dividerVisible = boolean('Divider visible', false);
  const knob_type = knob_method === 'lib' ? radios('Type', {Bar: 'bar', Line: 'line'}, 'bar') : undefined;
  const knob_fillArea = knob_type === 'line' ? boolean('Fill area', true) : undefined;
  const knob_spline = knob_type === 'line' ? boolean('Spline', false) : undefined;
  const knob_lineVisible = knob_fillArea ? boolean('Show line', false) : undefined;
  const knob_colorMethod = knob_type === 'line' ?
    radios('Color method', {Bins: 'discrete', Solid: 'solid', Gradient: 'gradient'}, 'discrete') :
    radios('Color method', {Bins: 'discrete', Solid: 'solid'}, 'discrete');
  const knob_legendTickLabelsVisible = boolean('Show legend tick labels', true);

  const [ legendData, setLegendData ] = useState<LegendProps["data"]>([])


  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getCollectionDateMarkerElements(bvp, setLegendData, yAxisRange, knob_method, knob_dividerVisible, knob_type, knob_fillArea, knob_spline, knob_lineVisible, knob_colorMethod, knob_borderColor, knob_borderWidth));
  }, [setMarkerElements, knob_method, knob_dividerVisible, knob_type, knob_fillArea, knob_spline, knob_lineVisible, knob_colorMethod, knob_borderColor, knob_borderWidth])

  return (
    <>
      <MapVEuMap
	viewport={{center: [ 13.449566, -2.304301 ], zoom: 7}}
	height="100vh" width="100vw"
	onViewportChanged={handleViewportChanged}
	markers={markerElements}
      />
      <MapVeuLegendSample
        legendType="numeric"
        data={legendData}
        //DKDK send x-/y-axes lables here
        variableLabel={variableLabel}    //DKDK: x-axis label
        quantityLabel={quantityLabel}    //DKDK: y-axis label
        tickLabelsVisible={knob_legendTickLabelsVisible}
      />
    </>
  );
}
