import { chunk, property, orderBy, toLower, uniqueId } from 'lodash';
import React, { Component } from 'react';
import { createSelector } from 'reselect';
import PropTypes from 'prop-types';
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
import {
  areTermsInStringRegexString,
  parseSearchQueryString,
} from '../../../Utils/SearchUtils';
import { ErrorBoundary } from '../../../Controllers';
import { stripHTML } from '../../../Utils/DomUtils';
import './RecordTable.css';

// NOTE: This is very hacky because the model is not reliably providing column or sort types
const mapSortType = (val) => {
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

const defaultSortId = '@@defaultSortIndex@@';
const defaultSortColumn = [{ name: defaultSortId, isDisplayable: false }];

const getSortIndex = (rowData) => rowData[defaultSortId];

const addDefaultSortId = (row, index) =>
  Object.assign({}, row, { [defaultSortId]: index });

const getColumns = (tableField) =>
  defaultSortColumn.concat(tableField.attributes.map((attr) => attr));

const getDisplayableAttributes = (tableField) =>
  tableField.attributes.filter((attr) => attr.isDisplayable);

const getOrderedData = (tableValue, tableField) =>
  orderBy(
    tableValue,
    tableField.clientSortSpec.map(property('itemName')),
    tableField.clientSortSpec.map(property('direction')).map(toLower)
  ).map(addDefaultSortId);

/**
 * Renders a record table
 */
class RecordTable extends Component {
  constructor(props) {
    super(props);
    this.getColumns = createSelector((props) => props.table, getColumns);
    this.getDisplayableAttributes = createSelector(
      (props) => props.table,
      getDisplayableAttributes
    );
    this.getOrderedData = createSelector(
      (props) => props.value,
      (props) => props.table,
      getOrderedData
    );
    this.onSort = this.onSort.bind(this);
    this.wrappedChildRow = this.wrappedChildRow.bind(this);
    this.state = {
      searchTerm: this.props.searchTerm ?? '',
      selectedColumnFilters: [],
      sort: { columnKey: undefined, direction: 'desc' },
    };
  }

  onSort(column, direction) {
    const columnKey = column.key;
    this.setState((state) => ({ ...state, sort: { columnKey, direction } }));
  }

  wrappedChildRow(rowIndex, rowData) {
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

  render() {
    const { value, childRow, expandedRows, onExpandedRowsChange, className } =
      this.props;
    const { sort } = this.state;
    const displayableAttributes = this.getDisplayableAttributes(this.props);
    const columns = this.getColumns(this.props);
    const data = this.getOrderedData(this.props);
    const isOrthologTableWithData =
      this.props.table.name === 'Orthologs' && value.length > 0;
    const clustalInputRow = isOrthologTableWithData
      ? columns.find((c) => c.name === 'clustalInput')
      : undefined;

    // Manipulate columns to match properties expected in Mesa
    const mesaReadyColumns = columns
      .filter((c) => c.isDisplayable)
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
              ? nonNullDataObject[name]['displayText']
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
    const mesaReadyRows = data.map((d) => {
      let newData = { ...d };
      const columnsWithLinks = mesaReadyColumns.filter(
        (c) => c.key in d && 'type' in c && c.type === 'link'
      );
      columnsWithLinks.forEach((col) => {
        const linkPropertyName = col.key;
        const linkObject = d[linkPropertyName];
        newData = {
          ...newData,
          [linkPropertyName]: {
            href: linkObject?.url ?? '',
            text: linkObject?.displayText ?? '',
          },
        };
      });
      return newData;
    });

    const columnToSort = mesaReadyColumns.find(
      (c) => c.key === sort?.columnKey
    );
    const sortType = columnToSort?.sortType ?? 'text';

    const preSortedMesaRows =
      sort?.columnKey == null
        ? mesaReadyRows
        : orderBy(
            mesaReadyRows,
            (row) => {
              const { columnKey } = sort;
              const isLinkType = columnToSort.type === 'link';
              if (sortType === 'number' && isLinkType) {
                return row[columnKey]['text'] === ''
                  ? -Infinity
                  : Number(row[columnKey]['text']);
              }
              if (sortType === 'number') {
                return row[columnKey] == null
                  ? -Infinity
                  : Number(row[columnKey]);
              }
              if (columnToSort.type === 'link') {
                return row[columnKey]['text'];
              }
              if (sortType === 'htmlText') {
                return stripHTML(row[columnKey]).toLowerCase().trim();
              }
              return row[columnKey] == null
                ? ''
                : row[columnKey].toLowerCase().trim();
            },
            [sort.direction]
          );

    const sortedMesaRows =
      isOrthologTableWithData && this.props.orthoTableProps.groupBySelected
        ? preSortedMesaRows.sort((a, b) => {
            const aSelected =
              this.props.orthoTableProps.options.isRowSelected(a);
            const bSelected =
              this.props.orthoTableProps.options.isRowSelected(b);
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
    const filteredRows = sortedMesaRows.filter((row) => {
      return searchableAttributes.some((attr) => regex.test(row[attr.name]));
    });

    const tableState = {
      rows: sortedMesaRows,
      columns: mesaReadyColumns,
      filteredRows: this.state.searchTerm.length ? filteredRows : undefined,
      eventHandlers: {
        onSort: this.onSort,
        onExpandedRowsChange,
        ...(isOrthologTableWithData
          ? { ...this.props.orthoTableProps.eventHandlers }
          : {}),
      },
      uiState: {
        sort: this.state.sort,
        expandedRows,
        filteredRowCount: mesaReadyRows.length - filteredRows.length,
        ...(isOrthologTableWithData
          ? { groupBySelected: this.props.orthoTableProps.groupBySelected }
          : {}),
      },
      options: {
        toolbar: isOrthologTableWithData ? false : true,
        childRow: childRow ? this.wrappedChildRow : undefined,
        className: 'wdk-DataTableContainer',
        getRowId: getSortIndex,
        showCount: mesaReadyRows.length > 1,
        ...(isOrthologTableWithData
          ? {
              ...this.props.orthoTableProps.options,
              selectColumnHeadingDetails: {
                heading: clustalInputRow.displayName,
                helpText: clustalInputRow.help,
              },
            }
          : {}),
      },
      ...(isOrthologTableWithData
        ? {
            actions: this.props.orthoTableProps.actions,
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
          {mesaReadyRows.length > 1 && (
            <RecordFilter
              searchTerm={this.state.searchTerm}
              onSearchTermChange={(searchTerm) =>
                this.setState((state) => ({
                  ...state,
                  searchTerm,
                }))
              }
              recordDisplayName={this.props.recordClass.displayNamePlural}
              filterAttributes={displayableAttributes.map((attr) => ({
                value: attr.name,
                display: attr.displayName,
              }))}
              selectedColumnFilters={this.state.selectedColumnFilters}
              onColumnFilterChange={(value) =>
                this.setState((state) => ({
                  ...state,
                  selectedColumnFilters: value,
                }))
              }
            />
          )}
        </Mesa>
      </div>
    );
  }
}

RecordTable.propTypes = {
  value: PropTypes.array.isRequired,
  table: PropTypes.object.isRequired,
  childRow: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  expandedRows: PropTypes.arrayOf(PropTypes.number),
  onExpandedRowsChange: PropTypes.func,
  className: PropTypes.string,
  onDraw: PropTypes.func,
  searchTerm: PropTypes.string,
  onSearchTermChange: PropTypes.func,
};

export default wrappable(pure(RecordTable));
