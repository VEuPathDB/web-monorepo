import * as React from 'react';
import { connect } from 'react-redux';

import PageController from 'wdk-client/Core/Controllers/PageController';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { RootState } from 'wdk-client/Core/State/Types';
import {  requestPageSize, fulfillPageSize, requestAnswer, fulfillAnswer,  requestRecordsBasketStatus, fulfillRecordsBasketStatus, openResultTableSummaryView} from 'wdk-client/Actions/SummaryView/ResultTableSummaryViewActions';
import LoadError from 'wdk-client/Components/PageStatus/LoadError';
import { CategoryTreeNode, isQualifying } from 'wdk-client/Utils/CategoryUtils';
import { getTree } from 'wdk-client/Utils/OntologyUtils';

const actionCreators = {
  openResultTableSummaryView,
  requestPageSize,
  fulfillPageSize,
  requestAnswer,
  fulfillAnswer,
  requestRecordsBasketStatus,
  fulfillRecordsBasketStatus,
};

type StateProps = Pick<RootState, 'resultTableSummaryView'> & {
  columnsTree?: CategoryTreeNode
};
type DispatchProps = typeof actionCreators;
type OwnProps = {
  stepId: number;
}

type Props = OwnProps & DispatchProps & StateProps;

class ResultTableSummaryViewController extends PageController< Props > {

  loadData(prevProps?: Props) {
    if (prevProps == null || prevProps.stepId !== this.props.stepId) {
      this.props.openResultTableSummaryView(this.props.stepId);
    }
  }

  isRenderDataLoaded() {
    return this.props.resultTableSummaryView.answer != null;
  }

  getTitle() {
    return "BLAST Results";
  }

  renderDataLoadError() {
    return <LoadError/>;  // TODO: make this better
  }

  renderView() {
    return (
      <div>
        <pre>
          {JSON.stringify(this.props.resultTableSummaryView, null, 4)}
        </pre>
      </div>
       
    );
  }
}

function columnsTreeSelector(state: RootState, props: OwnProps) : CategoryTreeNode | undefined {
  if (state.globalData.ontology === undefined || state.steps.steps [props.stepId] === undefined) {
    return undefined;
  } else {
    let recordClassName = state.steps.steps[props.stepId].recordClassName
    return getTree(state.globalData.ontology, isQualifying({
      targetType: 'attribute',
      recordClassName,
      scope: 'results'
    }));
  }
}

const mapStateToProps = (state: RootState, props: OwnProps) => ({
  resultTableSummaryView: state.resultTableSummaryView,
  columnsTree: columnsTreeSelector(state, props)
});

export default connect(
  mapStateToProps,
  actionCreators
) (wrappable(ResultTableSummaryViewController));

