import React from 'react';
import QueryGrid from '../QueryGrid';
import { WdkViewController } from 'wdk-client/Controllers';
import { getSearchMenuCategoryTree } from '../../util/category.js';

export default class QueryGridController extends WdkViewController {

  getStoreName() {
    return 'QueryGridViewStore';
  }

  isRenderDataLoaded(state) {
    return state.globalData.ontology && state.globalData.recordClasses;
  }

  getTitle() {
    return 'Query Grid';
  }

  renderView(state) {
    let grid = getSearchMenuCategoryTree(state.globalData.ontology, state.globalData.recordClasses);
    return ( <QueryGrid grid={grid} /> );
  }

}
