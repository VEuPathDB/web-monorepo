/* DKDK stand alone sidebar */

import React, { useState } from 'react';

//DKDK for SidebarBasic()
import SidebarList from './SidebarList'

//DKDK testing to import component and send it to array
import TabHomeContent from './TabHomeContent'

export default {
  title: 'DK Sidebar Tests/Sidebar stand-alone',
  component: SidebarList,
};

/* DKDK SidebarOnly() simply implemented a stand-alone sidebar: manually assigned tabs
 * each tab hosts a sub-component for contents
 */
export const SidebarBasic = () => {
  //DKDK Sidebar state managements
  const [ sidebarCollapsed, setSidebarCollapsed ] = useState(true);
  const [ tabSelected, setTabSelected ] = useState('');   //DKDK could be used to set default active tab, e.g., 'Home', but leave blank

  //DKDK this is X button/icon behavior
  const sidebarOnClose = () => {
    setSidebarCollapsed(true)
  }

  const sidebarOnOpen = (id: string) => {
    //DKDK add a function to close drawer by clicking the same icon
    if (tabSelected != id) {
      setSidebarCollapsed(false)
      setTabSelected(id)
    } else {
      setSidebarCollapsed(true)
      //DKDK clear tabSelected so that the tab can be reopen
      setTabSelected('')
    }
  }

  return (
    //DKDK add fragment
    <>
      <SidebarList
        id="leaflet-sidebar"
        collapsed={sidebarCollapsed}
        position='left'
        selected={tabSelected}
        closeIcon='fas fa-times'
        onOpen={sidebarOnOpen}
        onClose={sidebarOnClose}
      />
    </>
  );
}
