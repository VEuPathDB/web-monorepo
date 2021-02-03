import React, { ReactElement, useState, useCallback } from 'react';
// import { action } from '@storybook/addon-actions';
// import MapVEuMap from './MapVEuMap';
import { BoundsViewport, Bounds } from './Types';
import { BoundsDriftMarkerProps } from "./BoundsDriftMarker";
import { zoomLevelToGeohashLevel, defaultAnimationDuration } from './config/map.json';

import speciesData from './test-data/geoclust-species-testing-all-levels.json';

// below was an attempt to lazy load...
// it seemed to cause a 'black screen' error in Storybook if you refreshed the page in your browser
//
// let speciesData : any = undefined;
// import('./test-data/geoclust-species-testing-all-levels.json').then((json) => speciesData = json);

import { LeafletMouseEvent } from "leaflet";
import DonutMarker from './DonutMarker';

//DKDK load sidebar CSS
import { Sidebar, Tab } from './SidebarReactCoreResizeLib'
//DKDK modified version of typescript definition for react-leaflettaken
import { SidebarProps } from './type-react-leaflet-sidebarv2'

//DKDK testing to separate a component for tab content
import TabHomeContent from './TabHomeContent'
//DKDK testing Pie Chart in sidebar
import TabPieChartContent from './TabPieChartContent'
import TabPieChartContentLegend from './TabPieChartContentLegend'

//DKDK map
import MapVEuMap from './MapVEuMap';

//DKDK import legend
import MapVEuLegendSampleList, { LegendProps } from './MapVEuLegendSampleList'
//DKDK anim
// import Geohash from 'latlon-geohash';
// import {DriftMarker} from "leaflet-drift-marker";
import geohashAnimation from "./animation_functions/geohash";
import md5 from 'md5';

export default {
  title: 'DK Sidebar Tests/Sidebar resize Lib',
  // component: SidebarListResize,
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

//DKDK this onClick event may need to be changed in the future like onMouseOver event
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

const getSpeciesMarkerElements = ({bounds, zoomLevel} : BoundsViewport, duration : number, scrambleKeys: boolean = false, setLegendData: (legendData: Array<{label: string, value: number, color: string}>) => void) => {
  const geohash_level = zoomLevelToGeohashLevel[zoomLevel];

/* DKDK two approaches may be possible
  a) set type for imported geoclust-species-testing-all-levels.json
     > type speciesDataProps = typeof import('./test-data/geoclust-species-testing-all-levels.json')
     then, speciesData[geohash_level as keyof speciesDataProps].facets ...
  b) although a) works fine for current species data, it seems not to work for large json file
     thus used this approach instead for consistency
*/
  //DKDK applying b) approach, setting key as string & any
  const buckets = (speciesData as { [key: string]: any })[`geohash_${geohash_level}`].facets.geo.buckets.filter((bucket : any) => {
    const ltAvg : number = bucket.ltAvg;
    const lnAvg : number = bucket.lnAvg;
    return ltAvg > bounds.southWest.lat &&
	   ltAvg < bounds.northEast.lat &&
	   lnAvg > bounds.southWest.lng &&
	   lnAvg < bounds.northEast.lng
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
    const lng : number = bucket.lnAvg;
    const bounds : Bounds = { southWest: { lat: bucket.ltMin, lng: bucket.lnMin }, northEast: { lat: bucket.ltMax, lng: bucket.lnMax }};
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
      <DonutMarker
        id={key}   //DKDK anim
        key={key}   //DKDK anim
        position={{lat, lng}}
        bounds={bounds}
        labels={labels}
        values={values}
        colors={colors}
        isAtomic={atomicValue}
        onClick={handleClick}
        duration={duration}
      />
      )
  });
}

