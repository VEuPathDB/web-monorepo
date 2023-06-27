import * as React from 'react';
import { Answer, RecordClass, Question } from '../../Utils/WdkModel';
import { CategoryTreeNode } from '../../Utils/CategoryUtils';
import { makeClassNameHelper } from '../../Utils/ComponentUtils';
import ResultTable from '../../Views/ResultTableSummaryView/ResultTable';
import {
  Action,
  BasketStatusArray,
  RequestSortingUpdate,
  RequestColumnsChoiceUpdate,
  RequestUpdateBasket,
  RequestAddStepToBasket,
  RequestPageSizeUpdate,
  ViewPageNumber,
  UpdateInBasketFilter,
  ShowHideAddColumnsDialog,
  UpdateColumnsDialogExpandedNodes,
  UpdateColumnsDialogSelection,
  UpdateColumnsDialogSearchString,
  OpenAttributeAnalysis,
  CloseAttributeAnalysis,
  UpdateSelectedIds,
  ShowLoginWarning,
} from '../../Views/ResultTableSummaryView/Types';
import ResultTableAddColumnsDialog from '../../Views/ResultTableSummaryView/ResultTableAddColumnsDialog';
import { LoadingOverlay } from '../../Components';

import './ResultTableSummaryView.scss';
import { ResultType } from '../../Utils/WdkResult';

// Export this for convenience
export type { Action };

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
  inBasketFilterEnabled: boolean;
  requestSortingUpdate: RequestSortingUpdate;
  requestColumnsChoiceUpdate: RequestColumnsChoiceUpdate;
  requestUpdateBasket: RequestUpdateBasket;
  requestAddStepToBasket: RequestAddStepToBasket;
  requestPageSizeUpdate: RequestPageSizeUpdate;
  viewPageNumber: ViewPageNumber;
  updateInBasketFilter: UpdateInBasketFilter;
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
  inBasketFilterEnabled,
  updateInBasketFilter,
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
          updateInBasketFilter={updateInBasketFilter}
          inBasketFilterEnabled={inBasketFilterEnabled}
        />
      ) : null}
    </div>
  );
}
