import React, { ReactElement, useState, useCallback } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
// import { action } from '@storybook/addon-actions';
import { BoundsViewport, Bounds } from '../map/Types';
import { BoundsDriftMarkerProps } from "../map/BoundsDriftMarker";
import { zoomLevelToGeohashLevel, defaultAnimationDuration } from '../map/config/map.json';
import { getSpeciesDonuts, getSpeciesBasicMarkers } from "./api/getMarkersFromFixtureData";

import speciesData from './fixture-data/geoclust-species-testing-all-levels.json';

// below was an attempt to lazy load...
// it seemed to cause a 'black screen' error in Storybook if you refreshed the page in your browser
//
// let speciesData : any = undefined;
// import('./test-data/geoclust-species-testing-all-levels.json').then((json) => speciesData = json);

import { LeafletMouseEvent } from "leaflet";
import DonutMarker, { DonutMarkerProps } from '../map/DonutMarker';

//DKDK sidebar & legend
import MapVEuMap, { MapVEuMapProps } from '../map/MapVEuMap';
import MapVEuMapSidebar from '../map/MapVEuMapSidebar';
//DKDK import legend
import MapVEuLegendSampleList, { LegendProps } from '../map/MapVEuLegendSampleList'

//DKDK anim
// import Geohash from 'latlon-geohash';
// import {DriftMarker} from "leaflet-drift-marker";
import geohashAnimation from "../map/animation_functions/geohash";
import md5 from 'md5';

export default {
  title: 'Map/Donut Markers',
  component: MapVEuMapSidebar,
} as Meta;

const legendType = 'categorical'
const dropdownTitle: string = 'Species'
const dropdownHref: string[] = ['#/link-1','#/link-2','#/link-3','#/link-4','#/link-5','#/link-6','#/link-7']
const dropdownItemText: string[] =['Locus', 'Allele', 'Species', 'Sample type', 'Collection Protocol', 'Project', 'Protocol']
const legendInfoNumberText: string = 'Species'


//DKDK a generic function to remove a class: here it is used for removing highlight-marker
function removeClassName(targetClass: string) {
  //DKDK much convenient to use jquery here but try not to use it
  let targetElement = document.getElementsByClassName(targetClass)[0]
  if(targetElement !== undefined) {
      targetElement.classList.remove(targetClass)
  }
}

//DKDK this onClick event may need to be changed in the future like onMouseOver event
const handleMarkerClick = (e: LeafletMouseEvent) => {
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
  //console.log("I've been clicked")
}


export const AllInOneRequest: Story<MapVEuMapProps> = ( args ) => {

  const [ markerElements, setMarkerElements ] = useState<ReactElement<BoundsDriftMarkerProps>[]>([]);
  const [ legendData, setLegendData ] = useState<LegendProps["data"]>([])

  const handleViewportChanged = useCallback(async (bvp : BoundsViewport) => {
    const markers = await getSpeciesDonuts(bvp, defaultAnimationDuration, setLegendData, handleMarkerClick);
    setMarkerElements(markers);
  }, [setMarkerElements])

  return (
    <>
      <MapVEuMap
        {...args}
        viewport={{center: [ 13, 16 ], zoom: 4}}
        onViewportChanged={handleViewportChanged}
        markers={markerElements}
        animation={{
          method: "geohash",
          animationFunction: geohashAnimation,
          duration: defaultAnimationDuration
        }}
      />
      <MapVEuLegendSampleList
        legendType={legendType}
        data={legendData}
        dropdownTitle={dropdownTitle}
        dropdownHref={dropdownHref}
        dropdownItemText={dropdownItemText}
        legendInfoNumberText={legendInfoNumberText}
      />
    </>)
};

AllInOneRequest.args = {
  height: "100vh",
  width: "100vw",
  showGrid: true,
  showMouseToolbar: true,
};



export const FirstRequest: Story<MapVEuMapProps> = ( args ) => {

  const [ markerElements, setMarkerElements ] = useState<ReactElement<BoundsDriftMarkerProps>[]>([]);
  const [ legendData ] = useState<LegendProps["data"]>([])

  const handleViewportChanged = useCallback(async (bvp : BoundsViewport) => {
    const markers = await getSpeciesBasicMarkers(bvp, defaultAnimationDuration, handleMarkerClick);
    setMarkerElements(markers);
  }, [setMarkerElements])

  return (
    <>
      <MapVEuMap
        {...args}
        viewport={{center: [ 13, 16 ], zoom: 4}}
        onViewportChanged={handleViewportChanged}
        markers={markerElements}
        animation={{
          method: "geohash",
          animationFunction: geohashAnimation,
          duration: defaultAnimationDuration
        }}
      />
      <MapVEuLegendSampleList
        legendType={legendType}
        data={legendData}
        dropdownTitle={dropdownTitle}
        dropdownHref={dropdownHref}
        dropdownItemText={dropdownItemText}
        legendInfoNumberText={legendInfoNumberText}
      />
    </>)
};

FirstRequest.args = {
  height: "100vh",
  width: "100vw",
  showGrid: true,
  showMouseToolbar: true,
};



export const TwoRequests: Story<MapVEuMapProps> = ( args ) => {

  const [ markerElements, setMarkerElements ] = useState<ReactElement<BoundsDriftMarkerProps>[]>([]);
  const [ legendData, setLegendData ] = useState<LegendProps["data"]>([])

  const handleViewportChanged = useCallback(async (bvp : BoundsViewport) => {
    const markers = await getSpeciesBasicMarkers(bvp, defaultAnimationDuration, handleMarkerClick);
    setMarkerElements(markers);
    const fullMarkers = await getSpeciesDonuts(bvp, defaultAnimationDuration, setLegendData, handleMarkerClick, 2000);
    setMarkerElements(fullMarkers);
  }, [setMarkerElements])

  return (
    <>
      <MapVEuMap
        {...args}
        viewport={{center: [ 13, 16 ], zoom: 4}}
        onViewportChanged={handleViewportChanged}
        markers={markerElements}
        animation={{
          method: "geohash",
          animationFunction: geohashAnimation,
          duration: defaultAnimationDuration
        }}
      />
      <MapVEuLegendSampleList
        legendType={legendType}
        data={legendData}
        dropdownTitle={dropdownTitle}
        dropdownHref={dropdownHref}
        dropdownItemText={dropdownItemText}
        legendInfoNumberText={legendInfoNumberText}
      />
    </>)
};

TwoRequests.args = {
  height: "100vh",
  width: "100vw",
  showGrid: true,
  showMouseToolbar: true,
};


