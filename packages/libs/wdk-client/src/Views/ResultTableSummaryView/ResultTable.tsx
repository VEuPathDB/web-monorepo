import { keyBy, union, difference } from 'lodash';
import React from 'react';
import {
  Answer,
  RecordClass,
  Question,
  AttributeSortingSpec,
  RecordInstance
} from 'wdk-client/Utils/WdkModel';
import { pure, wrappable } from 'wdk-client/Utils/ComponentUtils';
import { Mesa, MesaState } from 'wdk-client/Components/Mesa';
import Link from 'wdk-client/Components/Link';
import BasketCell from 'wdk-client/Views/ResultTableSummaryView/BasketCell';
import BasketHeading from 'wdk-client/Views/ResultTableSummaryView/BasketHeading';
import PrimaryKeyCell from 'wdk-client/Views/ResultTableSummaryView/PrimaryKeyCell';
import AttributeCell from 'wdk-client/Views/ResultTableSummaryView/AttributeCell';
import AttributeHeading from 'wdk-client/Views/ResultTableSummaryView/AttributeHeading';
import { Action, BasketStatusArray, RequestSortingUpdate, RequestColumnsChoiceUpdate, RequestUpdateBasket, RequestAddStepToBasket, ViewPageNumber, RequestPageSizeUpdate, ShowHideAddColumnsDialog, OpenAttributeAnalysis, CloseAttributeAnalysis, UpdateSelectedIds, ShowLoginWarning } from 'wdk-client/Views/ResultTableSummaryView/Types';


export interface Props {
  stepId: number;
  actions?: Action[];
  selectedIds?: string[];
  showIdAttributeColumn: boolean;
  activeAttributeAnalysisName: string | undefined;
  answer: Answer;
  recordClass: RecordClass;
  question: Question;
  userIsGuest: boolean;
  basketStatusArray?: BasketStatusArray;
  requestSortingUpdate: RequestSortingUpdate;
  requestColumnsChoiceUpdate: RequestColumnsChoiceUpdate;
  requestUpdateBasket: RequestUpdateBasket;
  requestAddStepToBasket: RequestAddStepToBasket;
  viewPageNumber: ViewPageNumber;
  requestPageSizeUpdate: RequestPageSizeUpdate;
  showHideAddColumnsDialog: ShowHideAddColumnsDialog;
  openAttributeAnalysis: OpenAttributeAnalysis;
  closeAttributeAnalysis: CloseAttributeAnalysis;
  updateSelectedIds: UpdateSelectedIds;
  showLoginWarning: ShowLoginWarning;
}

function ResultTable(props: Props) {
  const {
    answer,
    recordClass,
    stepId,
    showHideAddColumnsDialog,
    requestAddStepToBasket,
    actions,
    selectedIds,
    userIsGuest,
    showLoginWarning
  } = props;
  const columns = getColumns(props);
  const rows = answer.records;
  const eventHandlers = getEventHandlers(props);
  const uiState = {
    sort: {
      columnKey: answer.meta.sorting[0].attributeName,
      direction: answer.meta.sorting[0].direction.toLowerCase()
    },
    pagination: {
      currentPage: Math.ceil((answer.meta.pagination.offset + 1) / answer.meta.pagination.numRecords),
      rowsPerPage: answer.meta.pagination.numRecords,
      totalRows: answer.meta.totalCount
    }
  };
  const selectedIdsSet = new Set(selectedIds);
  const options = {
    toolbar: true,
    isRowSelected: (recordInstance: RecordInstance) => {
      return selectedIdsSet.has(recordInstance.attributes[recordClass.recordIdAttributeName] as string);
    }
  };
  const tableState = MesaState.create({
    options,
    actions: actions && actions.map(action => ({
      selectionRequired: false,
      element: action.element,
    })),
    columns,
    rows,
    eventHandlers,
    uiState
  });
  return (
    <Mesa state={tableState}>
      <div className="ResultTableButton">
        <Link to={`/step/${stepId}/download`}>Download</Link>
      </div>
      {!recordClass.useBasket ? null :
        <div className="ResultTableButton">
          <button type="button"
            className="wdk-Link"
            title={userIsGuest ? 'You must login to use baskets' : 'Add all records returned by this search to your basket'}
            onClick={() => {
              if (userIsGuest) showLoginWarning('use baskets');
              else requestAddStepToBasket(stepId)
            }}>
            Add to Basket
          </button>
        </div>
      }
      <div className="ResultTableButton">
        <button className="btn" type="button" onClick={() => showHideAddColumnsDialog(true)}>
          Add Columns
        </button>
      </div>
    </Mesa>
  );
}

export default wrappable(pure(ResultTable));

