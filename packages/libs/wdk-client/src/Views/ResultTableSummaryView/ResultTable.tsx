import { keyBy, union, difference } from 'lodash';
import React from 'react';
import {
  Answer,
  RecordClass,
  Question,
  AttributeSortingSpec,
  RecordInstance,
} from '../../Utils/WdkModel';
import { pure, wrappable } from '../../Utils/ComponentUtils';
import { Mesa, MesaState } from '../../Components/Mesa';
import Link from '../../Components/Link';
import BasketCell from '../../Views/ResultTableSummaryView/BasketCell';
import BasketHeading from '../../Views/ResultTableSummaryView/BasketHeading';
import PrimaryKeyCell from '../../Views/ResultTableSummaryView/PrimaryKeyCell';
import AttributeCell from '../../Views/ResultTableSummaryView/AttributeCell';
import AttributeHeading from '../../Views/ResultTableSummaryView/AttributeHeading';
import {
  Action,
  BasketStatusArray,
  RequestSortingUpdate,
  RequestColumnsChoiceUpdate,
  RequestUpdateBasket,
  RequestAddStepToBasket,
  ViewPageNumber,
  RequestPageSizeUpdate,
  ShowHideAddColumnsDialog,
  OpenAttributeAnalysis,
  CloseAttributeAnalysis,
  UpdateSelectedIds,
  ShowLoginWarning,
} from '../../Views/ResultTableSummaryView/Types';
import { ResultType } from '../../Utils/WdkResult';
import { IconAlt } from '../../Components';

export interface Props {
  resultType: ResultType;
  viewId: string;
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
  renderToolbarContent?: (props: ToolbarContentProps) => React.ReactNode;
}

export interface ToolbarContentProps {
  addColumnsNode: React.ReactNode;
  addToBasketNode: React.ReactNode;
  downloadLinkNode: React.ReactNode;
}

