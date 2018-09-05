import * as React from 'react';
import { wrappable } from '../../Utils/ComponentUtils';
import AbstractPageController from '../../Core/Controllers/AbstractPageController';
import * as SiteMapActionCreators from './SiteMapActionCreators';
import SiteMapStore, { State } from './SiteMapStore';
import SiteMap from './SiteMap';

type EventHandlers = typeof SiteMapActionCreators;

class SiteMapController extends AbstractPageController<State, SiteMapStore, EventHandlers> {

  getStoreClass() {
    return SiteMapStore;
  }

  getStateFromStore() {
    return this.store.getState();
  }

  getActionCreators() {
    return SiteMapActionCreators;
  }

  isRenderDataLoaded() {
    return (this.state.tree != null && !this.state.isLoading);
  }

  getTitle() {
    return "Data Finder";
  }

  renderView() {
    return ( <SiteMap {...this.state} siteMapActions={this.eventHandlers}/> );
  }

  loadData() {
    if (this.state.tree == null) {
      this.eventHandlers.loadCurrentSiteMap();
    }
  }

}

export default wrappable(SiteMapController);
