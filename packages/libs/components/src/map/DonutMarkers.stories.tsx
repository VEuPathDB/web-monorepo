import React, { ReactElement, useState, useCallback } from 'react';
// import { action } from '@storybook/addon-actions';
// import MapVEuMap from './MapVEuMap';
import { BoundsViewport, MarkerProps } from './Types';
import './TempIconHack';

let speciesData : any = undefined;
import('./test-data/geoclust-species-testing-all-levels.json').then((json) => speciesData = json);

import { LeafletMouseEvent } from "leaflet";
import SVGDonutMarker from './SVGDonutMarker'; // TO BE CREATED

//DKDK sidebar & legend
import MapVEuMap from './MapVEuMap';
import MapVEuMapSidebar from './MapVEuMapSidebar';
//DKDK import a sidebar component
import SidebarExample from './SidebarExample'
// import { LeafletMouseEvent } from "leaflet";
//DKDK import legend
import MapVeuLegendSampleList, { LegendProps } from './MapVeuLegendSampleList'

//DKDK anim
// import Geohash from 'latlon-geohash';
// import {DriftMarker} from "leaflet-drift-marker";
import geohashAnimation from "./animation_functions/geohash";
import md5 from 'md5';

export default {
  title: 'Donut Markers for categorical',
  component: MapVEuMapSidebar,
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

const getSpeciesMarkerElements = ({bounds, zoomLevel} : BoundsViewport, duration : number, scrambleKeys: boolean = false, setLegendData: (legendData: Array<{label: string, value: number, color: string}>) => void) => {
  const geohash_level = zoomLevelToGeohashLevel[zoomLevel];

  const buckets = speciesData[geohash_level].facets.geo.buckets.filter((bucket : any) => {
    const ltAvg : number = bucket.ltAvg;
    const lnAvg : number = bucket.lnAvg;
    return ltAvg > bounds.southWest[0] &&
	   ltAvg < bounds.northEast[0] &&
	   lnAvg > bounds.southWest[1] &&
	   lnAvg < bounds.northEast[1]
  });

  // make a first pass and calculate the legend totals
  // and rank the species for color assignment
  let speciesToCount = new Map();
  buckets.forEach((bucket : any) => {
    bucket.term.buckets.forEach((bucket : any) => {
      const species = bucket.val;
      let prevCount = speciesToCount.get(species);
      if (prevCount === undefined) prevCount = 0;
      speciesToCount.set(species, prevCount + bucket.count);
    });
  });

  // sort by the count (Map returns keys in insertion order)
  speciesToCount = new Map(
    Array.from(speciesToCount).sort( ([_1,v1], [_2,v2]) => v1 > v2 ? -1 : v2 > v1 ? 1 : 0 )
  );

  // make the species to color lookup
  const speciesToColor = new Map(
    Array.from(speciesToCount).map( ([k, _], index) => {
      if (index<10) {
	return [k, all_colors_hex[index]];
      } else {
	return [k, 'silver']
      }
    })
  );

  // reformat as legendData
  const legendData = Array.from(speciesToCount.keys()).map((key) => (
    {
      label: key,
      value: speciesToCount.get(key) || -1,
      color: speciesToColor.get(key) || 'silver'
    }
  ));
  setLegendData(legendData);

  return buckets.map((bucket : any) => {
    const lat : number = bucket.ltAvg;
    const long : number = bucket.lnAvg;
    let labels: string[] = [];
    let values: number[] = [];
    let colors: string[] = [];
    bucket.term.buckets.forEach((bucket : any) => {
      const species = bucket.val;
      labels.push(species);
      values.push(bucket.count);
      colors.push(speciesToColor.get(species) || 'silver');
    });

    //DKDK check isAtomic
    let atomicValue = (bucket.atomicCount && bucket.atomicCount === 1) ? true : false

    //DKDK anim key
    const key = scrambleKeys ? md5(bucket.val).substring(0, zoomLevel) : bucket.val;

    return (
      <SVGDonutMarker
        key={key}   //DKDK anim
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
        //DKDK anim
        duration={duration}
      />
      )
  });
}

export const Species = () => {

  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const [ legendData, setLegendData ] = useState<LegendProps["data"]>([])

  //DKDK anim
  const duration = 500
  const scrambleKeys = false

  const handleViewportChanged = useCallback((bvp : BoundsViewport) => {
    //DKDK anim add duration & scrambleKeys
    setMarkerElements(getSpeciesMarkerElements(bvp, duration, scrambleKeys, setLegendData));
  }, [setMarkerElements])

  //DKDK define legendType
  const legendType = 'categorical'

  //DKDK  props for dropdown toggle text, dropdown item's href, and its text (Categorical)
  const dropdownTitle: string = 'Species'
  const dropdownHref: string[] = ['#/link-1','#/link-2','#/link-3','#/link-4','#/link-5','#/link-6','#/link-7']
  const dropdownItemText: string[] =['Locus', 'Allele', 'Species', 'Sample type', 'Collection Protocol', 'Project', 'Protocol']

  //DKDK send legend number text on top of legend list
  const legendInfoNumberText: string = 'Species'

  return (
    <>
      <MapVEuMap
        viewport={{center: [ 13, 16 ], zoom: 4}}
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
        // //DKDK send x-/y-axes lables here
        // variableLabel={variableLabel}    //DKDK: x-axis label
        // quantityLabel={quantityLabel}    //DKDK: y-axis label
        // tickLabelsVisible={knob_legendTickLabelsVisible}
        // //DKDK legend radio button props
        // onChange={legendRadioChange}
        // selectedOption={legendRadioValue}
        //DKDK add dropdown props for Legend
        dropdownTitle={dropdownTitle}
        dropdownHref={dropdownHref}
        dropdownItemText={dropdownItemText}
        // //DKDK send yAxisRange[1]
        // yAxisRangeValue={yAxisRangeValue}
        // //DKDK send legend number text
        legendInfoNumberText={legendInfoNumberText}
      />
    </>)
}


// export // disabled for now
const SpeciesSidebar = () => {
  //DKDK set global or local
  // const yAxisRange: Array<number> | null = [0, 1104]
  // const yAxisRange: Array<number> | null = []

  //DKDK define legendType
  const legendType = 'categorical'

  //DKDK  props for dropdown toggle text, dropdown item's href, and its text (Categorical)
  const dropdownTitle: string = 'Species'
  const dropdownHref: string[] = ['#/link-1','#/link-2','#/link-3','#/link-4','#/link-5','#/link-6','#/link-7']
  const dropdownItemText: string[] =['Locus', 'Allele', 'Species', 'Sample type', 'Collection Protocol', 'Project', 'Protocol']

  //DKDK send legend number text on top of legend list
  const legendInfoNumberText: string = 'Species'

  //DKDK send legendData
  const [ legendData, setLegendData ] = useState<LegendProps["data"]>([])

  //DKDK anim
  const duration = 1000
  const scrambleKeys = false

  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    //DKDK anim add duration & scrambleKeys
    setMarkerElements(getSpeciesMarkerElements(bvp, duration, scrambleKeys, setLegendData));
  }, [setMarkerElements])

  //DKDK Sidebar state managements (for categorical)
  const [ sidebarCollapsed, setSidebarCollapsed ] = useState(true);
  const [ tabSelected, setTabSelected ] = useState('');   //DKDK could be used to set default active tab, e.g., 'Home', but leave blank
  const sidebarOnClose = () => {
    setSidebarCollapsed(true)
  }
  const sidebarOnOpen = (id: string) => {
    setSidebarCollapsed(false)
    setTabSelected(id)
  }

  return (
    //DKDK add fragment
    <>
      <SidebarExample
        id="leaflet-sidebar"
        collapsed={sidebarCollapsed}
        position='left'
        selected={tabSelected}
        closeIcon='fas fa-times'
        onOpen={sidebarOnOpen}
        onClose={sidebarOnClose}
      />

      <MapVeuLegendSampleList
        legendType={legendType}
        data={legendData}
        // //DKDK send x-/y-axes lables here
        // variableLabel={variableLabel}    //DKDK: x-axis label
        // quantityLabel={quantityLabel}    //DKDK: y-axis label
        // tickLabelsVisible={knob_legendTickLabelsVisible}
        // //DKDK legend radio button props
        // onChange={legendRadioChange}
        // selectedOption={legendRadioValue}
        //DKDK add dropdown props for Legend
        dropdownTitle={dropdownTitle}
        dropdownHref={dropdownHref}
        dropdownItemText={dropdownItemText}
        // //DKDK send yAxisRange[1]
        // yAxisRangeValue={yAxisRangeValue}
        // //DKDK send legend number text
        legendInfoNumberText={legendInfoNumberText}
      />

      <MapVEuMapSidebar
        viewport={{center: [ 13.449566, -2.304301 ], zoom: 7}}
        height="100vh" width="100vw"
        onViewportChanged={handleViewportChanged}
        markers={markerElements}
        //DKDK add this for closing sidebar at MapVEuMap(Sidebar): passing setSidebarCollapsed()
        sidebarOnClose={setSidebarCollapsed}
      />
    </>
  );
}