function ResultTable(props: Props) {
  const {
    answer,
    recordClass,
    resultType,
    showHideAddColumnsDialog,
    requestAddStepToBasket,
    actions,
    selectedIds,
    userIsGuest,
    showLoginWarning,
    renderToolbarContent = defaultRenderToolbarContent,
  } = props;
  const columns = getColumns(props);
  const rows = answer.records;
  const eventHandlers = getEventHandlers(props);
  const uiState = {
    sort:
      answer.meta.sorting.length > 0
        ? {
            columnKey: answer.meta.sorting[0].attributeName,
            direction: answer.meta.sorting[0].direction.toLowerCase(),
          }
        : undefined,
    pagination: {
      currentPage: Math.ceil(
        (answer.meta.pagination.offset + 1) / answer.meta.pagination.numRecords
      ),
      rowsPerPage: answer.meta.pagination.numRecords,
      totalRows: answer.meta.viewTotalCount,
    },
  };
  const selectedIdsSet = new Set(selectedIds);
  const options = {
    toolbar: true,
    useStickyHeader: true,
    tableBodyMaxHeight: 'calc(95vh - 200px)',
    isRowSelected: (recordInstance: RecordInstance) => {
      return selectedIdsSet.has(
        recordInstance.attributes[recordClass.recordIdAttributeName] as string
      );
    },
  };
  const tableState = MesaState.create({
    options,
    actions:
      actions &&
      actions.map((action) => ({
        selectionRequired: false,
        element: action.element,
      })),
    columns,
    rows,
    eventHandlers,
    uiState,
  });

  const downloadLink =
    resultType.type === 'step'
      ? `/step/${resultType.step.id}/download`
      : resultType.type === 'basket'
      ? `/workspace/basket/${resultType.basketName}/download`
      : undefined;

  const downloadLinkNode =
    downloadLink == null ? null : (
      <div className="ResultTableButton">
        <Link className="btn" to={downloadLink}>
          <IconAlt fa="download" /> Download
        </Link>
      </div>
    );

  const addToBasketNode =
    !recordClass.useBasket || resultType.type !== 'step' ? null : (
      <div className="ResultTableButton">
        <button
          type="button"
          className="btn"
          title={
            userIsGuest
              ? 'You must login to use baskets'
              : 'Add all records returned by this search to your basket'
          }
          onClick={() => {
            if (userIsGuest) showLoginWarning('use baskets');
            else requestAddStepToBasket(resultType.step.id);
          }}
        >
          <IconAlt fa="shopping-basket" /> Add to Basket
        </button>
      </div>
    );

  const addColumnsNode = (
    <div className="ResultTableButton">
      <button
        className="btn"
        type="button"
        onClick={() => showHideAddColumnsDialog(true)}
      >
        <IconAlt fa="cog" /> Add Columns
      </button>
    </div>
  );

  return (
    <Mesa state={tableState}>
      {renderToolbarContent({
        addColumnsNode,
        addToBasketNode,
        downloadLinkNode,
      })}
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
  function onSort(
    {
      key,
    }: {
      key: string;
    },
    direction: 'asc' | 'desc'
  ) {
    // Push new sorting onto current sorting array, and retain the first three resulting
    const newSort: AttributeSortingSpec[] = [
      {
        attributeName: key,
        direction: direction.toUpperCase() as 'ASC' | 'DESC',
      },
      ...answer.meta.sorting.filter((entry) => entry.attributeName !== key),
    ].slice(0, 3);
    requestSortingUpdate(newSort, question.urlSegment);
  }
  function onColumnReorder(attributeName: string, newIndex: number) {
    const tmpColumns = answer.meta.attributes.filter(
      (attrName) => attrName !== attributeName
    );
    // Subtract 1 from newIndex to compensate for basket column
    const shift =
      (recordClass.useBasket ? -1 : 0) + (showIdAttributeColumn ? 0 : 1);
    const targetIndex = newIndex + shift;
    const newColumns = [
      ...tmpColumns.slice(0, targetIndex),
      attributeName,
      ...tmpColumns.slice(targetIndex),
    ];
    requestColumnsChoiceUpdate(newColumns, question.urlSegment);
  }
  function onPageChange(newPage: number) {
    viewPageNumber(newPage);
  }
  function onRowsPerPageChange(newRowsPerPage: number) {
    requestPageSizeUpdate(newRowsPerPage);
    /*
      Calculates which page to set every time "Rows per page" is changed such that 
      the top row's data is included on the new page's render. This ensures that
      the user is in close proximity to whatever data they were previously viewing.
    */
    viewPageNumber(
      Math.ceil((answer.meta.pagination.offset + 1) / newRowsPerPage)
    );
  }
  function onRowSelect(row: RecordInstance) {
    onMultipleRowSelect([row]);
  }
  function onRowDeselect(row: RecordInstance) {
    onMultipleRowDeselect([row]);
  }
  function onMultipleRowSelect(rows: RecordInstance[]) {
    const ids = rows.map(
      (row) => row.attributes[recordClass.recordIdAttributeName] as string
    );
    updateSelectedIds(union(selectedIds, ids));
  }
  function onMultipleRowDeselect(rows: RecordInstance[]) {
    const ids = rows.map(
      (row) => row.attributes[recordClass.recordIdAttributeName] as string
    );
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
  };
  return actions
    ? { ...basicEventHandlers, ...selectionEventHandlers }
    : basicEventHandlers;
}

function getColumns({
  resultType,
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
    ...keyBy(question.dynamicAttributes, 'name'),
  };
  const basketColumn = {
    key: 'basket',
    className: 'BasketCell',
    sortable: false,
    moveable: false,
    renderCell: ({
      row,
      rowIndex,
    }: {
      row: RecordInstance;
      rowIndex: number;
    }) => (
      <BasketCell
        value={basketStatusArray ? basketStatusArray[rowIndex] : 'loading'}
        recordClassUrlSegment={recordClass.urlSegment}
        row={row}
        requestUpdateBasket={requestUpdateBasket}
        userIsGuest={userIsGuest}
        showLoginWarning={showLoginWarning}
      />
    ),
    renderHeading: () => null,
  };
  const answerColumns = answer.meta.attributes
    .filter((attrName) =>
      attrName === recordClass.recordIdAttributeName
        ? showIdAttributeColumn
        : true
    )
    .map((attrName) => attrsByName[attrName])
    .map((attribute) => ({
      key: attribute.name,
      sortable: attribute.isSortable,
      moveable:
        attribute.name !== recordClass.recordIdAttributeName &&
        attribute.isRemovable,
      helpText: attribute.help,
      name: attribute.displayName,
      renderCell: ({ row, key }: { row: RecordInstance; key: string }) =>
        key === recordClass.recordIdAttributeName ? (
          <PrimaryKeyCell recordClass={recordClass} recordInstance={row} />
        ) : (
          <AttributeCell recordInstance={row} attribute={attribute} />
        ),
      renderHeading: (
        column: never,
        columnIndex: number,
        headingComponents: {
          SortTrigger: React.ComponentType<any>;
          HelpTrigger: React.ComponentType<any>;
          ClickBoundary: React.ComponentType<any>;
        }
      ) => (
        <AttributeHeading
          resultType={resultType}
          activeAttributeAnalysisName={activeAttributeAnalysisName}
          attribute={attribute}
          question={question}
          recordClass={recordClass}
          headingComponents={headingComponents}
          openAttributeAnalysis={openAttributeAnalysis}
          closeAttributeAnalysis={closeAttributeAnalysis}
          removeAttribute={() => {
            requestColumnsChoiceUpdate(
              answer.meta.attributes.filter((a) => a !== attribute.name),
              question.urlSegment
            );
          }}
        />
      ),
    }));

  return recordClass.useBasket
    ? [basketColumn, ...answerColumns]
    : answerColumns;
}

function defaultRenderToolbarContent(props: ToolbarContentProps) {
  return (
    <>
      {props.downloadLinkNode}
      {props.addToBasketNode}
      {props.addColumnsNode}
    </>
  );
}
