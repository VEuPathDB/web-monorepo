import * as React from 'react';
import { Answer, RecordClass, Question } from 'wdk-client/Utils/WdkModel';
import { CategoryTreeNode } from 'wdk-client/Utils/CategoryUtils';
import { makeClassNameHelper } from 'wdk-client/Utils/ComponentUtils';
import ResultTable from 'wdk-client/Views/ResultTableSummaryView/ResultTable';
import {
  Action,
  BasketStatusArray,
  RequestSortingUpdate,
  RequestColumnsChoiceUpdate,
  RequestUpdateBasket,
  RequestAddStepToBasket,
  RequestPageSizeUpdate,
  ViewPageNumber,
  ShowHideAddColumnsDialog,
  UpdateColumnsDialogExpandedNodes,
  UpdateColumnsDialogSelection,
  UpdateColumnsDialogSearchString,
  OpenAttributeAnalysis,
  CloseAttributeAnalysis,
  UpdateSelectedIds,
  ShowLoginWarning
} from 'wdk-client/Views/ResultTableSummaryView/Types';
import ResultTableAddColumnsDialog from 'wdk-client/Views/ResultTableSummaryView/ResultTableAddColumnsDialog';
import Loading from 'wdk-client/Components/Loading/Loading';

import './ResultTableSummaryView.scss';

// Export this for convenience
export { Action };

interface Props {
  answer?: Answer;
  answerLoading: boolean;
  addingStepToBasket: boolean;
  actions?: Action[];
  selectedIds?: string[];
  showIdAttributeColumn?: boolean;
  userIsGuest: boolean;
  activeAttributeAnalysisName: string | undefined;
  stepId: number;
  recordClass?: RecordClass;
  question?: Question;
  basketStatusArray?: BasketStatusArray;
  columnsDialogIsOpen: boolean;
  columnsDialogSelection?: string[];
  columnsDialogSearchString?: string;
  columnsDialogExpandedNodes?: string[];
  columnsTree?: CategoryTreeNode;
  requestSortingUpdate: RequestSortingUpdate;
  requestColumnsChoiceUpdate: RequestColumnsChoiceUpdate;
  requestUpdateBasket: RequestUpdateBasket;
  requestAddStepToBasket: RequestAddStepToBasket;
  requestPageSizeUpdate: RequestPageSizeUpdate;
  viewPageNumber: ViewPageNumber;
  showHideAddColumnsDialog: ShowHideAddColumnsDialog;
  updateColumnsDialogSelection: UpdateColumnsDialogSelection;
  updateColumnsDialogSearchString: UpdateColumnsDialogSearchString;
  updateColumnsDialogExpandedNodes: UpdateColumnsDialogExpandedNodes;
  openAttributeAnalysis: OpenAttributeAnalysis;
  closeAttributeAnalysis: CloseAttributeAnalysis;
  updateSelectedIds: UpdateSelectedIds;
  showLoginWarning: ShowLoginWarning;
}

const cx = makeClassNameHelper('ResultTableSummaryView');

export default function ResultTableSummaryView({
  answer,
  answerLoading,
  addingStepToBasket,
  actions,
  selectedIds,
  showIdAttributeColumn = true,
  activeAttributeAnalysisName,
  stepId,
  recordClass,
  question,
  userIsGuest,
  basketStatusArray,
  requestColumnsChoiceUpdate,
  requestSortingUpdate,
  requestUpdateBasket,
  requestAddStepToBasket,
  requestPageSizeUpdate,
  viewPageNumber,
  showHideAddColumnsDialog,
  columnsDialogExpandedNodes,
  columnsDialogIsOpen,
  columnsDialogSelection,
  columnsDialogSearchString,
  columnsTree,
  updateColumnsDialogSelection,
  updateColumnsDialogSearchString,
  updateColumnsDialogExpandedNodes,
  openAttributeAnalysis,
  closeAttributeAnalysis,
  updateSelectedIds,
  showLoginWarning,
}: Props) {
  return (
    <div className={cx()}>
      {(answerLoading || addingStepToBasket) && (
        <div className={cx('LoadingOverlay')}>
          <Loading className={cx('Loading')}>
            {answerLoading ? 'Loading results...' : 'Updating basket...'}
          </Loading>
        </div>
      )}
      {answer && question && columnsTree && (
        <ResultTableAddColumnsDialog
          answer={answer}
          question={question}
          columnsDialogExpandedNodes={columnsDialogExpandedNodes}
          columnsDialogIsOpen={columnsDialogIsOpen}
          columnsDialogSelection={columnsDialogSelection}
          columnsDialogSearchString={columnsDialogSearchString}
          columnsTree={columnsTree}
          showHideAddColumnsDialog={showHideAddColumnsDialog}
          updateColumnsDialogExpandedNodes={updateColumnsDialogExpandedNodes}
          updateColumnsDialogSelection={updateColumnsDialogSelection}
          updateColumnsDialogSearchString={updateColumnsDialogSearchString}
          requestColumnsChoiceUpdate={requestColumnsChoiceUpdate}
        />
      )}
      {answer && recordClass && question ? (
        <ResultTable
          answer={answer}
          actions={actions}
          selectedIds={selectedIds}
          showIdAttributeColumn={showIdAttributeColumn}
          activeAttributeAnalysisName={activeAttributeAnalysisName}
          stepId={stepId}
          question={question}
          recordClass={recordClass}
          userIsGuest={userIsGuest}
          basketStatusArray={basketStatusArray}
          requestColumnsChoiceUpdate={requestColumnsChoiceUpdate}
          requestSortingUpdate={requestSortingUpdate}
          requestUpdateBasket={requestUpdateBasket}
          requestAddStepToBasket={requestAddStepToBasket}
          requestPageSizeUpdate={requestPageSizeUpdate}
          viewPageNumber={viewPageNumber}
          showHideAddColumnsDialog={showHideAddColumnsDialog}
          openAttributeAnalysis={openAttributeAnalysis}
          closeAttributeAnalysis={closeAttributeAnalysis}
          updateSelectedIds={updateSelectedIds}
          showLoginWarning={showLoginWarning}
        />
      ) : null}
    </div>
  );
}
