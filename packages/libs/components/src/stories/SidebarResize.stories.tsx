import React, { ReactElement, useState, useCallback } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
// import { action } from '@storybook/addon-actions';
// import MapVEuMap from './MapVEuMap';
import { BoundsViewport, Bounds } from '../map/Types';
import { BoundsDriftMarkerProps } from '../map/BoundsDriftMarker';
import { defaultAnimationDuration } from '../map/config/map';
import { Viewport } from '../map/MapVEuMap';

//let's use new approach for data retrieval
import { getSpeciesDonuts } from './api/getMarkersFromFixtureData';

// below was an attempt to lazy load...
// it seemed to cause a 'black screen' error in Storybook if you refreshed the page in your browser
//
// let speciesData : any = undefined;
// import('./test-data/geoclust-species-testing-all-levels.json').then((json) => speciesData = json);

import { LeafletMouseEvent } from 'leaflet';

//load sidebar CSS
import { Sidebar, Tab } from '../map/Sidebar';

//testing to separate a component for tab content
import TabHomeContent from '../map/TabHomeContent';
//testing Pie Chart in sidebar
import TabPieChartContent from '../map/TabPieChartContent';

//map
import MapVEuMap, { MapVEuMapProps } from '../map/MapVEuMap';

//anim
// import Geohash from 'latlon-geohash';
// import {DriftMarker} from "leaflet-drift-marker";
import geohashAnimation from '../map/animation_functions/geohash';
import SemanticMarkers from '../map/SemanticMarkers';

export default {
  title: 'Sidebar/Sidebar in map',
  component: Sidebar,
  subcomponents: { Tab },
};

const defaultAnimation = {
  method: 'geohash',
  animationFunction: geohashAnimation,
  duration: defaultAnimationDuration,
};

//a generic function to remove a class: here it is used for removing highlight-marker
function removeClassName(targetClass: string) {
  //much convenient to use jquery here but try not to use it
  let targetElement = document.getElementsByClassName(targetClass)[0];
  if (targetElement != null) {
    targetElement.classList.remove(targetClass);
  }
}

//this onClick event may need to be changed in the future like onMouseOver event
const handleMarkerClick = (e: LeafletMouseEvent) => {
  /**
   * this only works when selecting other marker: not working when clicking map
   * it may be achieved by setting all desirable events (e.g., map click, preserving highlight, etc.)
   * just stop here and leave detailed events to be handled later
   */
  // use a resuable function to remove a class
  removeClassName('highlight-marker');
  //native manner, but not React style? Either way this is arguably the simplest solution
  e.target._icon.classList.add('highlight-marker');
  //here, perhaps we can add additional click event, like opening sidebar when clicking
  //console.log("I've been clicked")
};

