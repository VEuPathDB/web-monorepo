import { chunk, property, orderBy, toLower, uniqueId } from 'lodash';
import React, { Component, useCallback, useState } from 'react';
import { createSelector } from 'reselect';
import PropTypes from 'prop-types';
import DataTable, {
  DataTableFilterSelector,
} from '../../../Components/DataTable/DataTable';
import {
  renderAttributeValue,
  pure,
  wrappable,
  safeHtml,
} from '../../../Utils/ComponentUtils';
import { Mesa, MesaState } from '@veupathdb/coreui/lib/components/Mesa';
import './RecordTable.css';
import { HelpIcon, RealTimeSearchBox } from '../../../Components';
import { Tooltip } from '@veupathdb/components/lib/components/widgets/Tooltip';
import {
  areTermsInStringRegexString,
  parseSearchQueryString,
} from '../../../Utils/SearchUtils';
import { ErrorBoundary } from '../../../Controllers';

const mapAttributeType = (type) => {
  switch (type) {
    case 'number':
      return 'num';
    default:
      return undefined;
  }
};

// max columns for list mode
const maxColumns = 4;

const defaultSortId = '@@defaultSortIndex@@';
const defaultSortColumn = [{ name: defaultSortId, isDisplayable: false }];

const getSortIndex = (rowData) => rowData[defaultSortId];

const addDefaultSortId = (row, index) =>
  Object.assign({}, row, { [defaultSortId]: index });

const getColumns = (tableField) =>
  defaultSortColumn.concat(
    tableField.attributes.map((attr) => ({
      ...attr,
      sortType: mapAttributeType(attr.type),
    }))
  );

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
    };
  }

  onSort(column, direction) {
    const key = column.key;
    console.log({ column, key, direction });
  }

  wrappedChildRow(rowIndex, rowData) {
    const { childRow: ChildRow } = this.props;
    if (!ChildRow) return;
    const content =
      typeof ChildRow === 'string' ? (
        safeHtml(ChildRow)
      ) : typeof ChildRow === 'function' ? (
        ChildRow({ rowIndex, rowData })
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
    const {
      value,
      childRow,
      expandedRows,
      onExpandedRowsChange,
      className,
      onDraw,
      searchTerm,
      onSearchTermChange,
    } = this.props;
    const displayableAttributes = this.getDisplayableAttributes(this.props);
    const columns = this.getColumns(this.props);
    const data = this.getOrderedData(this.props);

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
        return {
          ...remainingProperties,
          key: name,
          name: displayName,
          sortable: isSortable,
          type: type ?? 'html',
          helpText: help,
          ...(name === 'thumbnail'
            ? {
                className: 'wdk-DataTableCell__thumbnail',
              }
            : null),
        };
      });

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

    const queryTerms = parseSearchQueryString(this.state.searchTerm);
    const searchTermRegex = areTermsInStringRegexString(queryTerms);
    const regex = new RegExp(searchTermRegex, 'i');
    const searchableAttributes = this.state.selectedColumnFilters.length
      ? displayableAttributes.filter((attr) =>
          this.state.selectedColumnFilters.includes(attr.name)
        )
      : displayableAttributes;
    const filteredRows = mesaReadyRows.filter((row) => {
      return searchableAttributes.some((attr) => regex.test(row[attr.name]));
    });

    const tableState = {
      rows: mesaReadyRows,
      columns: mesaReadyColumns,
      filteredRows: this.state.searchTerm.length ? filteredRows : undefined,
      eventHandlers: {
        onSort: this.onSort,
        onExpandedRowsChange,
      },
      uiState: {
        sort: {
          columnKey: undefined,
          direction: 'desc',
        },
        expandedRows,
      },
      options: {
        toolbar: true,
        childRow: childRow ? this.wrappedChildRow : undefined,
      },
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
        {/* <DataTable
          searchTerm={searchTerm}
          onSearchTermChange={onSearchTermChange}
          getRowId={getSortIndex}
          expandedRows={expandedRows}
          onExpandedRowsChange={onExpandedRowsChange}
          columns={columns}
          data={data}
          childRow={childRow}
          searchable={value.length > 1}
          onDraw={onDraw}
        /> */}
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

function RecordFilter(props) {
  const [showFieldSelector, setShowFieldSelector] = useState(false);

  const toggleFilterFieldSelector = useCallback(
    () => setShowFieldSelector(!showFieldSelector),
    [showFieldSelector, setShowFieldSelector]
  );

  return (
    <>
      <div style={{ display: 'flex' }}>
        <RealTimeSearchBox
          searchTerm={props.searchTerm}
          className="wdk-DataTableSearchBox"
          placeholderText="Search this table..."
          onSearchTermChange={props.onSearchTermChange}
          delayMs={0}
          iconName=""
          cancelBtnRightMargin="3em"
        />
        <div
          style={{
            position: 'relative',
            width: 0,
            right: '2.75em',
            top: '0.25em',
          }}
        >
          <Tooltip title="Show search fields">
            <button
              className="fa fa-caret-down"
              style={{ background: 'none', border: 'none' }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFilterFieldSelector();
              }}
            />
          </Tooltip>
        </div>
        <HelpIcon>
          <div>
            <ul>
              <li>
                The {props.recordDisplayName} in your refined list will contain
                ALL your terms (or phrases, when using double quotes), in ANY of
                the selected fields.
              </li>
              <li>
                Click on the arrow inside the box to select/unselect fields.{' '}
              </li>
              <li>
                Your terms are matched at the start; for example, the term{' '}
                <i>typ</i> will match{' '}
                <i>
                  <u>typ</u>ically
                </i>{' '}
                and{' '}
                <i>
                  <u>typ</u>e
                </i>
                , but <strong>not</strong>{' '}
                <i>
                  <u>atyp</u>ical
                </i>
                .
              </li>
              <li>
                Your terms may include * wildcards; for example, the term{' '}
                <i>*typ</i> will match{' '}
                <i>
                  <u>typ</u>ically
                </i>
                ,{' '}
                <i>
                  <u>typ</u>e
                </i>
                , and{' '}
                <i>
                  a<u>typ</u>ical
                </i>
                .
              </li>
            </ul>
          </div>
        </HelpIcon>
      </div>
      {showFieldSelector && (
        <DataTableFilterSelector
          filterAttributes={props.filterAttributes}
          selectedColumnFilters={props.selectedColumnFilters}
          onColumnFilterChange={props.onColumnFilterChange}
          toggleFilterFieldSelector={toggleFilterFieldSelector}
          containerClassName="wdk-Answer-filterFieldSelector"
        />
      )}
    </>
  );
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
