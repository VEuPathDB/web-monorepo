import { createSelector } from 'reselect';
import * as React from 'react';
import { Dispatch, bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { RootState } from 'wdk-client/Core/State/Types';
import {
  openResultTableSummaryView,
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
import {
  showLoginWarning
} from 'wdk-client/Actions/UserSessionActions';
import { CategoryTreeNode, isQualifying, addSearchSpecificSubtree } from 'wdk-client/Utils/CategoryUtils';
import { getTree } from 'wdk-client/Utils/OntologyUtils';
import ResultTableSummaryView, { Action as TableAction } from 'wdk-client/Views/ResultTableSummaryView/ResultTableSummaryView';
import { RecordClass, Question } from 'wdk-client/Utils/WdkModel';
import { openAttributeAnalysis, closeAttributeAnalysis } from 'wdk-client/Actions/AttributeAnalysisActions';
import { partial, Partial1 } from 'wdk-client/Utils/ActionCreatorUtils';

interface StateProps {
  viewData: RootState['resultTableSummaryView'][string];
  derivedData: {
    activeAttributeAnalysisName: string | undefined;
    columnsTree?: CategoryTreeNode;
    recordClass?: RecordClass;
    question?: Question;
    userIsGuest: boolean;
  };
}
type DispatchProps = {
  showLoginWarning: typeof showLoginWarning;
  closeAttributeAnalysis: typeof closeAttributeAnalysis;
  openAttributeAnalysis: typeof openAttributeAnalysis;
  openResultTableSummaryView: Partial1<typeof openResultTableSummaryView>;
  requestAddStepToBasket: typeof requestAddStepToBasket;
  requestColumnsChoiceUpdate: Partial1<typeof requestColumnsChoiceUpdate>;
  requestPageSizeUpdate: Partial1<typeof requestPageSizeUpdate>;
  requestSortingUpdate: Partial1<typeof requestSortingUpdate>;
  requestUpdateBasket: typeof requestUpdateBasket;
  showHideAddColumnsDialog: Partial1<typeof showHideAddColumnsDialog>;
  updateColumnsDialogExpandedNodes: Partial1<typeof updateColumnsDialogExpandedNodes>;
  updateColumnsDialogSelection: Partial1<typeof updateColumnsDialogSelection>;
  updateSelectedIds: Partial1<typeof updateSelectedIds>;
  viewPageNumber: Partial1<typeof viewPageNumber>;
}

type OwnProps = {
  viewId: string;
  stepId: number;
  tableActions?: TableAction[];
}

type Props = OwnProps & StateProps & {
  actionCreators: DispatchProps;
}

class ResultTableSummaryViewController extends React.Component< Props > {

  componentDidMount() {
    this.props.actionCreators.openResultTableSummaryView(this.props.stepId);
    console.log('mounting ResultTableSummaryViewController', this);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.stepId !== this.props.stepId) {
      this.props.actionCreators.openResultTableSummaryView(this.props.stepId);
      console.log('updating ResultTableSummaryViewController', this);
    }
  }

  componentWillUnmount() {
    console.log('unmounting ResultTableSummaryViewController', this);
  }

  render() {
    if (this.props.viewData == null) return null;
    return (
      <ResultTableSummaryView
        stepId={this.props.stepId}
        actions={this.props.tableActions}
        {...this.props.viewData}
        {...this.props.derivedData}
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
    const question = questions.find(q => q.urlSegment === step.searchName);
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

function getQuestionAndRecordClass(rootState: RootState, props: OwnProps): { question: Question, recordClass: RecordClass } | undefined {
  const viewState = rootState.resultTableSummaryView[props.viewId];
  if (
    viewState == null ||
    viewState.searchName == null ||
    rootState.globalData.questions == null ||
    rootState.globalData.recordClasses == null
  ) return;

  const searchName = viewState.searchName;
  const question = rootState.globalData.questions.find(q => q.urlSegment === searchName);
  const recordClass = question && rootState.globalData.recordClasses.find(r => r.fullName === question.recordClassName);
  return question && recordClass && { question, recordClass };
}

function mapStateToProps(state: RootState, props: OwnProps): StateProps {
  return {
    viewData: state.resultTableSummaryView[props.viewId],
    derivedData: {
      ...getQuestionAndRecordClass(state, props),
      columnsTree: columnsTreeSelector(state, props),
      activeAttributeAnalysisName: state.attributeAnalysis.report.activeAnalysis && state.attributeAnalysis.report.activeAnalysis.reporterName,
      userIsGuest: state.globalData.user ? state.globalData.user.isGuest : false
    }
  };
}

function mapDispatchToProps(dispatch: Dispatch, { stepId, viewId }: OwnProps): DispatchProps {
  return bindActionCreators({
    showLoginWarning,
    closeAttributeAnalysis,
    openAttributeAnalysis,
    openResultTableSummaryView: partial(openResultTableSummaryView, viewId),
    requestAddStepToBasket,
    requestColumnsChoiceUpdate: partial(requestColumnsChoiceUpdate, viewId),
    requestPageSizeUpdate: partial(requestPageSizeUpdate, viewId),
    requestSortingUpdate: partial(requestSortingUpdate, viewId),
    requestUpdateBasket,
    showHideAddColumnsDialog: partial(showHideAddColumnsDialog, viewId),
    updateColumnsDialogExpandedNodes: partial(updateColumnsDialogExpandedNodes, viewId),
    updateColumnsDialogSelection: partial(updateColumnsDialogSelection, viewId),
    updateSelectedIds: partial(updateSelectedIds, viewId),
    viewPageNumber: partial(viewPageNumber, viewId),
  }, dispatch)
}

const ConnectedController = connect<StateProps, DispatchProps, OwnProps, Props, RootState>(
  mapStateToProps,
  mapDispatchToProps,
  (mappedState, actionCreators, ownProps) => ({ ...mappedState, actionCreators, ...ownProps })
)(wrappable(ResultTableSummaryViewController));

export default Object.assign(ConnectedController, {
  withTableActions: (tableActions: TableAction[]) => (props: Exclude<OwnProps, 'tableActions'>) =>
    <ConnectedController {...props} tableActions={tableActions}/>
});
