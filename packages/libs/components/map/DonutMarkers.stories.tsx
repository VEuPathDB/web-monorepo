import React, { ReactElement, useState, useCallback } from 'react';
// import { action } from '@storybook/addon-actions';
// import MapVEuMap from './MapVEuMap';
import { BoundsViewport, MarkerProps } from './Types';
import { Marker, Tooltip } from 'react-leaflet';
import './TempIconHack';

import speciesData from './test-data/geoclust-species-testing-all-levels.json';

import { latLng, LeafletMouseEvent } from "leaflet";
import SVGDonutMarker from './SVGDonutMarker'; // TO BE CREATED

//DKDK sidebar & legend
import MapVEuMap from './MapVEuMap';
import MapVEuMapSidebar from './MapVEuMapSidebar';
//DKDK import a sidebar component
import SidebarExample from './SidebarExample'
// import { LeafletMouseEvent } from "leaflet";
//DKDK import legend
import MapVeuLegendSampleDropdown from './MapVeuLegendSampleDropdown'


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
  'geohash_1', // 3
  'geohash_2', // 4
  'geohash_2', // 5
  'geohash_2', // 6
  'geohash_3', // 7
  'geohash_3', // 8
  'geohash_3', // 9
  'geohash_4', // 10
  'geohash_4', // 11
  'geohash_4', // 12
  'geohash_5', // 13
  'geohash_5', // 14
  'geohash_5', // 15
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

//DKDK make legend contents
// const legendClassName = 'mapveu-legend'

//DKDK the variable names such as legendType and legendData should be consistent regardless of their values,
// but for test purpose the variabl names are used differently for categorical and number/Date
const legendTypeValue = 'categorical'
//DKDK intentionally use large value to check commas
const legendData = [
  {label: 'Anopheles gambiae', value: 14236000, color: '#FFB300'},
  {label: 'Anopheles funestus', value: 8923000, color: '#803E75'},
  {label: 'Anopheles dirus', value: 3444000, color: '#FF6800'},
  {label: 'Anopheles merus', value: 1903, color: '#A6BDD7'},
  {label: 'Culex quinquefasciatus', value: 205, color: '#C10020'},
  {label: 'Aedes albopictus', value: 145, color: '#CEA262'},
  {label: 'Culex tarsailis', value: 98, color: '#007D34'},
  {label: 'Aedes dorsalis', value: 45, color: '#F6768E'},
  {label: 'Culex erraticus', value: 22, color: '#00538A'},
  //DKDK added this fake data for checking truncate function (adding ...)
  {label: 'testing long name quinquefasciatus', value: 11, color: '#FF7A5C'},
  //DKDK below are Others item so their sum should be 44 (11*4) in this example data
  {label: 'Anophleles albimanus', value: 11, color: '#FF7A5C'},
  {label: '11th species', value: 11, color: '#53377A'},
  {label: 'Others1', value: 11, color: 'silver'},
  {label: 'Others2', value: 11, color: 'black'},
]

//DKDK below is for bar chart, thus variable names had Chart suffix
const legendTypeValueChart = 'numeric'
// const legendTypeValue = 'number'
//DKDK intentionally use large value to check commas
const legendDataChart = [
  {label: '10-20', value: 15, color: '#0200C5'},
  {label: '20-30', value: 80, color: '#6300C5'},
  {label: '30-40', value: 60, color: '#C400C5'},
  {label: '50-60', value: 30, color: '#C50045'},
  {label: '70-80', value: 40, color: '#C50000'},
  {label: 'no data', value: 20, color: 'silver'},
]

//DKDK send x-/y-axes labels for Legend bar chart
const variableLabel: string = '<b>Collection date</b>'  //DKDK: x-axis label
const quantityLabel: string = '<b>Record count</b>'     //DKDK: y-axis label

//DKDK  props for dropdown toggle text, dropdown item's href, and its text (Categorical)
const dropdownTitle: string = 'Species'
const dropdownHref: string[] = ['#/link-1','#/link-2','#/link-3','#/link-4','#/link-5','#/link-6','#/link-7']
const dropdownItemText: string[] =['Locus', 'Allele', 'Species', 'Sample type', 'Collection Protocol', 'Project', 'Protocol']
//DKDK for testing purpose, use other variable names for bar chart
const dropdownTitleBar: string = 'Age'
const dropdownHrefBar: string[] = ['#/link-1','#/link-2','#/link-3','#/link-4']
const dropdownItemTextBar: string[] =['Year', 'Month', 'Date', 'Age']

/**
   This is a trivial marker data generator.  It returns 10 random points within the given bounds.
   The real thing should something with zoomLevel.
*/
const getSpeciesMarkerElements = ({bounds, zoomLevel} : BoundsViewport) => {
  const geohash_level = zoomLevelToGeohashLevel[zoomLevel];

  const buckets = speciesData[geohash_level].facets.geo.buckets.filter(({ltAvg, lnAvg}) => {
    return ltAvg > bounds.southWest[0] &&
	   ltAvg < bounds.northEast[0] &&
	   lnAvg > bounds.southWest[1] &&
	   lnAvg < bounds.northEast[1]
  });



  return buckets.map((bucket) => {
    const lat = bucket.ltAvg;
    const long = bucket.lnAvg;
    let labels: string[] = [];
    let values: number[] = [];
    let colors: string[] = [];
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
  
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp : BoundsViewport) => {
    setMarkerElements(getSpeciesMarkerElements(bvp));
  }, [setMarkerElements])


  return (
    <>
      <MapVEuMap
        viewport={{center: [ 13.449566, -2.304301 ], zoom: 7}}
        height="100vh" width="100vw"
        onViewportChanged={handleViewportChanged}
        markers={markerElements}
        animation={null}
        showGrid={true}
      />
      <MapVeuLegendSampleDropdown
        // className={legendClassName}
        legendType={legendTypeValue}
        data={legendData}
        //DKDK add dropdown props for Legend
        dropdownTitle={dropdownTitle}
        dropdownHref={dropdownHref}
        dropdownItemText={dropdownItemText}
      />
    </>)
}


// export // disabled for now
const SpeciesSidebar = () => {
  //DKDK set global or local
  // const yAxisRange: Array<number> | null = [0, 1104]
  // const yAxisRange: Array<number> | null = []
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getSpeciesMarkerElements(bvp));
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

      <MapVeuLegendSampleDropdown
        // className={legendClassName}
        legendType={legendTypeValue}
        data={legendData}
        //DKDK add dropdown props for Legend
        dropdownTitle={dropdownTitle}
        dropdownHref={dropdownHref}
        dropdownItemText={dropdownItemText}
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
  const [ markerElements, setMarkerElements ] = useState<ReactElement<MarkerProps>[]>([]);
  const handleViewportChanged = useCallback((bvp: BoundsViewport) => {
    setMarkerElements(getSpeciesMarkerElements());
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

      <MapVeuLegendSampleDropdown
        // className={legendClassName}
        //DKDK here, variables names are used differently (with suffix, Chart) for test purpose
        legendType={legendTypeValueChart}
        data={legendDataChart}
        //DKDK send x-/y-axes lables here
        variableLabel={variableLabel}    //DKDK: x-axis label
        quantityLabel={quantityLabel}    //DKDK: y-axis label
        //DKDK add dropdown props for Legend: used different variable names for test purpose
        dropdownTitle={dropdownTitleBar}
        dropdownHref={dropdownHrefBar}
        dropdownItemText={dropdownItemTextBar}
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

