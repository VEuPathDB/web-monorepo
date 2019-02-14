import * as React from 'react';
import { connect } from 'react-redux';

import ViewController from 'wdk-client/Core/Controllers/ViewController';
import { safeHtml, wrappable, renderAttributeValue } from 'wdk-client/Utils/ComponentUtils';
import { Loading } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import {requestIsolatesSummaryReport, fulfillIsolatesSummaryReport} from 'wdk-client/Actions/SummaryView/IsolatesSummaryViewActions';
import {State} from 'wdk-client/StoreModules/IsolatesSummaryViewStoreModule';
import LoadError from 'wdk-client/Components/PageStatus/LoadError';

const actionCreators = {
  requestIsolatesSummaryReport,
  fulfillIsolatesSummaryReport
};

type StateProps = State;
type DispatchProps = typeof actionCreators;
type OwnProps = { stepId: number };

type Props = OwnProps & DispatchProps & StateProps;

class IsolatesSummaryViewController extends ViewController< Props > {

  isRenderDataLoaded() {
    return this.props.isolatesSummaryData != null;
  }

  loadData () {
    if (this.props.isolatesSummaryData == null) {
      this.props.requestIsolatesSummaryReport(this.props.stepId);
    }
  }

  isRenderDataLoadError() {
    return false; // TODO fix this
  }

  renderDataLoadError() {
    return <LoadError/>;  // TODO: make this better
  }


  renderView() {
    if (this.props.isolatesSummaryData == null) return <Loading/>;

    return (
      <div>{JSON.stringify(this.props.isolatesSummaryData, null, 2)}</div>     
       
    );
  }
}

const mapStateToProps = (state: RootState) => state.isolatesSummaryView;

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
  mapStateToProps,
  actionCreators
) (wrappable(IsolatesSummaryViewController));

