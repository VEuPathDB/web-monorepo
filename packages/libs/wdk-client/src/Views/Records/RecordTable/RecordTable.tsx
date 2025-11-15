import { chunk, property, orderBy, toLower, uniqueId } from 'lodash';
import React, { Component, ReactNode } from 'react';
import { createSelector, Selector } from 'reselect';
import { RecordFilter } from './RecordFilter';
import {
  renderAttributeValue,
  pure,
  wrappable,
  safeHtml,
} from '../../../Utils/ComponentUtils';
import {
  Mesa,
  Utils as MesaUtils,
} from '@veupathdb/coreui/lib/components/Mesa';
import type {
  MesaColumn,
  MesaStateProps,
} from '@veupathdb/coreui/lib/components/Mesa/types';
import {
  areTermsInStringRegexString,
  parseSearchQueryString,
} from '../../../Utils/SearchUtils';
import { ErrorBoundary } from '../../../Controllers';
import { stripHTML } from '../../../Utils/DomUtils';
import {
  TableField,
  RecordClass,
  AttributeField,
  AttributeValue,
  LinkAttributeValue,
} from '../../../Utils/WdkModel';
import './RecordTable.css';

// NOTE: This is very hacky because the model is not reliably providing column or sort types
const mapSortType = (val: any): string => {
  if (!isNaN(parseFloat(val)) && isFinite(val)) {
    return 'number';
  }
  if (MesaUtils.isHtml(val)) {
    return 'htmlText';
  }
  return 'text';
};

// max columns for list mode
const maxColumns = 4;

const getColumns = (tableField: TableField): AttributeField[] =>
  tableField.attributes.map((attr) => attr);

const getDisplayableAttributes = (tableField: TableField): AttributeField[] =>
  tableField.attributes.filter((attr) => attr.isDisplayable);

interface SortItem {
  itemName: string;
  direction: string;
}

// Enhanced TableField with clientSortSpec property at runtime
interface TableFieldWithSort extends TableField {
  clientSortSpec?: SortItem[];
}

const getOrderedData = (
  tableValue: Record<string, AttributeValue>[],
  tableField: TableFieldWithSort,
  sortIndexMap: WeakMap<Record<string, AttributeValue>, number>
): Record<string, AttributeValue>[] => {
  const orderedRows = orderBy(
    tableValue,
    tableField.clientSortSpec?.map((spec) => spec.itemName) ?? [],
    (tableField.clientSortSpec?.map((spec) => spec.direction.toLowerCase()) ??
      []) as ('asc' | 'desc')[]
  );

  // Store sort indices in WeakMap without mutating row objects
  orderedRows.forEach((row, index) => {
    sortIndexMap.set(row, index);
  });

  return orderedRows;
};

// Extended MesaColumn to include sortType property used in RecordTable
interface RecordTableColumn extends MesaColumn<Record<string, AttributeValue>> {
  sortType?: string;
}

interface SortState {
  columnKey?: string;
  direction: string;
}

interface RecordTableState {
  searchTerm: string;
  selectedColumnFilters: string[];
  sort: SortState;
}

interface OrthoTableOptions {
  isRowSelected: (row: any) => boolean;
  [key: string]: any;
}

interface OrthoTableEventHandlers {
  [key: string]: any;
}

interface OrthoTableProps {
  groupBySelected?: boolean;
  options: OrthoTableOptions & any;
  eventHandlers: OrthoTableEventHandlers;
  actions?: any;
}

interface RecordTableProps {
  value: Record<string, AttributeValue>[];
  table: TableFieldWithSort;
  childRow?: string | React.ComponentType<{ rowIndex: number; rowData: any }>;
  expandedRows?: number[];
  onExpandedRowsChange?: (rows: number[]) => void;
  className?: string;
  onDraw?: () => void;
  searchTerm?: string;
  onSearchTermChange?: (searchTerm: string) => void;
  record?: any;
  recordClass: RecordClass;
  ontologyProperties?: any;
  orthoTableProps?: OrthoTableProps;
}

/**
 * Renders a record table
 */
class RecordTable extends Component<RecordTableProps, RecordTableState> {
  private sortIndexMap: WeakMap<Record<string, AttributeValue>, number>;
  private getColumns: Selector<RecordTableProps, AttributeField[]>;
  private getDisplayableAttributes: Selector<
    RecordTableProps,
    AttributeField[]
  >;
  private getOrderedData: Selector<
    RecordTableProps,
    Record<string, AttributeValue>[]
  >;

  constructor(props: RecordTableProps) {
    super(props);
    // Instance-level WeakMap to store sort indices without mutating row objects
    this.sortIndexMap = new WeakMap();

    this.getColumns = createSelector(
      (props: RecordTableProps) => props.table,
      getColumns
    );
    this.getDisplayableAttributes = createSelector(
      (props: RecordTableProps) => props.table,
      getDisplayableAttributes
    );
    this.getOrderedData = createSelector(
      (props: RecordTableProps) => props.value,
      (props: RecordTableProps) => props.table,
      (tableValue, tableField) =>
        getOrderedData(tableValue, tableField, this.sortIndexMap)
    );
    this.onSort = this.onSort.bind(this);
    this.onSearchTermChange = this.onSearchTermChange.bind(this);
    this.onColumnFilterChange = this.onColumnFilterChange.bind(this);
    this.wrappedChildRow = this.wrappedChildRow.bind(this);
    this.state = {
      searchTerm: this.props.searchTerm ?? '',
      selectedColumnFilters: [],
      sort: { columnKey: undefined, direction: 'desc' },
    };
  }

