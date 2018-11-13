import * as React from 'react';
import { connect } from 'react-redux';

import PageController from 'wdk-client/Core/Controllers/PageController';
import { safeHtml, wrappable, renderAttributeValue } from 'wdk-client/Utils/ComponentUtils';
import { Loading } from 'wdk-client/Components';
import { RootState } from 'wdk-client/Core/State/Types';
import {  requestColumnsConfig, fulfillColumnsConfig, requestPageSize, fulfillPageSize, requestAnswer, fulfillAnswer,  requestRecordsBasketStatus, fulfillRecordsBasketStatus,} from 'wdk-client/Actions/SummaryView/ResultTableSummaryViewActions';
import {State} from 'wdk-client/StoreModules/ResultTableSummaryViewStoreModule';
import LoadError from 'wdk-client/Components/PageStatus/LoadError';

const actionCreators = {
  requestColumnsConfig,
  fulfillColumnsConfig,
  requestPageSize,
  fulfillPageSize,
  requestAnswer,
  fulfillAnswer,
  requestRecordsBasketStatus,
  fulfillRecordsBasketStatus,
};

type StateProps = State;
type DispatchProps = typeof actionCreators;

type Props = StateProps & DispatchProps;

class ResultTableSummaryViewController extends PageController< Props > {

  isRenderDataLoaded() {
    return this.props.fulfillRecordsBasketStatus != null;
  }

  getTitle() {
    return "BLAST Results";
  }

  loadData () {
    if (this.props.fulfillAnswer == null) {
      this.props.requestAnswer(1, {});  // TODO fix this
    }
  }

  isRenderDataLoadError() {
    return this.props.error != null;
  }

  renderDataLoadError() {
    return <LoadError/>;  // TODO: make this better
  }

  renderView() {
    if (this.props.answer == null) return <Loading/>;

    return (
      <div>
      // TO DO
      </div>
       
    );
  }
}

const mapStateToProps = (state: RootState) => state.resultTableSummaryView;

export default connect(
  mapStateToProps,
  actionCreators
) (wrappable(ResultTableSummaryViewController));

