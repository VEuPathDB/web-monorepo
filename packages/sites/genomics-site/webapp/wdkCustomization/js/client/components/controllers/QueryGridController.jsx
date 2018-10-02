import React from 'react';
import { connect } from 'react-redux';

import { searchTree } from '../../selectors/QueryGridSelectors';

import QueryGrid from '../QueryGrid';
import { PageController } from 'wdk-client/Controllers';

class QueryGridController extends PageController {

  isRenderDataLoaded() {
    return this.props.searchTree;
  }

  getTitle() {
    return 'Query Grid';
  }

  renderView() {
    return ( <QueryGrid grid={this.props.searchTree} /> );
  }

}

export default connect(
  state => ({
    searchTree: searchTree(state)
  })
)(QueryGridController);