  onSort(
    column: MesaColumn<Record<string, AttributeValue>>,
    direction: string
  ): void {
    const columnKey = column.key as string;
    this.setState((state) => ({ ...state, sort: { columnKey, direction } }));
  }

  onSearchTermChange(searchTerm: string): void {
    this.setState((state) => ({
      ...state,
      searchTerm,
    }));
  }

  onColumnFilterChange(selectedColumnFilters: string[]): void {
    this.setState((state) => ({
      ...state,
      selectedColumnFilters,
    }));
  }

  wrappedChildRow(
    rowIndex: number,
    rowData: Record<string, AttributeValue>
  ): ReactNode {
    const { childRow: ChildRow } = this.props;
    if (!ChildRow) return;
    const content =
      typeof ChildRow === 'string' ? (
        safeHtml(ChildRow)
      ) : (
        <ChildRow rowIndex={rowIndex} rowData={rowData} />
      );
    return (
      <div id={`DataTableChildRow${uniqueId()}`}>
        <ErrorBoundary
          renderError={() => <h3>We're sorry, something went wrong.</h3>}
        >
          {content}
        </ErrorBoundary>
      </div>
    );
  }

  render(): ReactNode {
    const { value, childRow, expandedRows, onExpandedRowsChange, className } =
      this.props;
    const { sort } = this.state;
    const displayableAttributes = this.getDisplayableAttributes(this.props);
    const columns = this.getColumns(this.props);
    const data = this.getOrderedData(this.props);
    const isOrthologTableWithData =
      this.props.orthoTableProps != null && value.length > 0;
    const clustalInputRow = isOrthologTableWithData
      ? columns.find((c) => c.name === 'clustalInput')
      : undefined;

    // Manipulate columns to match properties expected in Mesa
    const mesaReadyColumns: RecordTableColumn[] = columns
      // NOTE: prefer to change ortho's clustalInput columns to not be displayable
      .filter((c) => c.isDisplayable && c.name !== 'clustalInput')
      .map((c) => {
        const {
          name,
          displayName,
          isSortable,
          type,
          help,
          ...remainingProperties
        } = c;
        /**
         * NOTE: This is very hacky because the model is not reliably providing column or sort types
         *
         * It's possible that the first "nonNullDataObject" found could misrepresent the actual sort type
         * of the data.
         */
        const nonNullDataObject = data.find((d) => d[name] != null);
        const nonNullDataValue =
          nonNullDataObject != null
            ? type === 'link'
              ? typeof nonNullDataObject[name] === 'object' &&
                nonNullDataObject[name] !== null &&
                typeof nonNullDataObject[name] === 'object' &&
                'displayText' in (nonNullDataObject[name] as object)
                ? (nonNullDataObject[name] as { displayText?: string })
                    .displayText
                : ''
              : nonNullDataObject[name]
            : undefined;
        const sortType =
          isSortable && nonNullDataValue && name !== 'thumbnail'
            ? mapSortType(nonNullDataValue ?? '')
            : undefined;
        return {
          ...remainingProperties,
          key: name,
          name: displayName,
          sortable: isSortable,
          type: type ?? 'html',
          helpText: help,
          sortType,
          ...(name === 'thumbnail'
            ? {
                className: 'wdk-DataTableCell__thumbnail',
              }
            : null),
        };
      });

    // Manipulate rows to match Mesa properties; this really only pertains to the
    // link properties that differ between DataTable and Mesa
    const mesaReadyRows: Record<string, any>[] = data.map((d, index) => {
      const columnsWithLinks = mesaReadyColumns.filter(
        (c) => c.key in d && 'type' in c && c.type === 'link'
      );

      // Only create new object if there are link columns to process
      if (columnsWithLinks.length === 0) {
        return d; // Return original object unchanged
      }

      let newData: Record<string, any> = { ...d };
      columnsWithLinks.forEach((col) => {
        const linkPropertyName = col.key;
        const linkObject = d[linkPropertyName] as LinkAttributeValue | null;
        newData = {
          ...newData,
          [linkPropertyName]: {
            href: linkObject?.url ?? '',
            text: linkObject?.displayText ?? '',
          },
        };
      });
      this.sortIndexMap.set(newData, index);
      return newData;
    });

    const columnToSort = mesaReadyColumns.find(
      (c) => c.key === sort?.columnKey
    );
    const sortType = columnToSort?.sortType ?? 'text';

    const preSortedMesaRows: Record<string, any>[] =
      sort?.columnKey == null
        ? mesaReadyRows
        : orderBy(
            mesaReadyRows,
            (row) => {
              const { columnKey } = sort;
              const isLinkType = columnToSort!.type === 'link';
              if (sortType === 'number' && isLinkType) {
                return row[columnKey!]['text'] === ''
                  ? -Infinity
                  : Number(row[columnKey!]['text']);
              }
              if (sortType === 'number') {
                return row[columnKey!] == null
                  ? -Infinity
                  : Number(row[columnKey!]);
              }
              if (columnToSort!.type === 'link') {
                return row[columnKey!]['text'];
              }
              if (sortType === 'htmlText') {
                return stripHTML(row[columnKey!]).toLowerCase().trim();
              }
              return row[columnKey!] == null
                ? ''
                : row[columnKey!].toLowerCase().trim();
            },
            [sort.direction.toLowerCase() as 'asc' | 'desc']
          );

    const sortedMesaRows: Record<string, any>[] =
      isOrthologTableWithData && this.props.orthoTableProps!.groupBySelected
        ? preSortedMesaRows.sort((a, b) => {
            const aSelected =
              this.props.orthoTableProps!.options.isRowSelected(a);
            const bSelected =
              this.props.orthoTableProps!.options.isRowSelected(b);
            return aSelected && bSelected
              ? 0
              : aSelected
              ? -1
              : bSelected
              ? 1
              : 0;
          })
        : preSortedMesaRows;

    const queryTerms = parseSearchQueryString(this.state.searchTerm);
    const searchTermRegex = areTermsInStringRegexString(queryTerms);
    const regex = new RegExp(searchTermRegex, 'i');
    const searchableAttributes = this.state.selectedColumnFilters.length
      ? displayableAttributes.filter((attr) =>
          this.state.selectedColumnFilters.includes(attr.name)
        )
      : displayableAttributes;
    const filteredRows: Record<string, any>[] = sortedMesaRows.filter((row) => {
      return searchableAttributes.some((attr) => {
        const value = row[attr.name];
        const searchValue =
          typeof value === 'object' && value !== null && 'text' in value
            ? (value as { text: string }).text
            : value;
        return regex.test(searchValue);
      });
    });

    const tableState: MesaStateProps<Record<string, AttributeValue>, string> = {
      rows: sortedMesaRows,
      columns: mesaReadyColumns as MesaColumn<
        Record<string, AttributeValue>,
        string
      >[],
      filteredRows: this.state.searchTerm.length ? filteredRows : undefined,
      eventHandlers: {
        onSort: this.onSort,
        onExpandedRowsChange: onExpandedRowsChange as any,
        ...(isOrthologTableWithData
          ? { ...this.props.orthoTableProps!.eventHandlers }
          : {}),
      },
      uiState: {
        sort: {
          columnKey: this.state.sort.columnKey ?? '',
          direction: this.state.sort.direction as 'asc' | 'desc',
        },
        expandedRows,
        filteredRowCount: mesaReadyRows.length - filteredRows.length,
        ...(isOrthologTableWithData &&
        this.props.orthoTableProps!.groupBySelected != null
          ? { groupBySelected: this.props.orthoTableProps!.groupBySelected }
          : {}),
      },
      options: {
        toolbar: isOrthologTableWithData ? false : true,
        childRow: childRow ? this.wrappedChildRow : undefined,
        className: 'wdk-DataTableContainer',
        getRowId: (rowData: Record<string, any>) =>
          this.sortIndexMap.get(rowData),
        showCount: mesaReadyRows.length > 2,
        ...(isOrthologTableWithData
          ? {
              ...this.props.orthoTableProps!.options,
              selectColumnHeadingDetails: {
                heading: clustalInputRow!.displayName,
                helpText: clustalInputRow!.help,
              },
            }
          : {}),
      },
      ...(isOrthologTableWithData
        ? {
            actions: this.props.orthoTableProps!.actions,
          }
        : {}),
    };

    if (value.length === 0 || columns.length === 0) {
      return (
        <p>
          <em>No data available</em>
        </p>
      );
    }

    if (displayableAttributes.length === 1) {
      let listColumnSize = Math.max(10, value.length / maxColumns);
      let attributeName = displayableAttributes[0].name;
      return (
        <div className={className}>
          {chunk(value, listColumnSize).map((tableChunk, index) => (
            <ul key={index} className="wdk-RecordTableList">
              {tableChunk.map((row, index) => (
                <li key={index}>{renderAttributeValue(row[attributeName])}</li>
              ))}
            </ul>
          ))}
        </div>
      );
    }

    return (
      <div className={className}>
        <Mesa state={tableState}>
          {mesaReadyRows.length > 2 && (
            <RecordFilter
              searchTerm={this.state.searchTerm}
              onSearchTermChange={this.onSearchTermChange}
              recordDisplayName={this.props.recordClass.displayNamePlural}
              filterAttributes={displayableAttributes.map((attr) => ({
                value: attr.name,
                display: attr.displayName,
              }))}
              selectedColumnFilters={this.state.selectedColumnFilters}
              onColumnFilterChange={this.onColumnFilterChange}
            />
          )}
        </Mesa>
      </div>
    );
  }
}

export default wrappable(pure(RecordTable as any));
