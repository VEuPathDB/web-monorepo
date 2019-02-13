import { keyBy } from 'lodash';
import React from 'react';
import {
  Answer,
  RecordClass,
  Question,
  AttributeSortingSpec,
  PrimaryKey,
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

interface Props {
  stepId: number;
  activeAttributeAnalysisName: string | undefined;
  answer: Answer;
  recordClass: RecordClass;
  question: Question;
  basketStatusArray?: Array<'yes' | 'no' | 'loading'>;
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
  viewPageNumber: (pageNumber: number) => void;
  requestPageSizeUpdate: (pageSize: number) => void;
  showHideAddColumnsDialog: (show: boolean) => void;
  openAttributeAnalysis: (reporterName: string, stepId: number) => void;
  closeAttributeAnalysis: (reporterName: string, stepId: number) => void;
}

function ResultTable(props: Props) {
  const {
    answer,
    stepId,
    showHideAddColumnsDialog
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
  const options = {
    toolbar: true
  };
  const tableState = MesaState.create({
    options,
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
      <div className="ResultTableButton">
        <button type="button" className="wdk-Link" onClick={() => alert('TODO')}>
          Add to Basket
        </button>
      </div>
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
    const newColumns = [
      ...tmpColumns.slice(0, newIndex - 1),
      attributeName,
      ...tmpColumns.slice(newIndex - 1)
    ];
    requestColumnsChoiceUpdate(newColumns, question.name);
  }
  function onPageChange(newPage: number) {
    viewPageNumber(newPage);
  }
  function onRowsPerPageChange(newRowsPerPage: number) {
    requestPageSizeUpdate(newRowsPerPage);
  }
  const eventHandlers = {
    onSort,
    onColumnReorder,
    onPageChange,
    onRowsPerPageChange
  };
  return eventHandlers;
}

function getColumns({
  stepId,
  activeAttributeAnalysisName,
  answer,
  question,
  recordClass,
  basketStatusArray,
  requestUpdateBasket,
  requestColumnsChoiceUpdate,
  openAttributeAnalysis,
  closeAttributeAnalysis,
}: Props) {
  const attrsByName = {
    ...recordClass.attributesMap,
    ...keyBy(question.dynamicAttributes, 'name')
  };
  const basketColumn = {
    key: 'basket',
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
      />
    ),
    renderHeading: () => (
      <BasketHeading
        answer={answer}
        basketStatusArray={basketStatusArray}
        requestUpdateBasket={requestUpdateBasket}
      />
    )
  };
  const answerColumns = answer.meta.attributes
    .map(attrName => attrsByName[attrName])
    .map(attribute => ({
      key: attribute.name,
      sortable: attribute.isSortable,
      moveable: attribute.name !== recordClass.recordIdAttributeName,
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

  return [basketColumn, ...answerColumns];
}
