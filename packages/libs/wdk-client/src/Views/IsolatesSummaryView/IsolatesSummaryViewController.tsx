import * as React from 'react';
import { connect } from 'react-redux';

import PageController from 'wdk-client/Core/Controllers/PageController';
import { safeHtml, wrappable, renderAttributeValue } from 'wdk-client/Utils/ComponentUtils';
import { Loading } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import {createLoadingAction, createCompletedAction, createErrorAction} from 'wdk-client/Views/IsolatesSummaryView/IsolatesSummaryViewActions';
import {State} from 'wdk-client/Views/IsolatesSummaryView/IsolatesSummaryViewStoreModule';
import LoadError from 'wdk-client/Components/PageStatus/LoadError';

const actionCreators = {
  createLoadingAction,
  createCompletedAction,
  createErrorAction
};

type StateProps = State;
type DispatchProps = typeof actionCreators;

type Props = StateProps & DispatchProps;

class IsolatesSummaryViewController extends PageController< Props > {

  isRenderDataLoaded() {
    return this.props.isolatesSummaryData != null;
  }

  getTitle() {
    return "BLAST Results";
  }

  loadData () {
    if (this.props.isolatesSummaryData == null) {
      this.props.createLoadingAction(this.props.match.params.stepId);
    }
  }

  isRenderDataLoadError() {
    return this.props.error != null;
  }

  renderDataLoadError() {
    return <LoadError/>;  // TODO: make this better
  }


  renderView() {
    if (this.props.isolatesSummaryData == null) return <Loading/>;

    return (
      <div>FIX ME</div>   
       
    );
  }
}

const mapStateToProps = (state: RootState) => state.blastSummaryView;

export default connect(
  mapStateToProps,
  actionCreators
) (wrappable(IsolatesSummaryViewController));