export const SidebarLibResize = () => {

  //MapVeuMap stuff
  const [ markerElements, setMarkerElements ] = useState<ReactElement<BoundsDriftMarkerProps>[]>([]);
  const [ legendData, setLegendData ] = useState<LegendProps["data"]>([])

  //DKDK anim
  const duration = defaultAnimationDuration
  const scrambleKeys = false

  const handleViewportChanged = useCallback((bvp : BoundsViewport) => {
    //DKDK anim add duration & scrambleKeys
    setMarkerElements(getSpeciesMarkerElements(bvp, duration, scrambleKeys, setLegendData));
  }, [setMarkerElements])

  //DKDK Sidebar state managements (for categorical)
  const [ sidebarCollapsed, setSidebarCollapsed ] = useState(true);
  const [ tabSelected, setTabSelected ] = useState('');   //DKDK could be used to set default active tab, e.g., 'Home', but leave blank


  //DKDK this is X button/icon behavior considering sidebar resize
  const sidebarOnClose = () => {
    setSidebarCollapsed(true)
    //DKDK add this to fix a bug
    setTabSelected('')

    //DKDK this works!
    let el: any = document.getElementsByClassName("leaflet-sidebar-content")[0]? document.getElementsByClassName("leaflet-sidebar-content")[0]: '';
    // let el: any = document.getElementById("leaflet-sidebar-content")? document.getElementById("leaflet-sidebar-content"): '';

    //DKDK this also works, maybe better
    let tabStyle: any = el.getAttributeNode("style")
    if (tabStyle) {
      el.removeAttributeNode(tabStyle)
    }
  }

  //DKDK this is sidebar opening considering sidebar resize
  const sidebarOnOpen = (id: string) => {
    //DKDK add a function to close drawer by clicking the same icon
    if (tabSelected != id) {
      setSidebarCollapsed(false)
      setTabSelected(id)

      //DKDK removing style for re-resizable here may help for 1st click bug - yes
      //DKDK need to add event to close opened tab by clicking icon too
      let el: any = document.getElementsByClassName("leaflet-sidebar-content")[0]? document.getElementsByClassName("leaflet-sidebar-content")[0]: '';
      // let el: any = document.getElementById("leaflet-sidebar-content")? document.getElementById("leaflet-sidebar-content"): '';
      let tabStyle: any = el.getAttributeNode("style")
      if (tabStyle) {
        el.removeAttributeNode(tabStyle)
      }
    } else {
      setSidebarCollapsed(true)
      //DKDK clear tabSelected so that the tab can be reopen
      setTabSelected('')

      //DKDK need to add event to close opened tab by clicking icon too
      let el: any = document.getElementsByClassName("leaflet-sidebar-content")[0]? document.getElementsByClassName("leaflet-sidebar-content")[0]: '';
      // let el: any = document.getElementById("leaflet-sidebar-content")? document.getElementById("leaflet-sidebar-content"): '';
      let tabStyle: any = el.getAttributeNode("style")
      if (tabStyle) {
        el.removeAttributeNode(tabStyle)
      }
    }
  }

  //DKDK 5 data
  // let pieChartData = [{color: "#FFB300", label: "Anopheles gambiae sensu stricto", value: 130},{color: "#803E75", label: "Anopheles coluzzii", value: 127},{color: "#C10020", label: "Anopheles gambiae sensu lato", value: 47},{color: "silver", label: "Anopheles funestus", value: 10},{color: "#FF7A5C", label: "Culex quinquefasciatus", value: 6}]
  //DKDK test more data like 10
  let pieChartData = [{color: "#FFB300", label: "Anopheles gambiae sensu stricto", value: 130},{color: "#803E75", label: "Anopheles coluzzii", value: 127},{color: "#C10020", label: "Anopheles gambiae sensu lato", value: 47},{color: "silver", label: "Anopheles funestus", value: 10},{color: "#FF7A5C", label: "Culex quinquefasciatus", value: 6},{color: "#FFB300", label: "Anopheles gambiae sensu stricto1", value: 130},{color: "#803E75", label: "Anopheles coluzzii1", value: 127},{color: "#C10020", label: "Anopheles gambiae sensu lato1", value: 47},{color: "silver", label: "Anopheles funestus1", value: 10},{color: "#FF7A5C", label: "Culex quinquefasciatus1", value: 6}]

  let testText = 'this is Home'

  return (
    <>
      <Sidebar
        id='leaflet-sidebar'
        collapsed={sidebarCollapsed}
        position='left'
        selected={tabSelected}
        closeIcon='fas fa-times'
        onOpen={sidebarOnOpen}
        onClose={sidebarOnClose}
      >
        <Tab id="home" header="Home" icon="fas fa-home">
            {/* DKDK a test to separate tab contents into a component, TabHomeContent */}
            <TabHomeContent
                id={'home'}
                header={testText}
            />
        </Tab>
        {/* DKDK testing disabled - greyish icon*/}
        <Tab id="settings" header="Settings" icon="fas fa-cog" disabled>
            <p>Change settings</p>
        </Tab>
        {/* DKDK add disabled tap - no header & icon, use both diabled and divider */}
        <Tab id="gap1" header="" icon="" disabled divider>
            <p>gap1</p>
        </Tab>
        <Tab id="marker-table" header="Details for selected samples" icon="fas fa-table">
            <p>Detailed table???</p>
        </Tab>
        <Tab id="export" header="Export Data" icon="fas fa-download">
            <p>Download data</p>
        </Tab>
        {/* DKDK add disabled tap - no header & icon, use both diabled and divider */}
        <Tab id="gap2" header="" icon="" disabled divider>
            <p>gap2</p>
        </Tab>
        <Tab id="plot" header="Summary" icon="fas fa-chart-pie">
            {/* DKDK a test to separate tab contents into a component, TabHomeContent */}
            <TabPieChartContent
              id={'graph'}
              header={testText}
              pieChartData={pieChartData}
            />
        </Tab>
        {/* DKDK no box plot icon exists in fontawesome */}
        <Tab id="boxplot" header="Box Plot" icon="fas fa-percent">
            {/* DKDK a test to separate tab contents into a component, TabHomeContent */}
            <TabPieChartContentLegend
              id={'graph'}
              header={testText}
              pieChartData={pieChartData}
              showLegend={false}
            />
        </Tab>
        <Tab id="graph" header="Chart" icon="fas fa-chart-bar">
            <p>This is for chart</p>
        </Tab>
        {/* DKDK placing bottom side using  anchor="bottom" attribute */}
        <Tab id="help" header="Tutorial" icon="fas fa-question" anchor="bottom">
            <p>Help/Tutorial</p>
        </Tab>
      </Sidebar>
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
    </>)
}