export const SidebarResize: Story<MapVEuMapProps> = (args) => {
  //MapVeuMap stuff
  const [markerElements, setMarkerElements] = useState<
    ReactElement<BoundsDriftMarkerProps>[]
  >([]);

  //make a no-op function instead of setLegendData as this story does not use legend
  // const [legendData, setLegendData] = useState<LegendProps['data']>([]);
  const noop = () => {};

  const handleViewportChanged = useCallback(
    async (bvp: BoundsViewport) => {
      const markers = await getSpeciesDonuts(
        bvp,
        defaultAnimationDuration,
        noop,
        handleMarkerClick
      );
      setMarkerElements(markers);
    },
    [setMarkerElements]
  );

  //Sidebar state managements (for categorical)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [tabSelected, setTabSelected] = useState(''); //could be used to set default active tab, e.g., 'Home', but leave blank
  const [viewport] = useState<Viewport>({ center: [13, 16], zoom: 4 });

  //this is X button/icon behavior considering sidebar resize
  const sidebarOnClose = () => {
    setSidebarCollapsed(true);
    //add this to fix a bug
    setTabSelected('');

    //this works!
    let el: Element | null = document.getElementsByClassName(
      'leaflet-sidebar-content'
    )[0]
      ? document.getElementsByClassName('leaflet-sidebar-content')[0]
      : null;
    // let el: any = document.getElementById("leaflet-sidebar-content")? document.getElementById("leaflet-sidebar-content"): '';
    let tabStyle = el?.getAttributeNode('style');
    if (tabStyle) {
      el?.removeAttributeNode(tabStyle);
    }
  };

  //this is sidebar opening considering sidebar resize
  const sidebarOnOpen = (id: string) => {
    //removing style for re-resizable here may help for 1st click bug - yes
    let el: Element | null = document.getElementsByClassName(
      'leaflet-sidebar-content'
    )[0]
      ? document.getElementsByClassName('leaflet-sidebar-content')[0]
      : null;
    // let el: any = document.getElementById("leaflet-sidebar-content")? document.getElementById("leaflet-sidebar-content"): '';
    let tabStyle = el?.getAttributeNode('style');
    if (tabStyle) {
      el?.removeAttributeNode(tabStyle);
    }

    //add a function to close drawer by clicking the same icon
    if (tabSelected != id) {
      setSidebarCollapsed(false);
      setTabSelected(id);
    } else {
      setSidebarCollapsed(true);
      //clear tabSelected so that the tab can be reopen
      setTabSelected('');
    }
  };

  //5 data
  // let pieChartData = [{color: "#FFB300", label: "Anopheles gambiae sensu stricto", value: 130},{color: "#803E75", label: "Anopheles coluzzii", value: 127},{color: "#C10020", label: "Anopheles gambiae sensu lato", value: 47},{color: "silver", label: "Anopheles funestus", value: 10},{color: "#FF7A5C", label: "Culex quinquefasciatus", value: 6}];
  //test more data like 10
  let pieChartData = {
    slices: [
      {
        color: '#FFB300',
        label: 'Anopheles gambiae sensu stricto',
        value: 130,
      },
      { color: '#803E75', label: 'Anopheles coluzzii', value: 127 },
      { color: '#C10020', label: 'Anopheles gambiae sensu lato', value: 47 },
      { color: 'silver', label: 'Anopheles funestus', value: 10 },
      { color: '#FF7A5C', label: 'Culex quinquefasciatus', value: 6 },
      {
        color: '#FFB300',
        label: 'Anopheles gambiae sensu stricto1',
        value: 130,
      },
      { color: '#803E75', label: 'Anopheles coluzzii1', value: 127 },
      { color: '#C10020', label: 'Anopheles gambiae sensu lato1', value: 47 },
      { color: 'silver', label: 'Anopheles funestus1', value: 10 },
      { color: '#FF7A5C', label: 'Culex quinquefasciatus1', value: 6 },
    ],
  };

  let testText = 'this is Home';

  return (
    <>
      <Sidebar
        id="leaflet-sidebar"
        collapsed={sidebarCollapsed}
        position="left"
        selected={tabSelected}
        closeIcon="fas fa-times"
        onOpen={sidebarOnOpen}
        onClose={sidebarOnClose}
      >
        <Tab id="home" header="Home" icon="fas fa-home">
          {/* a test to separate tab contents into a component, TabHomeContent */}
          <TabHomeContent id={'home'} header={testText} />
        </Tab>
        {/* testing disabled - greyish icon*/}
        <Tab id="settings" header="Settings" icon="fas fa-cog" disabled>
          <p>Change settings</p>
        </Tab>
        {/* add disabled tap - no header & icon, use both diabled and divider */}
        <Tab id="gap1" header="" icon="" disabled divider>
          <p>gap1</p>
        </Tab>
        <Tab
          id="marker-table1"
          header="Details for selected samples"
          icon="fas fa-table"
        >
          <p>Detailed table???</p>
        </Tab>
        <Tab id="export" header="Export Data" icon="fas fa-download">
          <p>Download data</p>
        </Tab>
        {/* add disabled tap - no header & icon, use both diabled and divider */}
        <Tab id="gap2" header="" icon="" disabled divider>
          <p>gap2</p>
        </Tab>
        <Tab id="plot" header="Summary" icon="fas fa-chart-pie">
          {/* a test to separate tab contents into a component, TabHomeContent */}
          <TabPieChartContent
            id={'graph'}
            header={testText}
            pieChartData={pieChartData}
          />
        </Tab>
        {/* no box plot icon exists in fontawesome */}
        <Tab id="boxplot" header="Box Plot" icon="fas fa-percent">
          <p>Box plot</p>
        </Tab>
        <Tab id="graph" header="Chart" icon="fas fa-chart-bar">
          <p>This is for chart</p>
        </Tab>
        {/* placing bottom side using  anchor="bottom" attribute */}
        <Tab id="help" header="Tutorial" icon="fas fa-question" anchor="bottom">
          <p>Help/Tutorial</p>
        </Tab>
      </Sidebar>
      <MapVEuMap
        {...args}
        viewport={viewport}
        onBoundsChanged={handleViewportChanged}
      >
        <SemanticMarkers
          markers={markerElements}
          animation={defaultAnimation}
        />
      </MapVEuMap>
    </>
  );
};

SidebarResize.args = {
  height: '100vh',
  width: '100vw',
  showGrid: true,
};
