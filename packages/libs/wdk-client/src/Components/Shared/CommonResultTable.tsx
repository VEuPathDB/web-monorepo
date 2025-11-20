import React, { Component, Fragment } from 'react';

import Mesa, {
  MesaState,
  Utils as MesaUtils,
} from '@veupathdb/coreui/lib/components/Mesa';
import {
  htmlStringValue,
  numericValue,
} from '@veupathdb/coreui/lib/components/Mesa/Utils/Utils';
import { RealTimeSearchBox } from '../../Components';
import { compose, debounce } from 'lodash/fp';
import type {
  MesaColumn,
  MesaSortObject,
  MesaStateProps,
} from '@veupathdb/coreui/lib/components/Mesa/types';

const simpleFilterPredicateFactory =
  (searchQuery: string) => (row: Record<string, string>) =>
    Object.values(row).some((entry) =>
      `${entry}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

interface CommonResultTableProps<Row extends Record<PropertyKey, any>> {
  emptyResultMessage: string;
  rows: Row[];
  columns: ColumnSettings<Row>[];
  initialSearchQuery?: string;
  initialSortColumnKey?: Extract<keyof Row, string>;
  initialSortDirection?: 'asc' | 'desc';
  fixedTableHeader?: boolean;
  pagination?: boolean;
  children?: any;
  showCount?: boolean;
  searchBoxHeader?: string;
}

export interface ColumnSettings<Row extends Record<PropertyKey, any>>
  extends MesaColumn<Row> {
  type?: 'number' | 'text' | 'html';
  sortType?: 'text' | 'number' | 'htmlText' | 'htmlNumber';
}

// TODO Refactor using hooks
export class CommonResultTable<
  Row extends Record<PropertyKey, any> = Record<string, any>
> extends Component<
  CommonResultTableProps<Row>,
  MesaStateProps<Row, Extract<keyof Row, string>>
> {
  constructor(props: CommonResultTableProps<Row>) {
    super(props);
    this.handleSearch = debounce(200, this.handleSearch.bind(this));
    this.handleSort = this.handleSort.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleRowsPerPageChange = this.handleRowsPerPageChange.bind(this);

    this.state = MesaState.create({
      rows: this.props.rows,
      columns: this.props.columns,
      options: this.props.fixedTableHeader
        ? {
            showCount:
              this.props.showCount === undefined ? true : this.props.showCount,
            toolbar: true,
          }
        : {
            showCount:
              this.props.showCount === undefined ? true : this.props.showCount,
            toolbar: true,
            useStickyHeader: true,
            tableBodyMaxHeight: '80vh',
          },
      uiState: {
        searchQuery: this.props.initialSearchQuery || '',
        sort: this.props.initialSortColumnKey
          ? ({
              columnKey: this.props.initialSortColumnKey,
              direction: this.props.initialSortDirection || 'asc',
            } as MesaSortObject<
              Extract<keyof Row, string> extends string
                ? Extract<keyof Row, string>
                : string
            >)
          : undefined,
        pagination: this.props.pagination
          ? {
              currentPage: 1,
              totalRows: this.props.rows.length,
              rowsPerPage: 20,
            }
          : undefined,
      },
      eventHandlers: {
        onSort: (
          { key }: { key: Extract<keyof Row, string> },
          direction: 'asc' | 'desc'
        ) => this.handleSort(key, direction),
        onPageChange: this.handlePageChange,
        onRowsPerPageChange: this.handleRowsPerPageChange,
      },
    });
  }

  componentDidUpdate(prevProps: CommonResultTableProps<Row>) {
    if (prevProps !== this.props) {
      this.setState((prevState: any, props: CommonResultTableProps<Row>) =>
        MesaState.setColumns(
          MesaState.setRows(prevState, props.rows),
          props.columns
        )
      );
    }
  }

  handleSearch(searchQuery: string) {
    const updatedTableState = MesaState.setSearchQuery(this.state, searchQuery);

    this.setState(updatedTableState);
  }

  handleSort(
    sortByKey: Extract<keyof Row, string>,
    sortDirection: 'asc' | 'desc'
  ) {
    const { setSortDirection, setSortColumnKey } = MesaState;
    const updatedTableState = setSortDirection(
      setSortColumnKey(this.state, sortByKey),
      sortDirection
    );

    this.setState(updatedTableState);
  }

  handlePageChange(pageNumber: number) {
    const currentUiState = MesaState.getUiState(this.state);
    const currentPagination = currentUiState.pagination!;
    const updatedTableState = MesaState.setUiState(this.state, {
      ...currentUiState,
      pagination: {
        ...currentPagination,
        currentPage: pageNumber,
      },
    });

    this.setState(updatedTableState);
  }

  handleRowsPerPageChange(rowsPerPage: number) {
    const currentUiState = MesaState.getUiState(this.state);
    const currentPagination = currentUiState.pagination!;
    const updatedTableState = MesaState.setUiState(this.state, {
      ...currentUiState,
      pagination: {
        ...currentPagination,
        rowsPerPage,
      },
    });

    this.setState(updatedTableState);
  }

  render() {
    const {
      getColumns,
      getFilteredRows,
      getUiState,
      setFilteredRows,
      setUiState,
    } = MesaState;
    const uiState = getUiState(this.state);
    const { searchQuery, sort } = uiState;
    const sortColumnKey = sort?.columnKey;
    const sortDirection = sort?.direction;

    const filteredState = searchQuery
      ? MesaState.filterRows(
          this.state,
          simpleFilterPredicateFactory(searchQuery)
        )
      : this.state;

    const allRows = MesaState.getRows(filteredState);
    const filteredRows = MesaState.getFilteredRows(filteredState);

    const filterCountedState = setUiState(filteredState, {
      ...MesaState.getUiState(filteredState),
      filteredRowCount: allRows.length - filteredRows.length,
    });

    const { currentPage = 1, rowsPerPage = 20 } =
      MesaState.getUiState(filteredState).pagination || {};
    const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
    const newCurrentPage = Math.min(currentPage, totalPages);

    const pagedRows = filteredRows.slice(
      (newCurrentPage - 1) * rowsPerPage,
      newCurrentPage * rowsPerPage
    );
    const pagedState = MesaState.getUiState(filteredState).pagination
      ? setUiState(setFilteredRows(filterCountedState, pagedRows), {
          ...MesaState.getUiState(filterCountedState),
          pagination: {
            ...MesaState.getUiState(filterCountedState).pagination!,
            currentPage: newCurrentPage,
            totalPages,
            totalRows: allRows.length,
          },
        })
      : filterCountedState;

    const { sortType = 'text' } =
      (getColumns(pagedState).find(
        ({ key }) => key === sortColumnKey
      ) as ColumnSettings<Row>) || {};
    const sortMethod = sortTypes[sortType] || sortTypes['text'];

    const unsortedRows = getFilteredRows(pagedState);
    const sortedRows = !sortColumnKey
      ? unsortedRows
      : sortMethod(unsortedRows, sortColumnKey, sortDirection === 'asc');

    const sortedState = setFilteredRows(pagedState, sortedRows);

    return (
      <Fragment>
        {this.props.rows.length ? (
          <Mesa state={sortedState}>
            <div className="wdk-RealTimeSearchBoxContainer">
              <span>{this.props.searchBoxHeader || null}</span>
              <RealTimeSearchBox
                className="enrichment-search-field"
                autoFocus={false}
                searchTerm={searchQuery}
                onSearchTermChange={this.handleSearch}
                placeholderText={''}
                helpText={'The entire table will be searched'}
              />
            </div>
            {this.props.children}
          </Mesa>
        ) : (
          <div className="enrich-empty-results">
            {this.props.emptyResultMessage}
          </div>
        )}
      </Fragment>
    );
  }
}

const sortTypes: Record<
  string,
  (rows: any[], key: string, ascending: boolean) => any[]
> = {
  number: MesaUtils.numberSort,
  text: MesaUtils.textSort,
  htmlText: MesaUtils.customSortFactory(
    htmlStringValue as (value: unknown) => string
  ),
  htmlNumber: MesaUtils.customSortFactory(
    compose(numericValue, htmlStringValue) as (value: unknown) => number
  ),
};
