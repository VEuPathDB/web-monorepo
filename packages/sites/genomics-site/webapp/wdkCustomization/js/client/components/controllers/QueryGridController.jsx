import React from 'react';
import QueryGrid from '../QueryGrid';
import { WdkViewController } from 'wdk-client/Controllers';
import { getSearchMenuCategoryTree } from 'ebrc-client/util/category.js';

export default class QueryGridController extends WdkViewController {

  isRenderDataLoaded() {
    return this.state.globalData.ontology && this.state.globalData.recordClasses;
  }

  getTitle() {
    return 'Query Grid';
  }

  renderView() {
    let grid = getSearchMenuCategoryTree(this.state.globalData.ontology, this.state.globalData.recordClasses);
    return ( <QueryGrid grid={grid} /> );
  }

}
