import * as React from 'react';
import { connect } from 'react-redux';

import PageController from 'wdk-client/Core/Controllers/PageController';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { Loading } from 'wdk-client/Components';
import LoadError from 'wdk-client/Components/PageStatus/LoadError';
import { RootState } from 'wdk-client/Core/State/Types';
import {requestGenomeSummaryReport, fulfillGenomeSummaryReport} from 'wdk-client/Actions/SummaryView/GenomeSummaryViewActions';
import {State} from 'wdk-client/StoreModules/GenomeSummaryViewStoreModule';

const actionCreators = {
  requestGenomeSummaryReport,
  fulfillGenomeSummaryReport
};

type StateProps = State;
type DispatchProps = typeof actionCreators;

type Props = StateProps & DispatchProps;

class GenomeSummaryViewController extends PageController< Props > {

  isRenderDataLoaded() {
    return this.props.genomeSummaryData != null;
  }

  getTitle() {
    return "Genome Summary";
  }

  loadData () {
    if (this.props.genomeSummaryData == null) {
      this.props.requestGenomeSummaryReport(this.props.match.params.stepId);
    }
  }

  isRenderDataLoadError() {
    return false; // TODO: fix this
  }

  renderDataLoadError() {
    return <LoadError/>;  // TODO: make this better
  }

  renderView() {
    if (this.props.genomeSummaryData == null) return <Loading/>;

    return (     <div>{JSON.stringify(this.props.genomeSummaryData, null, 2)}</div>   
    );
  }
}

const mapStateToProps = (state: RootState) => state.genomeSummaryView;

export default connect(
  mapStateToProps,
  actionCreators
) (wrappable(GenomeSummaryViewController));