function getEventHandlers(props: Props) {
  const {
    answer,
    recordClass,
    actions,
    selectedIds,
    updateSelectedIds,
    showIdAttributeColumn,
    question,
    requestSortingUpdate,
    requestColumnsChoiceUpdate,
    requestPageSizeUpdate,
    viewPageNumber,
  } = props;
  function onSort({ key }: {
    key: string;
  }, direction: 'asc' | 'desc') {
    // Push new sorting onto current sorting array, and retain the first three resulting
    const newSort: AttributeSortingSpec[] = [
      {
        attributeName: key,
        direction: direction.toUpperCase() as 'ASC' | 'DESC'
      },
      ...answer.meta.sorting.filter(entry => entry.attributeName !== key)
    ].slice(0, 3);
    requestSortingUpdate(newSort, question.name);
  }
  function onColumnReorder(attributeName: string, newIndex: number) {
    const tmpColumns = answer.meta.attributes.filter(attrName => attrName !== attributeName);
    // Subtract 1 from newIndex to compensate for basket column
    const shift = (recordClass.useBasket ? -1 : 0) + (showIdAttributeColumn ? 0 : 1);
    const targetIndex = newIndex + shift;
    const newColumns = [
      ...tmpColumns.slice(0, targetIndex),
      attributeName,
      ...tmpColumns.slice(targetIndex)
    ];
    requestColumnsChoiceUpdate(newColumns, question.name);
  }
  function onPageChange(newPage: number) {
    viewPageNumber(newPage);
  }
  function onRowsPerPageChange(newRowsPerPage: number) {
    requestPageSizeUpdate(newRowsPerPage);
  }
  function onRowSelect(row: RecordInstance) {
    onMultipleRowSelect([row]);
  }
  function onRowDeselect(row: RecordInstance) {
    onMultipleRowDeselect([row]);
  }
  function onMultipleRowSelect(rows: RecordInstance[]) {
    const ids = rows.map(row => row.attributes[recordClass.recordIdAttributeName] as string);
    updateSelectedIds(union(selectedIds, ids));
  }
  function onMultipleRowDeselect(rows: RecordInstance[]) {
    const ids = rows.map(row => row.attributes[recordClass.recordIdAttributeName] as string);
    updateSelectedIds(difference(selectedIds, ids));
  }

  const basicEventHandlers = {
    onSort,
    onColumnReorder,
    onPageChange,
    onRowsPerPageChange,
  };
  const selectionEventHandlers = {
    onRowSelect,
    onRowDeselect,
    onMultipleRowSelect,
    onMultipleRowDeselect,
  }
  return actions ? { ...basicEventHandlers, ...selectionEventHandlers } : basicEventHandlers;
}

function getColumns({
  stepId,
  activeAttributeAnalysisName,
  showIdAttributeColumn,
  answer,
  question,
  recordClass,
  userIsGuest,
  basketStatusArray,
  requestUpdateBasket,
  requestColumnsChoiceUpdate,
  openAttributeAnalysis,
  closeAttributeAnalysis,
  showLoginWarning,
}: Props) {
  const attrsByName = {
    ...recordClass.attributesMap,
    ...keyBy(question.dynamicAttributes, 'name')
  };
  const basketColumn = {
    key: 'basket',
    className: 'BasketCell',
    sortable: false,
    moveable: false,
    renderCell: ({
      row,
      rowIndex
    }: {
      row: RecordInstance;
      rowIndex: number;
    }) => (
      <BasketCell
        value={basketStatusArray ? basketStatusArray[rowIndex] : 'loading'}
        row={row}
        requestUpdateBasket={requestUpdateBasket}
        userIsGuest={userIsGuest}
        showLoginWarning={showLoginWarning}
      />
    ),
    renderHeading: () => (
      <BasketHeading
        answer={answer}
        basketStatusArray={basketStatusArray}
        requestUpdateBasket={requestUpdateBasket}
        userIsGuest={userIsGuest}
        showLoginWarning={showLoginWarning}
      />
    )
  };
  const answerColumns = answer.meta.attributes
    .filter(attrName => attrName === recordClass.recordIdAttributeName
      ? showIdAttributeColumn : true)
    .map(attrName => attrsByName[attrName])
    .map(attribute => ({
      key: attribute.name,
      sortable: attribute.isSortable,
      moveable: attribute.name !== recordClass.recordIdAttributeName && attribute.isRemovable,
      helpText: attribute.help,
      name: attribute.displayName,
      renderCell: ({ row, key }: { row: RecordInstance; key: string }) =>
        key === recordClass.recordIdAttributeName ? (
          <PrimaryKeyCell recordClass={recordClass} recordInstance={row} />
        ) : (
          <AttributeCell recordInstance={row} attribute={attribute} />
        ),
      renderHeading: (column: never, columnIndex: number, headingComponents: {
        SortTrigger: React.ComponentType<any>,
        HelpTrigger: React.ComponentType<any>,
        ClickBoundary: React.ComponentType<any>
      }) => (
        <AttributeHeading
          stepId={stepId}
          activeAttributeAnalysisName={activeAttributeAnalysisName}
          attribute={attribute}
          question={question}
          recordClass={recordClass}
          headingComponents={headingComponents}
          openAttributeAnalysis={openAttributeAnalysis}
          closeAttributeAnalysis={closeAttributeAnalysis}
          removeAttribute={() => {
            requestColumnsChoiceUpdate(answer.meta.attributes.filter(a => a !== attribute.name), question.name)
          }}
        />
      )
    }));

  return recordClass.useBasket ? [basketColumn, ...answerColumns] : answerColumns;
}
