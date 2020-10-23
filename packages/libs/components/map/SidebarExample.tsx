// DKDK an example of a sidebar component
import React from 'react';
import { Sidebar, Tab } from './SidebarReactCore'
//DKDK modified version of typescript definition for react-leaflettaken
import { SidebarProps } from './type-react-leaflet-sidebarv2'

/**
 * DKDK this is an example of Sidebar component
 */
export default function SidebarExample(props: SidebarProps) {
  /**
   * DKDK think it may be better to separate Tabs as sub-components in the future?
   */
  let testText = 'this is Home'
  return (
    <Sidebar
        id={props.id}
        collapsed={props.collapsed}
        position={props.position}
        selected={props.selected}
        closeIcon={props.closeIcon}
        onOpen={props.onOpen}
        onClose={props.onClose}
    >
        <Tab id="home" header="Home" icon="fas fa-home">
            <p>{testText}</p>
        </Tab>
        <Tab id="settings" header="Settings" icon="fas fa-cog">
            <p>Change settings</p>
        </Tab>
        {/* DKDK add disabled tap to mimick blank space */}
        <Tab id="gap1" header="" icon="" disabled>
            <p>gap1</p>
        </Tab>
        <Tab id="marker-table" header="Details for selected samples" icon="fas fa-table">
            <p>Detailed table???</p>
        </Tab>
        <Tab id="export" header="Export Data" icon="fas fa-download">
            <p>Download data</p>
        </Tab>
        {/* DKDK add disabled tap to mimick blank space */}
        <Tab id="gap2" header="" icon="" disabled>
            <p>gap2</p>
        </Tab>
        <Tab id="plot" header="Summary" icon="fas fa-chart-pie">
            <p>For plots</p>
        </Tab>
        {/* DKDK no box plot icon exists in fontawesome */}
        <Tab id="boxplot" header="Box Plot" icon="fas fa-percent">
            <p>No box plot icon exists in the fontawesome</p>
        </Tab>
        <Tab id="graph" header="Chart" icon="fas fa-chart-bar">
            <p>This is for chart</p>
        </Tab>
        {/* DKDK placing bottom side using  anchor="bottom" attribute */}
        <Tab id="help" header="Tutorial" icon="fas fa-question" anchor="bottom">
            <p>Help/Tutorial</p>
        </Tab>
    </Sidebar>
  );
}

