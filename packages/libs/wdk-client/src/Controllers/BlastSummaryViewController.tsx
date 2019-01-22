import * as React from 'react';
import { connect } from 'react-redux';

import PageController from 'wdk-client/Core/Controllers/PageController';
import { safeHtml, wrappable, renderAttributeValue } from 'wdk-client/Utils/ComponentUtils';
import { Loading } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import {requestBlastSummaryReport, fulfillBlastSummaryReport} from 'wdk-client/Actions/SummaryView/BlastSummaryViewActions';
import {State} from 'wdk-client/StoreModules/BlastSummaryViewStoreModule';
import LoadError from 'wdk-client/Components/PageStatus/LoadError';


const actionCreators = {
  requestBlastSummaryReport,
  fulfillBlastSummaryReport
};

type StateProps = State;
type DispatchProps = typeof actionCreators;
type OwnProps = { stepId: number };

type Props = OwnProps & DispatchProps & StateProps;

class BlastSummaryViewController extends PageController< Props > {

  isRenderDataLoaded() {
    return this.props.blastSummaryData != null;
  }

  getTitle() {
    return "BLAST Results";
  }

  loadData () {
    if (this.props.blastSummaryData == null) {
      this.props.requestBlastSummaryReport(this.props.stepId);
    }
  }

  isRenderDataLoadError() {
    return false; // TODO fix this
  }

  renderDataLoadError() {
    return <LoadError/>;  // TODO: make this better
  }



  renderView() {
    if (this.props.blastSummaryData == null) return <Loading/>;

    return (
      <div>
      <pre>{safeHtml(this.props.blastSummaryData.blastMeta.blastHeader)}</pre>

      {this.props.blastSummaryData.records.map((record => <pre>{renderAttributeValue(record.attributes.summary)}</pre>))}

      <pre>{safeHtml(this.props.blastSummaryData.blastMeta.blastMiddle)}</pre>

      {this.props.blastSummaryData.records.map((record => <pre>{renderAttributeValue(record.attributes.alignment)}</pre>))}

      <pre>{safeHtml(this.props.blastSummaryData.blastMeta.blastFooter)}</pre>
      </div>
       
    );
  }
}

const mapStateToProps = (state: RootState) => state.blastSummaryView;

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
  mapStateToProps,
  actionCreators
) (wrappable(BlastSummaryViewController));

