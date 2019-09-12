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
import { LoadingOverlay } from 'wdk-client/Components';

import './ResultTableSummaryView.scss';
import {ResultType} from 'wdk-client/Utils/WdkResult';

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
  resultType: ResultType;
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
  viewId: string;
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
  resultType,
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
  viewId,
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
        <LoadingOverlay>
          {answerLoading ? 'Loading results...' : 'Updating basket...'}
        </LoadingOverlay>
      )}
      {answer && question && columnsTree && (
        <ResultTableAddColumnsDialog
          answer={answer}
          question={question}
          viewId={viewId}
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
          viewId={viewId}
          actions={actions}
          selectedIds={selectedIds}
          showIdAttributeColumn={showIdAttributeColumn}
          activeAttributeAnalysisName={activeAttributeAnalysisName}
          resultType={resultType}
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
