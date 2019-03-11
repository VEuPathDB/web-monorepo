import { createSelector } from 'reselect';
import * as React from 'react';
import { connect } from 'react-redux';

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
  closeResultTableSummaryView,
  requestSortingUpdate,
  requestColumnsChoiceUpdate,
  requestPageSizeUpdate,
  viewPageNumber,
  showHideAddColumnsDialog,
  updateColumnsDialogSelection,
  updateColumnsDialogExpandedNodes,
  updateSelectedIds,
} from 'wdk-client/Actions/SummaryView/ResultTableSummaryViewActions';
import { 
  requestUpdateBasket,
  requestAddStepToBasket,
} from 'wdk-client/Actions/BasketActions';
import { CategoryTreeNode, isQualifying, addSearchSpecificSubtree } from 'wdk-client/Utils/CategoryUtils';
import { getTree } from 'wdk-client/Utils/OntologyUtils';
import ResultTableSummaryView, { Action as TableAction } from 'wdk-client/Views/ResultTableSummaryView/ResultTableSummaryView';
import { RecordClass, Question } from 'wdk-client/Utils/WdkModel';
import { openAttributeAnalysis, closeAttributeAnalysis } from 'wdk-client/Actions/AttributeAnalysisActions';

const actionCreators = {
  openResultTableSummaryView,
  closeResultTableSummaryView,  
  requestPageSize,
  fulfillPageSize,
  requestAnswer,
  fulfillAnswer,
  requestRecordsBasketStatus,
  fulfillRecordsBasketStatus,
  requestSortingUpdate,
  requestColumnsChoiceUpdate,
  requestUpdateBasket,
  requestAddStepToBasket,
  requestPageSizeUpdate,
  viewPageNumber,
  showHideAddColumnsDialog,
  updateColumnsDialogSelection,
  updateColumnsDialogExpandedNodes,
  openAttributeAnalysis,
  closeAttributeAnalysis,
  updateSelectedIds,
};

interface StateProps {
  viewData: RootState['resultTableSummaryView'] & {
    activeAttributeAnalysisName: string | undefined;
    columnsTree?: CategoryTreeNode;
    recordClass?: RecordClass;
    question?: Question;
  }
}
interface DispatchProps {
  actionCreators: typeof actionCreators;
}
type OwnProps = {
  stepId: number;
  tableActions?: TableAction[];
}

type Props = OwnProps & DispatchProps & StateProps;

class ResultTableSummaryViewController extends React.Component< Props > {

  componentDidMount() {
    this.props.actionCreators.openResultTableSummaryView(this.props.stepId);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.stepId !== this.props.stepId) {
      this.props.actionCreators.closeResultTableSummaryView(prevProps.stepId);
      this.props.actionCreators.openResultTableSummaryView(this.props.stepId);
    }
  }

  componentWillUnmount() {
    this.props.actionCreators.closeResultTableSummaryView(this.props.stepId);
  }

  render() {
    return (
      <ResultTableSummaryView
        stepId={this.props.stepId}
        actions={this.props.tableActions}
        {...this.props.viewData}
        {...this.props.actionCreators}
      />
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

const mapStateToProps = (state: RootState, props: OwnProps): StateProps['viewData'] => ({
  ...state.resultTableSummaryView,
  ...getQuestionAndRecordClass(state),
  columnsTree: columnsTreeSelector(state, props),
  activeAttributeAnalysisName: state.attributeAnalysis.report.activeAnalysis && state.attributeAnalysis.report.activeAnalysis.reporterName
});

const ConnectedController = connect<StateProps['viewData'], DispatchProps['actionCreators'], OwnProps, Props, RootState>(
  mapStateToProps,
  actionCreators,
  (viewData, actionCreators, ownProps) => ({ viewData, actionCreators, ...ownProps })
)(wrappable(ResultTableSummaryViewController));

export default Object.assign(ConnectedController, {
  withTableActions: (tableActions: TableAction[]) => (props: Exclude<OwnProps, 'tableActions'>) =>
    <ConnectedController {...props} tableActions={tableActions}/>
});
