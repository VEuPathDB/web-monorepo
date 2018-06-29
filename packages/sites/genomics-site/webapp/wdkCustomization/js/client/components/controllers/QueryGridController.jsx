import React from 'react';
import QueryGrid from '../QueryGrid';
import { WdkPageController } from 'wdk-client/Controllers';

export default class QueryGridController extends WdkPageController {

  isRenderDataLoaded() {
    return this.state.globalData.searchTree;
  }

  getTitle() {
    return 'Query Grid';
  }

  renderView() {
    return ( <QueryGrid grid={this.state.globalData.searchTree} /> );
  }

}