// export
const SpeciesNudgedChart = () => {
  //DKDK set global or local
  // const yAxisRange: Array<number> | null = [0, 1104]
  // const yAxisRange: Array<number> | null = []

  //DKDK define legendType
  const legendType = 'categorical'

  //DKDK  props for dropdown toggle text, dropdown item's href, and its text (Categorical)
  const dropdownTitle: string = 'Species'
  const dropdownHref: string[] = ['#/link-1','#/link-2','#/link-3','#/link-4','#/link-5','#/link-6','#/link-7']
  const dropdownItemText: string[] =['Locus', 'Allele', 'Species', 'Sample type', 'Collection Protocol', 'Project', 'Protocol']

  //DKDK send legend number text on top of legend list
  const legendInfoNumberText: string = 'Species'

  //DKDK send legendData
  const [ legendData, setLegendData ] = useState<LegendProps["data"]>([])

  //DKDK anim
  const duration = 1000
  const scrambleKeys = false

  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    //DKDK anim add duration & scrambleKeys
    setMarkerElements(getSpeciesMarkerElements(bvp, duration, scrambleKeys, setLegendData));
  }, [setMarkerElements])

  //DKDK Sidebar state managements (other than categorical - test purpose)
  const [ sidebarCollapsed, setSidebarCollapsed ] = useState(true);
  const [ tabSelected, setTabSelected ] = useState('');   //DKDK could be used to set default active tab, e.g., 'Home', but leave blank
  const sidebarOnClose = () => {
    setSidebarCollapsed(true)
  }
  const sidebarOnOpen = (id: string) => {
    setSidebarCollapsed(false)
    setTabSelected(id)
  }

  return (
    //DKDK add fragment
    <>
      <SidebarExample
        id="leaflet-sidebar"
        collapsed={sidebarCollapsed}
        position='left'
        selected={tabSelected}
        closeIcon='fas fa-times'
        onOpen={sidebarOnOpen}
        onClose={sidebarOnClose}
      />

      <MapVeuLegendSampleList
        legendType={legendType}
        data={legendData}
        // //DKDK send x-/y-axes lables here
        // variableLabel={variableLabel}    //DKDK: x-axis label
        // quantityLabel={quantityLabel}    //DKDK: y-axis label
        // tickLabelsVisible={knob_legendTickLabelsVisible}
        // //DKDK legend radio button props
        // onChange={legendRadioChange}
        // selectedOption={legendRadioValue}
        //DKDK add dropdown props for Legend
        dropdownTitle={dropdownTitle}
        dropdownHref={dropdownHref}
        dropdownItemText={dropdownItemText}
        // //DKDK send yAxisRange[1]
        // yAxisRangeValue={yAxisRangeValue}
        // //DKDK send legend number text
        legendInfoNumberText={legendInfoNumberText}
      />

      <MapVEuMapSidebar
        viewport={{center: [ 13.449566, -2.304301 ], zoom: 7}}
        height="100vh" width="100vw"
        onViewportChanged={handleViewportChanged}
        markers={markerElements}
        nudge="geohash"
        //DKDK add this for closing sidebar at MapVEuMap(Sidebar): passing setSidebarCollapsed()
        sidebarOnClose={setSidebarCollapsed}
      />
    </>
  );
}

