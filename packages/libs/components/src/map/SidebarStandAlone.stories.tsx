/* DKDK stand alone sidebar */

import React, { useState } from 'react';

import { Sidebar, Tab } from './SidebarReactCore';

//DKDK testing to separate a component for tab content
import TabHomeContent from './TabHomeContent';

export default {
  title: 'Sidebar/Sidebar stand-alone',
  // component: SidebarReactCore,
};

/* DKDK SidebarOnly() simply implemented a stand-alone sidebar: manually assigned tabs
 * each tab hosts a sub-component for contents
 */
export const SidebarBasic = () => {
  //DKDK Sidebar state managements
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [tabSelected, setTabSelected] = useState(''); //DKDK could be used to set default active tab, e.g., 'Home', but leave blank

  //DKDK this is X button/icon behavior considering sidebar resize
  const sidebarOnClose = () => {
    setSidebarCollapsed(true);
    //DKDK add this to fix a bug
    setTabSelected('');

    //DKDK this works!
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

  //DKDK this is sidebar opening considering sidebar resize
  const sidebarOnOpen = (id: string) => {
    //DKDK removing style for re-resizable here may help for 1st click bug - yes
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

    //DKDK add a function to close drawer by clicking the same icon
    if (tabSelected != id) {
      setSidebarCollapsed(false);
      setTabSelected(id);
    } else {
      setSidebarCollapsed(true);
      //DKDK clear tabSelected so that the tab can be reopen
      setTabSelected('');
    }
  };

  let testText = 'this is Home';

  return (
    //DKDK add fragment
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
          {/* DKDK a test to separate tab contents into a component, TabHomeContent */}
          <TabHomeContent id={'home'} header={testText} />
        </Tab>
        {/* DKDK testing disabled - greyish icon*/}
        <Tab id="settings" header="Settings" icon="fas fa-cog" disabled>
          <p>Change settings</p>
        </Tab>
        {/* DKDK add disabled tap - no header & icon, use both diabled and divider */}
        <Tab id="gap1" header="" icon="" disabled divider>
          <p>gap1</p>
        </Tab>
        <Tab
          id="marker-table"
          header="Details for selected samples"
          icon="fas fa-table"
        >
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
          <p>Donut Plot</p>
        </Tab>
        {/* DKDK no box plot icon exists in fontawesome */}
        <Tab id="boxplot" header="Box Plot" icon="fas fa-percent">
          <p>Box Plot</p>
        </Tab>
        <Tab id="graph" header="Chart" icon="fas fa-chart-bar">
          <p>This is for chart</p>
        </Tab>
        {/* DKDK placing bottom side using  anchor="bottom" attribute */}
        <Tab id="help" header="Tutorial" icon="fas fa-question" anchor="bottom">
          <p>Help/Tutorial</p>
        </Tab>
      </Sidebar>
    </>
  );
};
