import { createSelector } from 'reselect';
import React, { useEffect } from 'react';
import { Dispatch, bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { wrappable } from '../Utils/ComponentUtils';
import { RootState } from '../Core/State/Types';
import {
  openResultTableSummaryView,
  closeResultTableSummaryView,
  requestSortingUpdate,
  requestColumnsChoiceUpdate,
  requestPageSizeUpdate,
  viewPageNumber,
  showHideAddColumnsDialog,
  updateColumnsDialogSelection,
  updateColumnsDialogSearchString,
  updateColumnsDialogExpandedNodes,
  updateSelectedIds,
} from '../Actions/SummaryView/ResultTableSummaryViewActions';
import {
  requestUpdateBasket,
  requestAddStepToBasket,
} from '../Actions/BasketActions';
import { showLoginWarning } from '../Actions/UserSessionActions';
import {
  CategoryTreeNode,
  isQualifying,
  addSearchSpecificSubtree,
} from '../Utils/CategoryUtils';
import { getTree } from '../Utils/OntologyUtils';
import ResultTableSummaryView, {
  Action as TableAction,
} from '../Views/ResultTableSummaryView/ResultTableSummaryView';
import { RecordClass, Question } from '../Utils/WdkModel';
import {
  openAttributeAnalysis,
  closeAttributeAnalysis,
} from '../Actions/AttributeAnalysisActions';
import { partial, Partial1 } from '../Utils/ActionCreatorUtils';
import { ResultType } from '../Utils/WdkResult';
import { ContentError } from '../Components/PageStatus/ContentError';
interface StateProps {
  viewData: RootState['resultTableSummaryView'][string];
  derivedData: {
    activeAttributeAnalysisName: string | undefined;
    columnsTree?: CategoryTreeNode;
    recordClass?: RecordClass;
    question?: Question;
    userIsGuest: boolean;
    errorMessage?: string;
  };
}
type DispatchProps = {
  showLoginWarning: typeof showLoginWarning;
  closeAttributeAnalysis: typeof closeAttributeAnalysis;
  openAttributeAnalysis: typeof openAttributeAnalysis;
  openResultTableSummaryView: Partial1<typeof openResultTableSummaryView>;
  closeResultTableSummaryView: Partial1<typeof closeResultTableSummaryView>;
  requestAddStepToBasket: typeof requestAddStepToBasket;
  requestColumnsChoiceUpdate: Partial1<typeof requestColumnsChoiceUpdate>;
  requestPageSizeUpdate: Partial1<typeof requestPageSizeUpdate>;
  requestSortingUpdate: Partial1<typeof requestSortingUpdate>;
  requestUpdateBasket: typeof requestUpdateBasket;
  showHideAddColumnsDialog: Partial1<typeof showHideAddColumnsDialog>;
  updateColumnsDialogExpandedNodes: Partial1<
    typeof updateColumnsDialogExpandedNodes
  >;
  updateColumnsDialogSelection: Partial1<typeof updateColumnsDialogSelection>;
  updateColumnsDialogSearchString: Partial1<
    typeof updateColumnsDialogSearchString
  >;
  updateSelectedIds: Partial1<typeof updateSelectedIds>;
  viewPageNumber: Partial1<typeof viewPageNumber>;
};

type OwnProps = {
  viewId: string;
  resultType: ResultType;
  tableActions?: TableAction[];
  showIdAttributeColumn?: boolean;
  showCount?: boolean;
};

type Props = OwnProps &
  StateProps & {
    actionCreators: Omit<DispatchProps, 'updateColumnsDialogSelection'> & {
      updateColumnsDialogSelection: (columnSelection: string[]) => void;
    };
  };

function ResultTableSummaryViewController(props: Props) {
  const {
    resultType,
    actionCreators,
    viewData,
    viewId,
    derivedData,
    tableActions,
    showCount,
    showIdAttributeColumn,
  } = props;

  useEffect(() => {
    actionCreators.openResultTableSummaryView(resultType);
    return () => {
      actionCreators.closeResultTableSummaryView();
    };
  }, [resultType]);

  if (viewData == null) return null;
  if (derivedData.errorMessage != null)
    return <ContentError>{derivedData.errorMessage}</ContentError>;

  return (
    <ResultTableSummaryView
      viewId={viewId}
      resultType={resultType}
      actions={tableActions}
      showCount={showCount}
      showIdAttributeColumn={showIdAttributeColumn}
      {...viewData}
      {...derivedData}
      {...actionCreators}
    />
  );
}

const columnsTreeSelector = createSelector(
  (state: RootState) => state.globalData.ontology,
  (state: RootState) => state.globalData.questions,
  (state: RootState, props: OwnProps) =>
    state.resultTableSummaryView[props.viewId],
  (ontology, questions, summaryViewState) => {
    if (ontology == null || questions == null || summaryViewState == null)
      return;
    const { resultTypeDetails } = summaryViewState;
    if (resultTypeDetails == null) return;

    const { recordClassName, searchName } = resultTypeDetails;
    const question = questions.find(
      ({ urlSegment }) => urlSegment === searchName
    );

    if (question == null) return undefined;

    const tree = getTree(
      ontology,
      isQualifying({
        targetType: 'attribute',
        recordClassUrlSegment: recordClassName,
        scope: 'results',
      })
    );
    return addSearchSpecificSubtree(question, tree);
  }
);

function getQuestionAndRecordClass(
  rootState: RootState,
  props: OwnProps
): { question: Question; recordClass: RecordClass } | undefined {
  const viewState = rootState.resultTableSummaryView[props.viewId];
  if (
    viewState == null ||
    viewState.searchName == null ||
    rootState.globalData.questions == null ||
    rootState.globalData.recordClasses == null
  )
    return;

  const searchName = viewState.searchName;
  const question = rootState.globalData.questions.find(
    (q) => q.urlSegment === searchName
  );
  const recordClass =
    question &&
    rootState.globalData.recordClasses.find(
      (r) => r.urlSegment === question.outputRecordClassName
    );
  return question && recordClass && { question, recordClass };
}

function mapStateToProps(state: RootState, props: OwnProps): StateProps {
  const viewData = state.resultTableSummaryView[props.viewId];
  // This is a but messy!
  const errorMessage =
    viewData?.errorMessage ||
    (viewData && !viewData.answerLoading && !viewData.answer
      ? props.viewId.startsWith('basket')
        ? 'Fixing your basket using the instructions above might help.'
        : undefined
      : undefined);

  return {
    viewData,
    derivedData: {
      ...getQuestionAndRecordClass(state, props),
      columnsTree: columnsTreeSelector(state, props),
      activeAttributeAnalysisName:
        state.attributeAnalysis.report.activeAnalysis &&
        state.attributeAnalysis.report.activeAnalysis.reporterName,
      userIsGuest: state.globalData.user
        ? state.globalData.user.isGuest
        : false,
      errorMessage,
    },
  };
}

function mapDispatchToProps(
  dispatch: Dispatch,
  { viewId }: OwnProps
): DispatchProps {
  return bindActionCreators(
    {
      showLoginWarning,
      closeAttributeAnalysis,
      openAttributeAnalysis,
      openResultTableSummaryView: partial(openResultTableSummaryView, viewId),
      closeResultTableSummaryView: partial(closeResultTableSummaryView, viewId),
      requestAddStepToBasket,
      requestColumnsChoiceUpdate: partial(requestColumnsChoiceUpdate, viewId),
      requestPageSizeUpdate: partial(requestPageSizeUpdate, viewId),
      requestSortingUpdate: partial(requestSortingUpdate, viewId),
      requestUpdateBasket,
      showHideAddColumnsDialog: partial(showHideAddColumnsDialog, viewId),
      updateColumnsDialogExpandedNodes: partial(
        updateColumnsDialogExpandedNodes,
        viewId
      ),
      updateColumnsDialogSelection: partial(
        updateColumnsDialogSelection,
        viewId
      ),
      updateColumnsDialogSearchString: partial(
        updateColumnsDialogSearchString,
        viewId
      ),
      updateSelectedIds: partial(updateSelectedIds, viewId),
      viewPageNumber: partial(viewPageNumber, viewId),
    },
    dispatch
  );
}

const ConnectedController = connect<
  StateProps,
  DispatchProps,
  OwnProps,
  Props,
  RootState
>(
  mapStateToProps,
  mapDispatchToProps,
  (mappedState, actionCreators, ownProps) => ({
    ...mappedState,
    actionCreators: {
      ...actionCreators,
      updateColumnsDialogSelection: (columnSelection: string[]) => {
        // Prevent non-removable columns from being removed (as per Redmine #37492)
        const columnSelectionWithNonRemovableColumns =
          mappedState.derivedData.recordClass == null
            ? columnSelection
            : [
                ...mappedState.derivedData.recordClass.attributes
                  .filter(
                    (attribute) =>
                      !attribute.isRemovable &&
                      !columnSelection.includes(attribute.name)
                  )
                  .map((attribute) => attribute.name),
                ...columnSelection,
              ];

        actionCreators.updateColumnsDialogSelection(
          columnSelectionWithNonRemovableColumns
        );
      },
    },
    ...ownProps,
  })
)(wrappable(ResultTableSummaryViewController));

type WithOptionsPropName =
  | 'tableActions'
  | 'showIdAttributeColumn'
  | 'showCount';

export default Object.assign(ConnectedController, {
  withOptions:
    (options: Pick<OwnProps, WithOptionsPropName>) =>
    (props: Exclude<OwnProps, WithOptionsPropName>) =>
      <ConnectedController {...props} {...options} />,
});
