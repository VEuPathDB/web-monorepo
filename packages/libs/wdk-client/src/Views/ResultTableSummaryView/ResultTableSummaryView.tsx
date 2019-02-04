import * as React from 'react';
import {
  Answer,
  RecordClass,
  Question,
  AttributeSortingSpec,
  PrimaryKey
} from 'wdk-client/Utils/WdkModel';
import { CategoryTreeNode } from 'wdk-client/Utils/CategoryUtils';
import ResultTable from 'wdk-client/Views/ResultTableSummaryView/ResultTable';
import ResultTableAddColumnsDialog from 'wdk-client/Views/ResultTableSummaryView/ResultTableAddColumnsDialog';

import './ResultTableSummaryView.scss';

interface Props {
  answer?: Answer;
  activeAttributeAnalysisName: string | undefined;
  stepId: number;
  recordClass?: RecordClass;
  question?: Question;
  currentPage?: number;
  pageSize?: number;
  basketStatusArray?: Array<'yes' | 'no' | 'loading'>;
  columnsDialogIsOpen: boolean;
  columnsDialogSelection?: string[];
  columnsDialogExpandedNodes?: string[];
  columnsTree?: CategoryTreeNode;
  requestSortingUpdate: (
    sorting: AttributeSortingSpec[],
    questionName: string
  ) => void;
  requestColumnsChoiceUpdate: (columns: string[], questionName: string) => void;
  requestUpdateBasket: (
    operation: 'add' | 'remove',
    recordClass: string,
    primaryKeys: PrimaryKey[]
  ) => void;
  requestPageSizeUpdate: (pageSize: number) => void;
  viewPageNumber: (pageNumber: number) => void;
  showHideAddColumnsDialog: (show: boolean) => void;
  updateColumnsDialogSelection: (attributes: string[]) => void;
  updateColumnsDialogExpandedNodes: (nodes: string[]) => void;
  openAttributeAnalysis: (reporterName: string, stepId: number) => void;
  closeAttributeAnalysis: (reporterName: string, stepId: number) => void;
}

export default function ResultTableSummaryView({
  answer,
  activeAttributeAnalysisName,
  stepId,
  recordClass,
  question,
  currentPage,
  pageSize,
  basketStatusArray,
  requestColumnsChoiceUpdate,
  requestSortingUpdate,
  requestUpdateBasket,
  requestPageSizeUpdate,
  viewPageNumber,
  showHideAddColumnsDialog,
  columnsDialogExpandedNodes,
  columnsDialogIsOpen,
  columnsDialogSelection,
  columnsTree,
  updateColumnsDialogSelection,
  updateColumnsDialogExpandedNodes,
  openAttributeAnalysis,
  closeAttributeAnalysis,
}: Props) {
  return (
    <div className="ResultTableSummaryView">
      {answer && question && columnsTree &&
        <ResultTableAddColumnsDialog
          answer={answer}
          question={question}
          columnsDialogExpandedNodes={columnsDialogExpandedNodes}
          columnsDialogIsOpen={columnsDialogIsOpen}
          columnsDialogSelection={columnsDialogSelection}
          columnsTree={columnsTree}
          showHideAddColumnsDialog={showHideAddColumnsDialog}
          updateColumnsDialogExpandedNodes={updateColumnsDialogExpandedNodes}
          updateColumnsDialogSelection={updateColumnsDialogSelection}
          requestColumnsChoiceUpdate={requestColumnsChoiceUpdate}
        />
      }
      {answer && recordClass && question && currentPage && pageSize ? (
        <ResultTable
          answer={answer}
          activeAttributeAnalysisName={activeAttributeAnalysisName}
          stepId={stepId}
          question={question}
          recordClass={recordClass}
          basketStatusArray={basketStatusArray}
          requestColumnsChoiceUpdate={requestColumnsChoiceUpdate}
          requestSortingUpdate={requestSortingUpdate}
          requestUpdateBasket={requestUpdateBasket}
          pageSize={pageSize}
          currentPage={currentPage}
          requestPageSizeUpdate={requestPageSizeUpdate}
          viewPageNumber={viewPageNumber}
          showHideAddColumnsDialog={showHideAddColumnsDialog}
          openAttributeAnalysis={openAttributeAnalysis}
          closeAttributeAnalysis={closeAttributeAnalysis}
        />
      ) : null}
    </div>
  );
}
