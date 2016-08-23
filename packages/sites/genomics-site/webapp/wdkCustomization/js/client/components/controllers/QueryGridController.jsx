import React from 'react';
import QueryGrid from '../QueryGrid';
import { WdkViewController } from 'wdk-client/Controllers';
import { getSearchMenuCategoryTree } from '../../util/category.js';

export default class QueryGridController extends WdkViewController {

  getStoreName() {
    return 'GlobalDataStore';
  }

  isRenderDataLoaded(state) {
    return state.ontology && state.recordClasses;
  }

  getTitle() {
    return 'Query Grid';
  }

  renderView(state) {
    let grid = getSearchMenuCategoryTree(state.ontology, state.recordClasses);
    return ( <QueryGrid grid={grid} /> );
  }

}
