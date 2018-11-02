import * as React from 'react';
import { connect } from 'react-redux';

import PageController from 'wdk-client/Core/Controllers/PageController';
import { safeHtml, wrappable, renderAttributeValue } from 'wdk-client/Utils/ComponentUtils';
import { Loading } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import {createLoadingAction, createCompletedAction, createErrorAction} from 'wdk-client/Views/BlastSummaryView/BlastSummaryViewActions';
import {State} from 'wdk-client/Views/BlastSummaryView/BlastSummaryViewStoreModule';

const actionCreators = {
  createLoadingAction,
  createCompletedAction,
  createErrorAction
};

type StateProps = State;
type DispatchProps = typeof actionCreators;

type Props = StateProps & DispatchProps;

class BlastSummaryViewController extends PageController< Props > {

  isRenderDataLoaded() {
    return this.props.blastSummaryData != null;
  }

  getTitle() {
    return "BLAST Results";
  }

  loadData () {
    if (this.props.blastSummaryData == null) {
      this.props.createLoadingAction(this.props.match.params.stepId);
    }
  }

  isRenderDataLoadError() {
    return this.props.errorMessage != null;
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

export default connect(
  mapStateToProps,
  actionCreators
) (wrappable(BlastSummaryViewController));

