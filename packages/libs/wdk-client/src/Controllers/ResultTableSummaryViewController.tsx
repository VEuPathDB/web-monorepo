import { createSelector } from 'reselect';
import * as React from 'react';
import { connect } from 'react-redux';

import PageController from 'wdk-client/Core/Controllers/PageController';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { RootState } from 'wdk-client/Core/State/Types';
import {
  requestPageSize,
  fulfillPageSize,
  requestAnswer,
  fulfillAnswer,
  requestRecordsBasketStatus,
  fulfillRecordsBasketStatus,
  openResultTableSummaryView,
  requestSortingUpdate,
  requestColumnsChoiceUpdate,
  requestPageSizeUpdate,
  viewPageNumber,
  showHideAddColumnsDialog,
  updateColumnsDialogSelection,
  updateColumnsDialogExpandedNodes,
} from 'wdk-client/Actions/SummaryView/ResultTableSummaryViewActions';
import { 
  requestUpdateBasket
} from 'wdk-client/Actions/BasketActions';
import LoadError from 'wdk-client/Components/PageStatus/LoadError';
import { CategoryTreeNode, isQualifying, addSearchSpecificSubtree } from 'wdk-client/Utils/CategoryUtils';
import { getTree } from 'wdk-client/Utils/OntologyUtils';
import ResultTableSummaryView from 'wdk-client/Views/ResultTableSummaryView/ResultTableSummaryView';
import { RecordClass, Question } from 'wdk-client/Utils/WdkModel';
import { openAttributeAnalysis, closeAttributeAnalysis } from 'wdk-client/Actions/AttributeAnalysisActions';

const actionCreators = {
  openResultTableSummaryView,
  requestPageSize,
  fulfillPageSize,
  requestAnswer,
  fulfillAnswer,
  requestRecordsBasketStatus,
  fulfillRecordsBasketStatus,
  requestSortingUpdate,
  requestColumnsChoiceUpdate,
  requestUpdateBasket,
  requestPageSizeUpdate,
  viewPageNumber,
  showHideAddColumnsDialog,
  updateColumnsDialogSelection,
  updateColumnsDialogExpandedNodes,
  openAttributeAnalysis,
  closeAttributeAnalysis,
};

type StateProps = RootState['resultTableSummaryView'] & {
  activeAttributeAnalysisName: string | undefined;
  columnsTree?: CategoryTreeNode;
  recordClass?: RecordClass;
  question?: Question;
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
    return this.props.answer != null;
  }

  getTitle() {
    return "Step results";
  }

  renderDataLoadError() {
    return <LoadError/>;  // TODO: make this better
  }

  renderView() {
    return (
      <ResultTableSummaryView {...this.props} />
    );
  }
}

const columnsTreeSelector = createSelector(
  (state: RootState) => state.globalData.ontology,
  (state: RootState) => state.globalData.questions,
  (state: RootState, props: OwnProps) => state.steps.steps[props.stepId],
  (ontology, questions, step) => {
    if (ontology == null || questions == null || step == null) return;
    const question = questions.find(q => q.name === step.answerSpec.questionName);
    const { recordClassName } = step;

    if (question == null) return undefined;

    const tree = getTree(ontology, isQualifying({
      targetType: 'attribute',
      recordClassName,
      scope: 'results'
    }));
    return addSearchSpecificSubtree(question, tree);
  }
)

const mapStateToProps = (state: RootState, props: OwnProps): StateProps => ({
  ...state.resultTableSummaryView,
  ...getQuestionAndRecordClass(state),
  columnsTree: columnsTreeSelector(state, props),
  activeAttributeAnalysisName: state.attributeAnalysis.report.activeAnalysis && state.attributeAnalysis.report.activeAnalysis.reporterName
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
  mapStateToProps,
  actionCreators
) (wrappable(ResultTableSummaryViewController));


function getQuestionAndRecordClass(rootState: RootState): { question: Question, recordClass: RecordClass } | undefined {
  if (
    rootState.resultTableSummaryView.questionFullName == null ||
    rootState.globalData.questions == null ||
    rootState.globalData.recordClasses == null
  ) return;

  const questionName = rootState.resultTableSummaryView.questionFullName;
  const question = rootState.globalData.questions.find(q => q.name === questionName);
  const recordClass = question && rootState.globalData.recordClasses.find(r => r.name === question.recordClassName);
  return question && recordClass && { question, recordClass };
}
