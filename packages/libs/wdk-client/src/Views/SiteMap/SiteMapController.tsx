import * as React from 'react';
import { connect } from 'react-redux';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import * as SiteMapActionCreators from 'wdk-client/Views/SiteMap/SiteMapActionCreators';
import SiteMap from 'wdk-client/Views/SiteMap/SiteMap';
import { RootState } from 'wdk-client/Core/State/Types';
import PageController from 'wdk-client/Core/Controllers/PageController';

type StateProps = RootState['siteMap'];
type DispatchProps = typeof SiteMapActionCreators;

type Props = {
  stateProps: StateProps,
  dispatchProps: DispatchProps
};

class SiteMapController extends PageController<Props> {

  isRenderDataLoaded() {
    const { 
      stateProps: { tree, isLoading } 
    } = this.props;

    return (tree != null && !isLoading);
  }

  getTitle() {
    return 'Data Finder';
  }

  renderView() {
    const { stateProps, dispatchProps } = this.props;

    return ( <SiteMap {...stateProps} siteMapActions={dispatchProps}/> );
  }

  loadData() {
    const { 
      stateProps: { tree }, 
      dispatchProps: { loadCurrentSiteMap } 
    } = this.props;

    if (tree == null) {
      loadCurrentSiteMap();
    }
  }

}

export default connect(
  (state: RootState) => state.siteMap,
  SiteMapActionCreators,
  (stateProps, dispatchProps) => ({
    stateProps,
    dispatchProps
  })
)(wrappable(SiteMapController));
