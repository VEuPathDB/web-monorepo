import * as React from 'react';
import { connect } from 'react-redux';

import PageController from 'wdk-client/Core/Controllers/PageController';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { Loading } from 'wdk-client/Components';
import { Answer } from 'wdk-client/Utils/WdkModel';
import { RootState } from 'wdk-client/Core/State/Types';
import {  requestColumnsConfig, fulfillColumnsConfig, requestPageSize, fulfillPageSize, requestAnswer, fulfillAnswer,  requestRecordsBasketStatus, fulfillRecordsBasketStatus,} from 'wdk-client/Actions/SummaryView/ResultTableSummaryViewActions';
import {State} from 'wdk-client/StoreModules/ResultTableSummaryViewStoreModule';
import LoadError from 'wdk-client/Components/PageStatus/LoadError';
import { CategoryTreeNode, isQualifying } from 'wdk-client/Utils/CategoryUtils';
import { getTree } from 'wdk-client/Utils/OntologyUtils';

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

function columnsTreeSelector(state: RootState) : CategoryTreeNode | undefined {
  if (state.globalData.ontology === undefined || state.resultTableSummaryView.recordClassName === undefined) {
    return undefined;
  } else {
    return getTree(state.globalData.ontology, isQualifying({
      targetType: 'attribute',
      recordClassName: state.resultTableSummaryView.recordClassName,
      scope: 'results'
    }));
  }
}

const mapStateToProps = (state: RootState) => ({resultTableSummaryView: state.resultTableSummaryView, 
 columnsTree: columnsTreeSelector(state)}
  );

export default connect(
  mapStateToProps,
  actionCreators
) (wrappable(ResultTableSummaryViewController));

